// app/api/content/comments/reply/route.js

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoClient";
import { ObjectId } from "mongodb";

const COLLECTION_NAME = "contentComments";
const NOTIFICATION_COLLECTION_NAME = "userNotifications"; // 👈 NEW COLLECTION FOR NOTIFICATIONS

/**
 * POST: Add a new reply to an existing comment (UPDATED FOR NOTIFICATIONS)
 * Body: { contentId, text, parentCommentId }
 */
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "You must be logged in to reply." },
      { status: 401 }
    );
  }

  const { contentId, text, parentCommentId } = await request.json();

  if (!contentId || !text || text.trim().length === 0 || !parentCommentId) {
    return NextResponse.json(
      { message: "Comment text, content ID, and parent ID are required." },
      { status: 400 }
    );
  }

  try {
    const db = await connectDB();
    const collection = db.collection(COLLECTION_NAME);
    const parentObjectId = new ObjectId(parentCommentId);

    // 1. Fetch the parent comment to get owner ID (for notification) and rootCommentId
    const parentComment = await collection.findOne(
        { _id: parentObjectId },
        { projection: { rootCommentId: 1, userId: 1 } } 
    );
    
    if (!parentComment) {
      return NextResponse.json({ message: "Parent comment not found." }, { status: 404 });
    }

    const recipientId = parentComment.userId;
    const isSelfReply = recipientId === session.user.id;
    
    const rootCommentId = parentComment.rootCommentId || parentObjectId;

    // 2. Prepare the new reply document
    const newReply = {
      contentId,
      userId: session.user.id,
      userName: session.user.username || session.user.name || "Anonymous",
      userImage: session.user.avatar || session.user.image || "/default-avatar.png",
      text: text.trim(),
      createdAt: new Date(),
      parentId: parentObjectId, // Link to immediate parent
      rootCommentId: rootCommentId, // Link to the top-level comment
      likes: [],
      dislikes: [],
      replies: [], 
    };

    // 3. Insert the new reply
    const result = await collection.insertOne(newReply);
    const insertedId = result.insertedId;

    // 4. Update the immediate parent comment's replies array
    await collection.updateOne(
      { _id: parentObjectId },
      { $push: { replies: { $each: [insertedId], $position: 0 } } } 
    );
    
    // ⭐ NOTIFICATION CREATION LOGIC ⭐
    if (!isSelfReply) {
        const notificationCollection = db.collection(NOTIFICATION_COLLECTION_NAME);
        await notificationCollection.insertOne({
            recipientId: recipientId, // Owner of the parent comment
            senderId: session.user.id, // User who posted the reply
            type: 'REPLY', // Notification type
            contentId: contentId,
            commentId: parentObjectId, // Links to the parent comment
            replyId: insertedId, // Links to the newly created reply
            read: false,
            createdAt: new Date(),
        });
    }
    // ⭐ END NOTIFICATION LOGIC ⭐

    // 5. Return the full reply object
    const returnedReply = await collection.findOne({ _id: insertedId });

    return NextResponse.json(
      {
        message: "Reply posted successfully",
        reply: returnedReply,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("DB Error on POST reply:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
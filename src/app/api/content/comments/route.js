// app/api/content/comments/route.js

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoClient";
import { ObjectId } from "mongodb";

const COLLECTION_NAME = "contentComments";
const NOTIFICATION_COLLECTION_NAME = "userNotifications"; 
const COMMENTS_PER_PAGE = 10;

// ======================================================================
// Helper Function: getNestedReplies (UNCHANGED, relies on date sort for replies)
// ======================================================================

/**
 * Recursive function to fetch and nest replies to *unlimited* depth.
 * Accepts the sortOrder to apply to replies.
 */
async function getNestedReplies(db, parentComments, sortOrder) {
    if (parentComments.length === 0) {
        return [];
    }

    const collection = db.collection(COLLECTION_NAME);
    const parentIds = parentComments.map((c) => c._id);
    
    // 🔑 1. Replies are only sorted by date ('oldest' or 'latest')
    let sortObject = {};
    if (sortOrder === "oldest") {
        sortObject = { createdAt: 1 };
    } else { // All other sort orders (like 'most_likes') default to latest date for replies
        sortObject = { createdAt: -1 };
    }

    // 2. Fetch all DIRECT replies to the current batch of parents
    const replies = await collection
        .find({
            parentId: { $in: parentIds },
        })
        .sort(sortObject) // 🔑 Apply reply sorting
        .toArray();

    // 3. Map replies to their parents
    const repliesByParentId = replies.reduce((acc, reply) => {
        const parentId = reply.parentId.toHexString();
        if (!acc[parentId]) acc[parentId] = [];
        acc[parentId].push(reply);
        return acc;
    }, {});

    // 4. Recursively nest the next level of replies and assign them
    for (const parent of parentComments) {
        const directReplies = repliesByParentId[parent._id.toHexString()] || [];
        
        // RECURSE: Find children of the direct replies, passing the sortOrder down
        parent.replies = await getNestedReplies(db, directReplies, sortOrder);
        // Important: Assign the correct direct replies
        parent.replies.unshift(...directReplies.filter(r => !parent.replies.some(p => p._id.equals(r._id))));
    }
    
    // Sort logic for replies within the parent:
    // We manually re-sort replies here to ensure proper nested order after recursion
    return parentComments.map(comment => {
        // Find direct replies again
        const directReplies = replies.filter(r => r.parentId.equals(comment._id));
        
        // Recursively apply the sort to the children of the direct replies
        const sortedReplies = directReplies.sort((a, b) => {
            if (sortOrder === "oldest") return a.createdAt - b.createdAt;
            return b.createdAt - a.createdAt;
        }).map(reply => {
            // Reattach the nested replies (already processed by recursion)
            const fullReply = comment.replies.find(r => r._id.equals(reply._id));
            return fullReply || reply;
        });

        return { ...comment, replies: sortedReplies };
    });
}


// ======================================================================
// GET: Fetch comments (FIXED FOR MOST LIKES/DISLIKES/REPLIES)
// ======================================================================
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get("contentId");
    const pageParam = searchParams.get("page");
    // 🔑 Mapped: 'most_likes' -> likesCount, 'most_dislikes' -> dislikesCount, 'most_replies' -> repliesCount
    const sortOrderParam = searchParams.get("sort"); 

    if (!contentId) {
        return NextResponse.json({ message: "Missing contentId" }, { status: 400 });
    }

    const page = parseInt(pageParam) || 1;
    const skip = (page - 1) * COMMENTS_PER_PAGE;
    const filter = { contentId, parentId: null };

    // 🔑 Check if aggregation is needed for popular/counts
    const needsAggregation = 
        sortOrderParam === "most_likes" || 
        sortOrderParam === "most_dislikes" || 
        sortOrderParam === "most_replies";

    try {
        const db = await connectDB();
        const collection = db.collection(COLLECTION_NAME);

        // ----------------------------------------------------
        // 🔑 AGGREGATION BRANCH: For sorting by Likes/Dislikes/Replies Count
        // ----------------------------------------------------
        if (needsAggregation) {
            let sortField = "";
            if (sortOrderParam === "most_likes") sortField = "likesCount";
            else if (sortOrderParam === "most_dislikes") sortField = "dislikesCount";
            else if (sortOrderParam === "most_replies") sortField = "repliesCount";
            
            // 1. Get total count (Standard find for pagination)
            const totalTopLevelComments = await collection.countDocuments(filter);
            const totalPages = Math.ceil(totalTopLevelComments / COMMENTS_PER_PAGE);

            // 2. Use Aggregation
            let comments = await collection.aggregate([
                { $match: filter },
                { 
                    $addFields: { 
                        // Calculate sizes of the array fields
                        likesCount: { $size: { $ifNull: ["$likes", []] } },
                        dislikesCount: { $size: { $ifNull: ["$dislikes", []] } },
                        repliesCount: { $size: { $ifNull: ["$replies", []] } },
                    } 
                },
                // Sort by the calculated count field (descending), then by date
                { $sort: { [sortField]: -1, createdAt: -1 } }, 
                { $skip: skip },
                { $limit: COMMENTS_PER_PAGE }
            ]).toArray();
            
            // 3. Fetch nested replies (replies are sorted by LATEST/OLDEST date within the thread)
            comments = await getNestedReplies(db, comments, sortOrderParam);
            
            const totalComments = await collection.countDocuments({ contentId });

            return NextResponse.json({
                data: comments,
                page,
                totalPages,
                total: totalComments,
                perPage: COMMENTS_PER_PAGE,
            });
        } 
        
        // ----------------------------------------------------
        // STANDARD FIND BRANCH: For sorting by Latest/Oldest Date
        // ----------------------------------------------------
        else {
            let sortObject = { createdAt: -1 }; 
            if (sortOrderParam === "oldest") {
                sortObject = { createdAt: 1 };
            }

            const totalTopLevelComments = await collection.countDocuments(filter);
            const totalPages = Math.ceil(totalTopLevelComments / COMMENTS_PER_PAGE);

            let comments = await collection
                .find(filter)
                .sort(sortObject) 
                .skip(skip)
                .limit(COMMENTS_PER_PAGE)
                .toArray();

            // Fetch nested replies
            comments = await getNestedReplies(db, comments, sortOrderParam);
            
            const totalComments = await collection.countDocuments({ contentId });

            return NextResponse.json({
                data: comments,
                page,
                totalPages,
                total: totalComments,
                perPage: COMMENTS_PER_PAGE,
            });
        }

    } catch (error) {
        console.error("DB Error on GET comments:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// ======================================================================
// POST: Add a new TOP-LEVEL comment (UNCHANGED - No notification needed for self-post)
// ======================================================================
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) { 
    return NextResponse.json(
      { message: "You must be logged in to comment." },
      { status: 401 }
    );
  }

  const { contentId, text } = await request.json();

  if (!contentId || !text || text.trim().length === 0) {
    return NextResponse.json(
      { message: "Comment text and content ID are required." },
      { status: 400 }
    );
  }

  try {
    const db = await connectDB();
    const collection = db.collection(COLLECTION_NAME);
    
    const baseComment = {
      contentId,
      userId: session.user.id,
      userName: session.user.username || session.user.name || "Anonymous", 
      userImage: session.user.avatar || session.user.image || "/default-avatar.png", 
      text: text.trim(),
      createdAt: new Date(),
      parentId: null, // Top level
      likes: [],
      dislikes: [],
      replies: [],
    };

    const result = await collection.insertOne(baseComment);
    const insertedId = result.insertedId;

    await collection.updateOne(
        { _id: insertedId },
        { $set: { rootCommentId: insertedId } }
    );

    const returnedComment = await collection.findOne({ _id: insertedId });

    return NextResponse.json(
      {
        message: "Comment added successfully",
        comment: returnedComment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("DB Error on POST comment:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ======================================================================
// PATCH: Toggle Like or Dislike status (UPDATED FOR NOTIFICATIONS)
// ======================================================================
export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { commentId, action } = await request.json();
  const userId = session.user.id; // Sender ID

  if (!commentId || !["like", "dislike"].includes(action)) {
    return NextResponse.json(
      { message: "Missing commentId or invalid action." },
      { status: 400 }
    );
  }

  try {
    const db = await connectDB();
    const collection = db.collection(COLLECTION_NAME);
    const objectCommentId = new ObjectId(commentId);

    const comment = await collection.findOne({ _id: objectCommentId });
    if (!comment) {
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 }
      );
    }
    
    // Recipient ID is the comment owner's ID
    const recipientId = comment.userId;
    const isSelfAction = recipientId === userId;
    let notificationType = null;

    let update = { $set: {} };
    let message = "Interaction status updated.";
    const currentLikes = comment.likes || [];
    const currentDislikes = comment.dislikes || [];

    if (action === "like") {
      const isLiked = currentLikes.includes(userId);
      if (isLiked) {
        update.$pull = { likes: userId };
        message = "Comment unliked.";
      } else {
        update.$addToSet = { likes: userId };
        update.$pull = { dislikes: userId };
        message = "Comment liked.";
        if (!isSelfAction) notificationType = 'LIKE'; // 👈 Set Notification Type
      }
    } else if (action === "dislike") {
      const isDisliked = currentDislikes.includes(userId);
      if (isDisliked) {
        update.$pull = { dislikes: userId };
        message = "Comment un-disliked.";
      } else {
        update.$addToSet = { dislikes: userId };
        update.$pull = { likes: userId };
        message = "Comment disliked.";
        if (!isSelfAction) notificationType = 'DISLIKE'; // 👈 Set Notification Type
      }
    }
    
    if (Object.keys(update.$pull || {}).length === 0) delete update.$pull;
    if (Object.keys(update.$addToSet || {}).length === 0) delete update.$addToSet;
    if (Object.keys(update.$set || {}).length === 0) delete update.$set;
    
    if (Object.keys(update).length > 0) {
        await collection.updateOne({ _id: objectCommentId }, update);
    }

    // ⭐ NOTIFICATION CREATION LOGIC ⭐
    if (notificationType) {
        const notificationCollection = db.collection(NOTIFICATION_COLLECTION_NAME);
        await notificationCollection.insertOne({
            recipientId: recipientId,
            senderId: userId,
            type: notificationType, 
            contentId: comment.contentId,
            commentId: objectCommentId,
            read: false,
            createdAt: new Date(),
        });
    }
    // ⭐ END NOTIFICATION LOGIC ⭐

    return NextResponse.json({ message, commentId }, { status: 200 });
  } catch (error) {
    console.error("DB Error on PATCH comment interaction:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ======================================================================
// DELETE: Remove a comment (UNCHANGED)
// ======================================================================
export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { commentId } = await request.json();

  if (!commentId) {
    return NextResponse.json({ message: "Missing commentId" }, { status: 400 });
  }

  try {
    const db = await connectDB();
    const collection = db.collection(COLLECTION_NAME);
    const objectCommentId = new ObjectId(commentId);
    const userId = session.user.id;

    const commentToDelete = await collection.findOne({ _id: objectCommentId });

    if (!commentToDelete || commentToDelete.userId !== userId) {
      return NextResponse.json(
        { message: "Comment not found or unauthorized to delete." },
        { status: 403 }
      );
    }
    
    let idsToDelete = [objectCommentId];
    
    if (!commentToDelete.parentId) {
        // Find ALL descendants using $graphLookup
        const descendantResults = await collection.aggregate([
          { $match: { _id: objectCommentId } },
          {
            $graphLookup: {
              from: COLLECTION_NAME,
              startWith: "$_id",
              connectFromField: "_id",
              connectToField: "parentId",
              as: "descendants",
              maxDepth: 10,
            },
          },
          { $project: { descendants: "$descendants._id" } }
        ]).toArray();

        if (descendantResults.length > 0) {
            idsToDelete.push(...descendantResults[0].descendants);
        }
    }

    // 2. Remove comment ID from parent's replies array, if applicable
    if (commentToDelete.parentId) {
      await collection.updateOne(
        { _id: commentToDelete.parentId },
        { $pull: { replies: objectCommentId } }
      );
    }
    
    // 3. Delete the entire tree structure or the single comment
    await collection.deleteMany({ _id: { $in: idsToDelete } });

    // NOTE: You might want to delete associated notifications here too!
    
    return NextResponse.json({
      message: "Comment and its replies deleted successfully",
    });
  } catch (error) {
    console.error("DB Error on DELETE comment:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
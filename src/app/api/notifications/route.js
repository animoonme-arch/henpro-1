import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoClient";

const NOTIFICATION_COLLECTION = "userNotifications";
const USER_COLLECTION = "users";

export async function GET() {
  const session = await getServerSession(authOptions);
  const recipientId = session?.user?.id;

  if (!recipientId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const db = await connectDB();
    const notifications = await db
      .collection(NOTIFICATION_COLLECTION)
      .aggregate([
        { $match: { recipientId } },
        { $sort: { createdAt: -1 } },
        { $limit: 50 },
        {
          $lookup: {
            from: USER_COLLECTION,
            localField: "senderId",
            foreignField: "id",
            as: "senderDetails",
          },
        },
        { $unwind: { path: "$senderDetails", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: { $toString: "$_id" },
            type: 1,
            contentId: 1,
            commentId: { $toString: "$commentId" },
            replyId: { $toString: "$replyId" },
            read: 1,
            createdAt: 1,
            senderId: 1,
            senderName: "$senderDetails.username",
            senderImage: "$senderDetails.image",
          },
        },
      ])
      .toArray();

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

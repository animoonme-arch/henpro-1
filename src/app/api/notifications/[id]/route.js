import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoClient";
import { ObjectId } from "mongodb";

const NOTIFICATION_COLLECTION = "userNotifications";

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const notificationId = params.id;
  try {
    const db = await connectDB();
    const result = await db.collection(NOTIFICATION_COLLECTION).updateOne(
      { _id: new ObjectId(notificationId), recipientId: session.user.id },
      { $set: { read: true } }
    );

    if (result.matchedCount === 0)
      return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json({ message: "Marked as read" });
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

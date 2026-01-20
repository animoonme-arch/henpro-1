import { connectDB } from "@/lib/mongoClient";
import crypto from "crypto";
import nodemailer from "nodemailer";

export const POST = async (req) => {
  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ message: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const users = db.collection("users");

    const user = await users.findOne({ email });

    if (!user) {
      return new Response(
        JSON.stringify({ message: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    /* =========================
       Generate reset token
    ========================= */
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          resetToken,
          resetTokenExpiry,
        },
      }
    );

    /* =========================
       Send Reset Email
    ========================= */
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset.</p>
        <p>
          Click <a href="${resetLink}">here</a> to reset your password.
        </p>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    return new Response(
      JSON.stringify({ message: "Password reset email sent!" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Password reset error:", error);

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

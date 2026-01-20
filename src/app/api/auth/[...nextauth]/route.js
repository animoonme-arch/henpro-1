import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { connectDB } from "@/lib/mongoClient";
import { imageData } from "@/data/imageData";

/* =========================
   Helpers
========================= */
const getRandomImage = () => {
  const categories = Object.keys(imageData.hashtags);
  const randomCategory =
    categories[Math.floor(Math.random() * categories.length)];
  const images = imageData.hashtags[randomCategory].images;
  return images[Math.floor(Math.random() * images.length)];
};

/* =========================
   Auth Options
========================= */
export const authOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        username: { label: "Username", type: "text" },
        avatar: { label: "Avatar", type: "text" },
        bio: { label: "Bio", type: "text" },
        profileUpdate: { label: "Profile Update", type: "checkbox" },
      },

      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("EMAIL_REQUIRED");
        }

        const db = await connectDB();
        const users = db.collection("users");

        const user = await users.findOne({
          email: credentials.email,
        });

        if (!user) {
          throw new Error("USER_NOT_FOUND");
        }

        /* =========================
           PROFILE UPDATE FLOW
        ========================= */
        if (credentials.profileUpdate === "true") {
          const updatedUser = {
            username: credentials.username || user.username,
            avatar: credentials.avatar || user.avatar,
            bio: credentials.bio || user.bio,
          };

          await users.updateOne(
            { _id: user._id },
            { $set: updatedUser }
          );

          return {
            id: user._id.toString(),
            email: user.email,
            username: updatedUser.username,
            avatar: updatedUser.avatar || getRandomImage(),
            bio: updatedUser.bio || "",
            timeOfJoining: user.timeOfJoining,
          };
        }

        /* =========================
           LOGIN FLOW
        ========================= */
        const isValid = await compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("INVALID_CREDENTIALS");
        }

        let avatar = user.avatar;
        if (!avatar) {
          avatar = getRandomImage();
          await users.updateOne(
            { _id: user._id },
            { $set: { avatar } }
          );
        }

        return {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          avatar,
          bio: user.bio || "",
          timeOfJoining: user.timeOfJoining,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.avatar = user.avatar;
        token.bio = user.bio || "";
        token.timeOfJoining = user.timeOfJoining;
      }

      if (trigger === "update" && session) {
        if (session.username) token.username = session.username;
        if (session.avatar) token.avatar = session.avatar;
        if (session.bio !== undefined) token.bio = session.bio;
        if (session.email) token.email = session.email;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.username = token.username;
      session.user.avatar = token.avatar;
      session.user.bio = token.bio || "";
      session.user.timeOfJoining = token.timeOfJoining;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};

/* =========================
   Handler
========================= */
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

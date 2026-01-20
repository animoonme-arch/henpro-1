import BioClient from "@/components/BioClient/BioClient";
import { connectDB } from "@/lib/mongoClient";

/* =========================
   Helpers
========================= */
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* =========================
   Metadata
========================= */
export async function generateMetadata({ params }) {
  const username = params.id;

  try {
    const db = await connectDB();
    const user = await db
      .collection("users")
      .findOne({ username });

    if (user) {
      const capitalized = capitalize(user.username || username);

      return {
        title: `${capitalized}'s Profile | Bio Link`,
        description: `Check out ${capitalized}'s profile and explore their content.`,
      };
    }
  } catch (_) {
    // silent fallback
  }

  return {
    title: `${capitalize(username)}'s Profile | Bio Link`,
    description: "Explore this user's Bio Link page.",
  };
}

/* =========================
   Page
========================= */
export default async function BioPage({ params }) {
  const username = params.id;
  const db = await connectDB();

  /* =========================
     1. USER
  ========================= */
  let userData = null;

  try {
    userData = await db
      .collection("users")
      .findOne({ username });
  } catch (_) {}

  const user = userData
    ? {
        id: userData._id.toString(),
        email: userData.email || "",
        username: capitalize(userData.username),
        avatar: userData.avatar || "",
        bio: userData.bio || "",
        referredBy: userData.referredBy || null,
      }
    : {
        id: "",
        email: "",
        username: capitalize(username),
        avatar: "",
        bio: "",
        referredBy: null,
      };

  /* =========================
     2. CREATOR
  ========================= */
  let creator = null;

  try {
    const creatorData = await db
      .collection("creators")
      .findOne({ username });

    if (creatorData) {
      creator = {
        username,
        adsterraSmartlink: creatorData.adsterraSmartlink || "",
        creatorApiKey: creatorData.creatorApiKey || "",
        instagramId: creatorData.instagramId || "",
      };
    }
  } catch (_) {}

  /* =========================
     3. ACCOUNTS
  ========================= */
  let accountsDoc = null;

  try {
    accountsDoc = await db
      .collection("accounts")
      .findOne({ _id: "main" }); // single-document pattern
  } catch (_) {}

  let selectedAccount = "account1";
  if (username === "SauseKing") selectedAccount = "account2";
  if (username === "SauseLord") selectedAccount = "account3";

  const accountData = accountsDoc?.[selectedAccount] || [];

  const accounts = {
    accountName: selectedAccount,
    batches: accountData.map((batch) => ({
      batch: batch.batch || "",
      startDate: batch.startDate || null,
      posts: (batch.posts || [])
        .map((post) => ({
          ...post,
          postingTime: post.postingTime
            ? new Date(post.postingTime).toISOString()
            : null,
        }))
        .reverse(),
    })),
  };

  /* =========================
     4. DESIGN
  ========================= */
  let design = "";

  try {
    const linkData = await db
      .collection("links")
      .findOne({ username });

    if (linkData) {
      design = linkData.design || "";
    }
  } catch (_) {}

  /* =========================
     Render
  ========================= */
  return (
    <BioClient
      user={user}
      creator={creator}
      accounts={accounts}
      design={design}
    />
  );
}

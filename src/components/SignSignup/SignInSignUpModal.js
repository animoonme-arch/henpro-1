"use client";
import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { imageData } from "@/data/imageData"; // Assuming this path is correct
import "./signmodal.css";
// ⭐️ IMPORT useSearchParams
// import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineClose,
} from "react-icons/ai";
import Link from "next/link";
import { useRouter } from "next/navigation";

// /watch

const getRandomImage = () => {
  const categories = Object.keys(imageData.hashtags);
  const randomCategory =
    categories[Math.floor(Math.random() * categories.length)];
  const images = imageData.hashtags[randomCategory].images;
  return images[Math.floor(Math.random() * images.length)];
};

const SignInSignUpModal = (props) => {
  const [isSignUp, setIsSignUp] = useState(props.landing ? true : false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { data: session } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // ⭐️ Retrieve the creator parameter
  // const searchParams = useSearchParams();
  const creator = props.creator;

  // ⭐️ Helper function to append the creator parameter to a URL
  const getUpdatedLink = (baseLink) => {
    if (!creator) return baseLink;

    const separator = baseLink.includes("?") ? "&" : "?";
    return `${baseLink}${separator}creator=${creator}`;
  };
  // --------------------------------------------------------

  useEffect(() => {
    if (isSignUp) setAvatar(getRandomImage());
  }, [isSignUp]);

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
    setUsername("");
    router.refresh();
  };

  const handleSignUp = async () => {
    setLoading(true);

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      toast.error(
        "Username must be 3–30 characters and contain only letters, numbers, or underscores."
      );
      setLoading(false);
      return;
    }

    // ⭐️ Use creator for registration referral, falling back to props.refer for compatibility
    const referralId = creator || props.refer;

    const payload = {
      email,
      password,
      username,
      avatar,
      // ⭐️ Include creator/referralId in the payload if valid
      ...(referralId &&
        /^[a-zA-Z0-9_]{3,30}$/.test(referralId) && { refer: referralId }),
    };

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) return toast.error(data.message || "Sign-up failed!");

    toast.success("Account created successfully!");
    await signIn("credentials", { email, password, redirect: false });
  };

  const handleSignIn = async () => {
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      if (result.error.includes("USER_NOT_FOUND")) {
        toast.error("No account found! Switching to sign-up.");
        setIsSignUp(true);
        return;
      }

      if (result.error.includes("INVALID_CREDENTIALS")) {
        return toast.error("Incorrect password. Try again.");
      }

      return toast.error(result.error);
    }

    toast.success("Logged in successfully!");
    props.setLogIsOpen(false); // Close modal on successful sign-in
  };

  const handleSignOut = async () => {
    setLoading(true);
    await signOut({ redirect: false });
    setLoading(false);
    toast.success("Signed out successfully!");
    props.setLogIsOpen(false); // Close modal on sign-out
  };

  const handleForgotPassword = async () => {
    if (!email) return toast.error("Enter your email to reset password");

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok)
      return toast.error(data.message || "Failed to send reset link");
    toast.success("Password reset email sent! Check your inbox.");
  };

  return (
    <div
      className="modal"
      style={{
        zIndex: props.logIsOpen ? 100 : -100,
        opacity: props.logIsOpen ? 1 : 0,
      }}
      onClick={() => props.setLogIsOpen(false)}
    >
      <div
        className="modal-content"
        style={{
          position: "relative",
          transform: props.logIsOpen ? "translateX(0px)" : "translateX(1000px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => props.setLogIsOpen(false)}
          className="close-button"
          aria-label="Close"
        >
          <AiOutlineClose />
        </button>

        {session ? (
          <>
            <p className="heddio">Welcome, {session.user.username}!</p>
            <img
              src={session?.user.avatar?.replace(
                "https://img.flawlessfiles.com/_r/100x100/100/avatar/",
                "https://cdn.noitatnemucod.net/avatar/100x100/"
              )}
              alt="Profile"
              className="profile-avatar"
            />
            {!props.landing ? (
              <Link
                // ⭐️ Applied creator logic
                href={getUpdatedLink("/user/profile")}
                style={{
                  backgroundColor: "#ff9741", // New Theme Color
                  color: "#1a1a1a",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "all 0.2s ease-in-out",
                  display: "inline-block",
                }}
              >
                Visit Profile
              </Link>
            ) : (
              <button
                onClick={handleSignOut}
                disabled={loading}
                style={{
                  backgroundColor: "#ff9741", // New Theme Color
                  color: "#1a1a1a",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: 600,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  transition: "all 0.2s ease-in-out",
                }}
              >
                {loading ? "Signing Out..." : "Sign Out"}
              </button>
            )}
          </>
        ) : (
          <form onSubmit={(e) => e.preventDefault()} autoComplete="on">
            <div className="heddp">
              <h2 className="heddio">
                {isSignUp ? "Create an Account" : "Welcome back!"}
              </h2>
            </div>

            {isSignUp && (
              <div className="midO">
                <div className="midOT">USERNAME</div>
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  className="midOI"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}

            <div className="midO">
              <div className="midOT">EMAIL ADDRESS</div>
              <input
                type="email"
                name="email"
                autoComplete="email"
                className="midOI"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="midO">
              <div className="midOT">PASSWORD</div>
              <div className="relati">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  className="midOI midN"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="icon-position"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible size={20} />
                  ) : (
                    <AiOutlineEye size={20} />
                  )}
                </button>
              </div>
            </div>

            <div className="midI">
              <label className="kinto">
                <input
                  type="checkbox"
                  className="checki"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember Me
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="kinto forget-pass"
              >
                Forgot Password?
              </button>
            </div>

            {/* Single Div Button */}
            <div
              className="btiom"
              role="button"
              tabIndex={0}
              onClick={() => {
                if (!loading) isSignUp ? handleSignUp() : handleSignIn();
              }}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !loading) {
                  isSignUp ? handleSignUp() : handleSignIn();
                }
              }}
              style={{
                opacity: loading ? 0.7 : 1,
                pointerEvents: loading ? "none" : "auto",
              }}
            >
              {loading ? "Hang in there..." : isSignUp ? "Register" : "Login"}
            </div>

            <div className="line-up">
              <div className="kinto">
                <div>
                  {isSignUp
                    ? "Already have an account?"
                    : "Don't have an account?"}
                </div>
                <div className="forget-pass" onClick={toggleMode}>
                  {isSignUp ? "Login" : "Register"}
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignInSignUpModal;

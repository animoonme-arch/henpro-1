"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  FaTrashAlt,
  FaCommentDots,
  FaPaperPlane,
  FaReply,
  FaThumbsUp,
  FaThumbsDown,
} from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Link from "next/link";
import "./CommentSection.css"; // Ensure this includes the highlightPulse CSS
import SignInSignUpModal from "../SignSignup/SignInSignUpModal";

// --- THEME CONSTANTS ---
const GLOW_ACCENT = "#00FFFF"; // Bright Cyan/Aqua
const BUTTON_BG = "#007bff"; // Standard button blue
const DARK_BG = "#1e1e1e"; // Dark background

// Define how many replies to show per load/initially
const REPLY_CHUNK_SIZE = 3;

// ======================================================================
// UTILITY: Time-Ago Formatting (Unchanged)
// ======================================================================
const formatDateToTimeAgo = (dateString) => {
  // ... (Your time formatting logic here) ...
  if (!dateString) return "Unknown date";

  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  let interval = seconds / 31536000;
  if (interval >= 1) {
    return (
      Math.floor(interval) +
      " year" +
      (Math.floor(interval) > 1 ? "s" : "") +
      " ago"
    );
  }
  interval = seconds / 2592000;
  if (interval >= 1) {
    return (
      Math.floor(interval) +
      " month" +
      (Math.floor(interval) > 1 ? "s" : "") +
      " ago"
    );
  }
  interval = seconds / 86400;
  if (interval >= 1) {
    return (
      Math.floor(interval) +
      " day" +
      (Math.floor(interval) > 1 ? "s" : "") +
      " ago"
    );
  }
  interval = seconds / 3600;
  if (interval >= 1) {
    return (
      Math.floor(interval) +
      " hour" +
      (Math.floor(interval) > 1 ? "s" : "") +
      " ago"
    );
  }
  interval = seconds / 60;
  if (interval >= 1) {
    return (
      Math.floor(interval) +
      " minute" +
      (Math.floor(interval) > 1 ? "s" : "") +
      " ago"
    );
  }
  return Math.floor(seconds) <= 10
    ? "just now"
    : Math.floor(seconds) +
    " second" +
    (Math.floor(seconds) > 1 ? "s" : "") +
    " ago";
};

// ======================================================================
// 1. Comment Component (Unchanged)
// ======================================================================
const Comment = React.forwardRef(
  (
    {
      comment,
      userId,
      onDelete,
      onLikeToggle,
      onDislikeToggle,
      onReply,
      depth = 0,
      targetId, // Passed for deep-link check
    },
    ref
  ) => {
    const isOwner = comment.userId === userId;
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [replyingToUser, setReplyingToUser] = useState(
      comment?.userName || ""
    );
    const [visibleReplies, setVisibleReplies] = useState(0);

    const replies = comment?.replies || [];
    const totalReplies = replies.length;
    const hasMoreReplies = totalReplies > visibleReplies;
    const formattedDate = useMemo(
      () => formatDateToTimeAgo(comment.createdAt),
      [comment.createdAt]
    );
    const isTarget = comment._id === targetId;

    const handleReplyPosted = useCallback(
      () => setVisibleReplies(totalReplies + 1),
      [totalReplies]
    );

    const handleReplySubmit = (e) => {
      e.preventDefault();
      let textToSubmit = replyText.trim();
      if (textToSubmit) {
        const fullReplyText = `@${replyingToUser} ${textToSubmit}`;
        onReply(comment._id, fullReplyText, handleReplyPosted);
        setReplyText("");
        setIsReplying(false);
      }
    };

    const handleLoadMoreReplies = () =>
      setVisibleReplies((prev) =>
        Math.min(totalReplies, prev + REPLY_CHUNK_SIZE)
      );
    const handleShowInitialReplies = () =>
      setVisibleReplies(Math.min(totalReplies, REPLY_CHUNK_SIZE));
    const handleCollapseReplies = () => setVisibleReplies(0);

    const handleDelete = () => {
      if (!window.confirm("Are you sure you want to delete this comment?"))
        return;
      onDelete(comment._id);
    };

    const handleReplyClick = () => {
      setReplyingToUser(comment?.userName || "");
      setIsReplying((prev) => !prev);
      setReplyText("");
    };

    // 🔑 DEEP LINK OPENER EFFECT (Ensure the reply is rendered for scrolling)
    useEffect(() => {
      if (targetId && depth === 0 && replies.length > 0) {
        const isTargetReply = replies.some((reply) => reply._id === targetId);

        if (isTargetReply) {
          // Automatically open all replies to ensure the target is rendered
          setVisibleReplies(totalReplies);
        }
      }
    }, [targetId, replies.length, depth, totalReplies]); // Dependencies ensure this runs when comments load

    const isLiked = comment.likes?.includes(userId);
    const isDisliked = comment.dislikes?.includes(userId);

    const displayCommentText = useMemo(() => {
      const text = comment?.text || "";

      // Handle replies (mentions)
      if (depth > 0 && text.startsWith("@")) {
        const parts = text.match(/^@(\S+)\s*(.*)/s);
        if (parts && parts[1]) {
          const mentionedUser = parts[1];
          const actualText = parts[2] || "";

          return (
            <div
              className="comment-text"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
                fontFamily: "'Inter', 'Roboto', sans-serif",
                fontSize: "14.5px",
                lineHeight: "1.7",
                color: "#ddd",
                wordBreak: "break-word",
                marginBottom: "10px",
              }}
            >
              <span
                className="reply-target"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  color: GLOW_ACCENT,
                  fontWeight: "600",
                }}
              >
                <FaReply size={13} />
                <span
                  className="reply-link"
                  title={`Replied to ${mentionedUser}`}
                  style={{
                    cursor: "pointer",
                    textDecoration: "none",
                  }}
                >
                  @{mentionedUser}
                </span>
              </span>

              <span
                style={{
                  color: "#ccc",
                  fontWeight: "400",
                  fontFamily: "'Inter', 'Noto Sans', sans-serif",
                }}
              >
                {actualText}
              </span>
            </div>
          );
        }
      }

      return (
        <p
          className="comment-text"
          style={{
            fontFamily: "'Inter', 'Roboto', sans-serif",
            fontSize: "14.5px",
            lineHeight: "1.7",
            color: "#ddd",
            wordBreak: "break-word",
            marginBottom: "10px",
          }}
        >
          {text}
        </p>
      );
    }, [comment.text, depth]);

    // Dynamic Glow Style for action buttons (Unchanged)
    const getActionButtonStyle = (isActive, baseColor) => ({
      backgroundColor: "transparent",
      color: isActive ? baseColor : "#ccc",
      border: isActive ? `1px solid ${baseColor}` : "1px solid #444",
      boxShadow: isActive
        ? `0 0 5px ${baseColor}, 0 0 5px ${baseColor} inset`
        : "none",
      transition: "all 0.3s ease",
      marginRight: "8px",
      padding: "6px 10px",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
    });

    return (
      <div
        className={`comment-card depth-${depth} ${isTarget ? "highlight-target" : ""
          }`}
        id={comment._id}
        ref={ref}
        style={{
          backgroundColor: DARK_BG,
          color: "#eee",
          border: depth <= 1 ? `1px solid ${GLOW_ACCENT}30` : "none",
          boxShadow: depth === 0 ? `0 0 12px ${GLOW_ACCENT}25` : "none",
          padding: depth <= 1 ? "15px" : "10px 0",
          marginBottom: "15px",
          borderRadius: "10px",
          transition: "all 0.3s ease",
          overflowWrap: "break-word",
        }}
        // Re-added glow effects to non-target comments
        onMouseEnter={(e) => {
          if (depth <= 1 && !isTarget)
            e.currentTarget.style.boxShadow = `0 0 18px ${GLOW_ACCENT}40`;
        }}
        onMouseLeave={(e) => {
          if (depth <= 1 && !isTarget)
            e.currentTarget.style.boxShadow = `0 0 12px ${GLOW_ACCENT}25`;
        }}
      >
        {/* ... (Header, Avatar, Text, Reply form are the same as before) ... */}

        <div
          className="comment-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <div
            className="user-info"
            style={{
              display: "flex",
              alignItems: "center",
              flex: "1 1 auto",
              minWidth: "180px",
            }}
          >
            <Image
              src={comment?.userImage || "/default-avatar.png"}
              alt={comment?.userName}
              width={35}
              height={35}
              className="user-avatar"
              style={{
                borderRadius: "50%",
                marginRight: "10px",
                border: `2px solid ${GLOW_ACCENT}`,
                flexShrink: 0,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.08)";
                e.currentTarget.style.boxShadow = `0 0 10px ${GLOW_ACCENT}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <span
              className="user-name"
              style={{
                color: GLOW_ACCENT,
                fontWeight: "bold",
                fontSize: "14px",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {comment?.userName}
            </span>
          </div>

          <div
            className="comment-meta"
            style={{
              color: "#aaa",
              fontSize: "12px",
              flexShrink: 0,
              textAlign: "right",
            }}
          >
            {formattedDate}
          </div>
        </div>

        <div
          className="comment-text"
          style={{
            fontFamily: `"Poppins", "Inter", "Segoe UI", Roboto, sans-serif`,
            fontSize: "15px",
            lineHeight: "1.8",
            color: "#e0e0e0",
            letterSpacing: "0.3px",
            wordBreak: "break-word",
            marginBottom: "12px",
            background: "rgba(255, 255, 255, 0.03)",
            padding: "10px 12px",
            borderRadius: "8px",
            border: `1px solid ${GLOW_ACCENT}15`,
            boxShadow: `inset 0 0 10px ${GLOW_ACCENT}10`,
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `inset 0 0 12px ${GLOW_ACCENT}25`;
            e.currentTarget.style.border = `1px solid ${GLOW_ACCENT}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = `inset 0 0 10px ${GLOW_ACCENT}10`;
            e.currentTarget.style.border = `1px solid ${GLOW_ACCENT}15`;
          }}
        >
          {comment?.text}{" "}
        </div>

        {/* Action buttons (Like/Dislike/Reply/Delete) are the same */}
        <div
          className="comment-actions"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginTop: "8px",
          }}
        >
          {/* Like */}
          <button
            onClick={() => onLikeToggle(comment?._id)}
            style={getActionButtonStyle(
              comment.likes?.includes(userId),
              "#28a745"
            )}
            title="Like"
            className="comment-action-btn"
          >
            <FaThumbsUp style={{ marginRight: "5px" }} />
            <span>{comment?.likes?.length || 0}</span>
          </button>

          {/* Dislike */}
          <button
            onClick={() => onDislikeToggle(comment?._id)}
            style={getActionButtonStyle(
              comment.dislikes?.includes(userId),
              "#dc3545"
            )}
            title="Dislike"
            className="comment-action-btn"
          >
            <FaThumbsDown style={{ marginRight: "5px" }} />
            <span>{comment?.dislikes?.length || 0}</span>
          </button>

          {/* Reply */}
          <button
            onClick={handleReplyClick}
            style={getActionButtonStyle(isReplying, GLOW_ACCENT)}
            title="Reply"
            className="comment-action-btn"
          >
            <FaReply style={{ marginRight: "5px" }} /> Reply
          </button>

          {/* Delete (owner only) */}
          {isOwner && (
            <button
              onClick={handleDelete}
              style={getActionButtonStyle(false, "#dc3545")}
              title="Delete Comment"
              className="comment-action-btn"
            >
              <FaTrashAlt />
            </button>
          )}
        </div>

        {isReplying && (
          <form
            className="reply-form"
            onSubmit={handleReplySubmit}
            style={{
              marginTop: "18px",
              padding: "15px",
              borderLeft: `2px solid ${GLOW_ACCENT}80`,
              background: "rgba(20, 20, 20, 0.8)",
              borderRadius: "6px",
              boxShadow: `0 0 10px ${GLOW_ACCENT}20`,
              transition: "box-shadow 0.3s ease, transform 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow = `0 0 15px ${GLOW_ACCENT}60`)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow = `0 0 10px ${GLOW_ACCENT}20`)
            }
          >
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Replying to ${replyingToUser}...`}
              maxLength={200}
              rows={2}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: `1px solid ${GLOW_ACCENT}70`,
                borderRadius: "4px",
                resize: "vertical",
                backgroundColor: "#252525",
                color: "#fff",
                marginBottom: "10px",
                outline: "none",
                fontSize: "14px",
                transition: "all 0.3s ease",
                boxShadow: `inset 0 0 5px ${GLOW_ACCENT}30`,
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = `1px solid ${GLOW_ACCENT}`;
                e.currentTarget.style.boxShadow = `0 0 10px ${GLOW_ACCENT}70`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = `1px solid ${GLOW_ACCENT}70`;
                e.currentTarget.style.boxShadow = `inset 0 0 5px ${GLOW_ACCENT}30`;
              }}
            />

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="submit"
                disabled={!replyText.trim()}
                style={{
                  flexGrow: 1,
                  padding: "8px 15px",
                  backgroundColor: replyText.trim() ? GLOW_ACCENT : "#444",
                  color: DARK_BG,
                  border: "none",
                  borderRadius: "4px",
                  cursor: replyText.trim() ? "pointer" : "not-allowed",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  boxShadow: replyText.trim()
                    ? `0 0 8px ${GLOW_ACCENT}70`
                    : "none",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (replyText.trim()) {
                    e.currentTarget.style.boxShadow = `0 0 15px ${GLOW_ACCENT}`;
                    e.currentTarget.style.transform = "scale(1.03)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 8px ${GLOW_ACCENT}70`;
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <FaPaperPlane style={{ marginRight: "5px" }} /> Post Reply
              </button>

              <button
                type="button"
                onClick={() => setIsReplying(false)}
                style={{
                  flexGrow: 1,
                  padding: "8px 15px",
                  backgroundColor: "#555",
                  color: "#eee",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#777")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#555")
                }
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {totalReplies > 0 && visibleReplies === 0 && (
          <button
            onClick={handleShowInitialReplies}
            className="view-more-replies-btn initial-view-btn"
            style={{
              marginTop: "10px",
              padding: "5px 10px",
              border: `1px solid ${GLOW_ACCENT}`,
              backgroundColor: "transparent",
              color: GLOW_ACCENT,
              borderRadius: "4px",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
          >
            View {totalReplies} {totalReplies > 1 ? "replies" : "reply"}
          </button>
        )}

        {visibleReplies > 0 && (
          <div className="comment-replies" style={{ marginTop: "10px" }}>
            {replies.slice(0, visibleReplies).map((reply) => (
              <Comment
                key={reply._id}
                comment={reply}
                userId={userId}
                onDelete={onDelete}
                onLikeToggle={onLikeToggle}
                onDislikeToggle={onDislikeToggle}
                onReply={onReply}
                depth={depth + 1}
                targetId={targetId}
              />
            ))}

            <div
              className="reply-control-actions"
              style={{ display: "flex", gap: "10px", marginTop: "10px" }}
            >
              {hasMoreReplies ? (
                <button
                  onClick={handleLoadMoreReplies}
                  className="view-more-replies-btn"
                  style={{
                    padding: "5px 10px",
                    border: `1px solid ${GLOW_ACCENT}`,
                    backgroundColor: "transparent",
                    color: GLOW_ACCENT,
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  View{" "}
                  {Math.min(REPLY_CHUNK_SIZE, totalReplies - visibleReplies)}{" "}
                  more replies
                </button>
              ) : (
                totalReplies > REPLY_CHUNK_SIZE && (
                  <button
                    onClick={handleCollapseReplies}
                    className="view-more-replies-btn collapse"
                    style={{
                      padding: "5px 10px",
                      border: "1px solid #777",
                      backgroundColor: "transparent",
                      color: "#aaa",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Collapse replies ({totalReplies} total)
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);
Comment.displayName = "Comment";

// 

// ======================================================================
// 2. CommentSection Component (Fixes/Updates for Sorting)
// ======================================================================
const CommentSection = ({ contentId, showToast , creator }) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // 🔑 SORT ORDER STATE (Kept 'latest' as default)
  const [sortOrder, setSortOrder] = useState("latest");

  // 🔑 DEEP LINK STATES
  const [targetCommentId, setTargetCommentId] = useState(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  const isLoadingRef = React.useRef(isLoading);
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // HOOK: Read the URL hash once on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.substring(1);
      if (hash && hash.length >= 10) {
        setTargetCommentId(hash);
        setHasScrolled(false);
      }
    }
  }, []);

  const updateCommentState = useCallback((commentList, commentId, updateFn) => {
    // ... (Comment update logic remains the same)
    return commentList
      .map((comment) => {
        if (comment._id === commentId) {
          const updatedComment = updateFn(comment);
          return updatedComment === null ? null : updatedComment;
        }
        if (comment.replies && comment.replies.length > 0) {
          const updatedReplies = updateCommentState(
            comment.replies,
            commentId,
            updateFn
          );
          if (
            updatedReplies.length !== comment.replies.length ||
            updatedReplies !== comment.replies
          ) {
            return { ...comment, replies: updatedReplies };
          }
        }
        return comment;
      })
      .filter((c) => c !== null);
  }, []);

  // --- Fetch Comments ---
  const fetchComments = useCallback(
    async (pageToFetch = 1, append = false) => {
      if (isLoadingRef.current) {
        return;
      }
      if (append && pageToFetch <= page) {
        return;
      }

      setIsLoading(true);

      try {
        // 🔑 PASS sortOrder TO API CALL
        const res = await fetch(
          `/api/content/comments?contentId=${contentId}&page=${pageToFetch}&sort=${sortOrder}`
        );
        const json = await res.json();

        if (res.ok && json.data) {
          setComments((prev) => (append ? [...prev, ...json.data] : json.data));
          setTotalPages(json.totalPages);
          setTotalComments(json.total);
          if (append) setPage(pageToFetch);
          else setPage(1);
          setHasMore(json.page < json.totalPages);
        } else {
          if (!append) setComments([]);
          showToast(json.message || "Failed to load comments.", "error");
        }
      } catch (err) {
        console.error("Comment fetch error:", err);
        if (!append) setComments([]);
        showToast("Error loading comments.", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [contentId, showToast, sortOrder, page]
  ); // 🔑 Depend on sortOrder

  // 🔑 Effect to (re)fetch comments on mount and on sort change
  useEffect(() => {
    fetchComments(1, false);
  }, [contentId, sortOrder, fetchComments]);

  // ROBUST SCROLL/HIGHLIGHT EFFECT (Unchanged)
  useEffect(() => {
    if (!targetCommentId || hasScrolled || comments.length === 0) {
      return;
    }

    const maxAttempts = 20;
    const intervalMs = 150;
    let attempts = 0;

    const intervalId = setInterval(() => {
      const targetElement = document.getElementById(targetCommentId);

      if (targetElement) {
        clearInterval(intervalId);

        if (typeof targetElement.scrollIntoView === "function") {
          targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        setHasScrolled(true);

        console.log(`Scroll successful after ${attempts} attempts.`);
      } else {
        if (attempts >= maxAttempts) {
          clearInterval(intervalId);
          console.warn(
            `Scroll failed: Target element ${targetCommentId} not found after ${maxAttempts} attempts.`
          );
          return;
        }
        attempts++;
      }
    }, intervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [targetCommentId, comments.length, hasScrolled]);

  // --- Interaction Handlers (omitted for brevity, they remain correct) ---
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!session?.user?.id) {
      showToast("You must be logged in to comment.", "info");
      return;
    }
    if (newComment.trim().length === 0) {
      showToast("Comment cannot be empty.", "info");
      return;
    }

    setIsPosting(true);
    try {
      const res = await fetch("/api/content/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, text: newComment }),
      });
      const json = await res.json();
      if (res.ok) {
        // Only prepend if sorting by latest, otherwise re-fetch to sort correctly
        if (sortOrder === "latest") {
          setComments((prev) => [{ ...json.comment, replies: [] }, ...prev]);
        } else {
          fetchComments(1, false);
        }
        setNewComment("");
        showToast("Comment posted!", "success");
        setTotalComments((prev) => prev + 1);
      } else {
        showToast(json.message || "Failed to post comment.", "error");
      }
    } catch (error) {
      showToast("Network error when posting comment.", "error");
    } finally {
      setIsPosting(false);
    }
  };
  const handleDeleteComment = async (commentId) => {
    if (!userId) return;
    try {
      const res = await fetch("/api/content/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });
      const json = await res.json();

      if (res.ok) {
        setComments((prev) => updateCommentState(prev, commentId, () => null));
        setTotalComments((prev) => prev - 1);
        showToast("Comment deleted successfully.", "success");
      } else {
        showToast(json.message || "Failed to delete comment.", "error");
      }
    } catch (error) {
      console.error("Comment delete error:", error);
      showToast("Network error when deleting comment.", "error");
    }
  };

  // (Like and Dislike handlers are complex and correct, omitted for brevity)
  const handleLikeToggle = async (commentId) => {
    if (!session?.user?.id) {
      showToast("You must be logged in to interact.", "info");
      return;
    }

    const originalComments = comments;
    setComments((prev) =>
      updateCommentState(prev, commentId, (c) => {
        let likes = c.likes ? [...c.likes] : [];
        let dislikes = c.dislikes ? [...c.dislikes] : [];
        const isCurrentlyLiked = likes.includes(userId);

        if (isCurrentlyLiked) {
          likes = likes.filter((id) => id !== userId);
        } else {
          likes.push(userId);
          dislikes = dislikes.filter((id) => id !== userId);
        }
        return { ...c, likes, dislikes };
      })
    );

    try {
      const res = await fetch("/api/content/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, action: "like" }),
      });

      if (!res.ok) {
        setComments(originalComments);
        showToast("Failed to toggle like. State reverted.", "error");
      }
      // Re-fetch comments if sorting by likes/dislikes/replies is active
      if (["most_likes", "most_dislikes"].includes(sortOrder)) {
        fetchComments(1, false);
      }
    } catch (error) {
      setComments(originalComments);
      showToast("Network error when liking comment. State reverted.", "error");
    }
  };

  const handleDislikeToggle = async (commentId) => {
    if (!session?.user?.id) {
      showToast("You must be logged in to interact.", "info");
      return;
    }

    const originalComments = comments;
    setComments((prev) =>
      updateCommentState(prev, commentId, (c) => {
        let likes = c.likes ? [...c.likes] : [];
        let dislikes = c.dislikes ? [...c.dislikes] : [];
        const isCurrentlyDisliked = dislikes.includes(userId);

        if (isCurrentlyDisliked) {
          dislikes = dislikes.filter((id) => id !== userId);
        } else {
          dislikes.push(userId);
          likes = likes.filter((id) => id !== userId);
        }
        return { ...c, likes, dislikes };
      })
    );

    try {
      const res = await fetch("/api/content/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, action: "dislike" }),
      });

      if (!res.ok) {
        setComments(originalComments);
        showToast("Failed to toggle dislike. State reverted.", "error");
      }
      // Re-fetch comments if sorting by likes/dislikes/replies is active
      if (["most_likes", "most_dislikes"].includes(sortOrder)) {
        fetchComments(1, false);
      }
    } catch (error) {
      setComments(originalComments);
      showToast(
        "Network error when disliking comment. State reverted.",
        "error"
      );
    }
  };

  const handleReply = async (
    parentCommentId,
    text,
    postReplySuccessCallback
  ) => {
    if (!session?.user?.id) {
      showToast("You must be logged in to reply.", "info");
      return;
    }

    try {
      const res = await fetch("/api/content/comments/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, parentCommentId, text }),
      });
      const json = await res.json();

      if (res.ok) {
        const newReply = json.reply;
        setComments((prev) =>
          updateCommentState(prev, parentCommentId, (c) => {
            const replies = Array.isArray(c.replies) ? c.replies : [];
            return {
              ...c,
              // Replies are always prepended for a local UI update
              replies: [{ ...newReply, replies: [] }, ...replies],
            };
          })
        );
        showToast("Reply posted!", "success");
        setTotalComments((prev) => prev + 1);
        if (postReplySuccessCallback) postReplySuccessCallback();
      } else {
        showToast(json.message || "Failed to post reply.", "error");
      }
    } catch (error) {
      showToast("Network error when posting reply.", "error");
    }
  };

  // --- Render Utilities ---
  const glow = (hex = "#00ffff", opacity = 1) => {
    const clean = hex.replace("#", "");
    const bigint = parseInt(clean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const headingStyle = useMemo(
    () => ({
      color: GLOW_ACCENT,
      borderBottom: `2px solid ${glow(GLOW_ACCENT, 0.5)}`,
      paddingBottom: "10px",
      marginBottom: "20px",
      textShadow: `0 0 5px ${glow(GLOW_ACCENT, 0.4)}`,
      transition: "text-shadow 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    }),
    [GLOW_ACCENT]
  );

  const selectStyle = useMemo(
    () => ({
      padding: "8px 12px",
      borderRadius: "4px",
      border: `1px solid ${glow(GLOW_ACCENT, 0.5)}`,
      backgroundColor: "#151515",
      color: GLOW_ACCENT,
      cursor: isLoading ? "not-allowed" : "pointer",
      boxShadow: `0 0 5px ${glow(GLOW_ACCENT, 0.2)}`,
      outline: "none",
      transition: "all 0.3s ease",
      WebkitAppearance: "none",
      appearance: "none",
    }),
    [GLOW_ACCENT, isLoading]
  );

  const [logIsOpen, setLogIsOpen] = useState(false);
  const creat = creator ? creator : "";

  const toggleSignInModal = (isOpen) => setLogIsOpen(isOpen);


  return (
    <>
      {logIsOpen && (
        <SignInSignUpModal
          logIsOpen={logIsOpen}
          setLogIsOpen={setLogIsOpen}
          sign={toggleSignInModal}
          creator={creat}
        />
      )}
      <div
        className="comment-section-container"
        style={{
          width: "100%",
          marginTop: "20px",
          padding: "20px",
          backgroundColor: "#0a0a0a",
          color: "#eee",
          borderRadius: "10px",
          border: `1px solid ${GLOW_ACCENT}50`,
          boxShadow: `0 0 15px ${GLOW_ACCENT}30`,
        }}
      >
        <h3
          className="comment-heading"
          style={headingStyle}
          onMouseEnter={(e) =>
          (e.currentTarget.style.textShadow = `0 0 10px ${glow(
            GLOW_ACCENT,
            0.8
          )}`)
          }
          onMouseLeave={(e) =>
          (e.currentTarget.style.textShadow = `0 0 5px ${glow(
            GLOW_ACCENT,
            0.4
          )}`)
          }
        >
          <FaCommentDots style={{ color: GLOW_ACCENT }} />
          Comments ({totalComments})
        </h3>
        <div
          className="sorting-controls-container"
          style={{
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid #333",
            paddingBottom: "15px",
            gap: "10px",
          }}
        >
          <label
            htmlFor="comment-sort"
            style={{
              fontSize: "14px",
              color: "#ccc",
              fontWeight: "500",
              marginRight: "5px",
              flexShrink: 0,
            }}
          >
            Sort by:
          </label>
          {/* 🔑 ONCHANGE HANDLER TO SET sortOrder STATE */}
          <select
            id="comment-sort"
            className="sort-dropdown"
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setPage(1);
              setComments([]);
              setHasMore(false);
            }}
            disabled={isLoading}
            style={selectStyle}
            onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow = `0 0 10px ${glow(
              GLOW_ACCENT,
              1
            )}`)
            }
            onMouseLeave={(e) =>
            (e.currentTarget.style.boxShadow = `0 0 5px ${glow(
              GLOW_ACCENT,
              0.2
            )}`)
            }
            onFocus={(e) =>
              (e.currentTarget.style.border = `1px solid ${glow(GLOW_ACCENT, 1)}`)
            }
            onBlur={(e) =>
            (e.currentTarget.style.border = `1px solid ${glow(
              GLOW_ACCENT,
              0.5
            )}`)
            }
          >
            <option
              value="latest"
              style={{ backgroundColor: "#151515", color: GLOW_ACCENT }}
            >
              Latest
            </option>
            <option
              value="highest_likes"
              style={{ backgroundColor: "#151515", color: GLOW_ACCENT }}
            >
              Highest Liked
            </option>
            <option
              value="most_replied"
              style={{ backgroundColor: "#151515", color: GLOW_ACCENT }}
            >
              Most Replied
            </option>
            <option
              value="oldest"
              style={{ backgroundColor: "#151515", color: GLOW_ACCENT }}
            >
              Oldest
            </option>
            <option
              value="highest_dislikes"
              style={{ backgroundColor: "#151515", color: GLOW_ACCENT }}
            >
              Most Disliked
            </option>
          </select>
          {isLoading && (
            <AiOutlineLoading3Quarters
              className="spinner"
              size={18}
              style={{ color: GLOW_ACCENT, animation: "spin 1s linear infinite" }}
            />
          )}
        </div>
        <form
          className="comment-form"
          onSubmit={handlePostComment}
          style={{
            marginBottom: "30px",
            backgroundColor: "#1b1b1b",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: `0 0 10px ${glow(GLOW_ACCENT, 0.1)}`,
            border: `1px solid ${glow(GLOW_ACCENT, 0.2)}`,
            transition: "box-shadow 0.3s ease",
          }}
          onMouseEnter={(e) =>
          (e.currentTarget.style.boxShadow = `0 0 15px ${glow(
            GLOW_ACCENT,
            0.3
          )}`)
          }
          onMouseLeave={(e) =>
          (e.currentTarget.style.boxShadow = `0 0 10px ${glow(
            GLOW_ACCENT,
            0.1
          )}`)
          }
        >
          {session?.user?.id ? (
            <>
              {/* ✍️ Textarea */}
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  session?.user?.id
                    ? "Join the discussion..."
                    : "Log in to post a comment."
                }
                maxLength={500}
                rows={3}
                disabled={!session?.user?.id || isPosting}
                style={{
                  width: "100%",
                  padding: "15px",
                  border: `1px solid ${GLOW_ACCENT}70`,
                  borderRadius: "8px",
                  resize: "vertical",
                  backgroundColor: "#151515",
                  color: "#fff",
                  marginBottom: "10px",
                  outline: "none",
                  fontSize: "15px",
                  transition: "all 0.3s ease",
                  boxShadow: `inset 0 0 8px ${GLOW_ACCENT}30`,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = `1px solid ${GLOW_ACCENT}`;
                  e.currentTarget.style.boxShadow = `0 0 10px ${GLOW_ACCENT}70`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = `1px solid ${GLOW_ACCENT}70`;
                  e.currentTarget.style.boxShadow = `inset 0 0 8px ${GLOW_ACCENT}30`;
                }}
              />

              <button
                type="submit"
                disabled={!newComment.trim() || isPosting || !session?.user?.id}
                style={{
                  padding: "10px 20px",
                  backgroundColor: newComment.trim() ? GLOW_ACCENT : "#444",
                  color: DARK_BG,
                  border: "none",
                  borderRadius: "6px",
                  cursor:
                    newComment.trim() && session?.user?.id
                      ? "pointer"
                      : "not-allowed",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: newComment.trim()
                    ? `0 0 10px ${GLOW_ACCENT}70`
                    : "none",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isPosting && newComment.trim().length > 0) {
                    e.currentTarget.style.boxShadow = `0 0 20px ${glow(
                      BUTTON_BG,
                      1
                    )}`;
                    e.currentTarget.style.transform = "scale(1.02)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 12px ${glow(
                    BUTTON_BG,
                    0.8
                  )}`;
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {isPosting ? (
                  <>
                    <AiOutlineLoading3Quarters
                      className="spin"
                      style={{
                        marginRight: "8px",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    Posting...
                  </>
                ) : (
                  <>
                    <FaPaperPlane /> Post Comment
                  </>
                )}
              </button>

              {/* 🌀 Simple keyframes for spinner */}
              <style jsx>{`
              @keyframes spin {
                from {
                  transform: rotate(0deg);
                }
                to {
                  transform: rotate(360deg);
                }
              }
              .spin {
                animation: spin 1s linear infinite;
              }
            `}</style>
            </>
          ) : (
            // 🔐 Login Prompt
            <div
              className="login-prompt"
              style={{
                textAlign: "center",
                padding: "20px",
                border: `1px dashed ${glow(GLOW_ACCENT, 0.6)}`,
                borderRadius: "6px",
                backgroundColor: "#121212",
                color: "#ccc",
                boxShadow: `0 0 6px ${glow(GLOW_ACCENT, 0.1)}`,
              }}
            >
              <p style={{ color: "#aaa", fontSize: "15px" }}>
                <span
                  // href="/api/auth/signin"
                  className="login-link"
                  onClick={() => toggleSignInModal(true)}
                  style={{
                    color: GLOW_ACCENT,
                    textDecoration: "none",
                    fontWeight: "bold",
                    transition: "text-shadow 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                  (e.currentTarget.style.textShadow = `0 0 10px ${glow(
                    GLOW_ACCENT,
                    1
                  )}`)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.textShadow = `0 0 0px transparent`)
                  }
                >
                  Log in
                </span>{" "}
                to join the conversation and post a comment.
              </p>
            </div>
          )}
        </form>
        {/* --- Comment List --- */}
        <div className="comment-list">
          {comments.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              userId={userId}
              onDelete={handleDeleteComment}
              onLikeToggle={handleLikeToggle}
              onDislikeToggle={handleDislikeToggle}
              onReply={handleReply}
              depth={0}
              // 🔑 Pass the target ID down
              targetId={targetCommentId}
            />
          ))}
          {/* Loading state */}
          {isLoading && comments.length === 0 && (
            <div
              className="loading-state"
              style={{ textAlign: "center", padding: "20px", color: GLOW_ACCENT }}
            >

              <AiOutlineLoading3Quarters
                className="spin"
                style={{ fontSize: "24px" }}
              />{" "}
              Loading Comments...
            </div>
          )}
          {/* No comments state */}
          {!isLoading && totalComments === 0 && page === 1 && (
            <div
              className="loading-state"
              style={{ textAlign: "center", padding: "20px", color: "#aaa" }}
            >
              Be the first to leave a comment! ✨
            </div>
          )}
          {/* Load More Button with Glow */}
          {hasMore && (
            <button
              onClick={() => fetchComments(page + 1, true)}
              className="load-more-btn"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "20px",
                backgroundColor: "transparent",
                color: GLOW_ACCENT,
                border: `1px solid ${GLOW_ACCENT}`,
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                boxShadow: `0 0 10px ${GLOW_ACCENT}50`, // Subtle glow
                transition: "all 0.3s ease",
                opacity: isLoading ? 0.7 : 1,
              }}
            >

              {isLoading ? (
                <>

                  <AiOutlineLoading3Quarters
                    className="spin"
                    style={{ marginRight: "8px" }}
                  />{" "}
                  Loading More...
                </>
              ) : (
                `Load More Comments (${totalPages - page} page(s) left)`
              )}

            </button>
          )}

        </div>

      </div></>
  );
};

export default CommentSection;

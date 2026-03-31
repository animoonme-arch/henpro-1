"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import "./notification.css";
import { FaThumbsUp, FaThumbsDown, FaReply, FaBell } from "react-icons/fa";

// --- Helper: Format "time ago" ---
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date() - date) / 1000);

  const intervals = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  // 

  for (const [name, secs] of intervals) {
    const interval = Math.floor(seconds / secs);
    if (interval >= 1)
      return `${interval} ${name}${interval > 1 ? "s" : ""} ago`;
  }
  return "just now";
};

// --- Each Notification Item ---
const NotificationItem = ({ notification, onMarkRead }) => {
  const senderName = notification.senderName || "A user";
  let message = "";
  let icon = <FaBell />;
  let linkTarget = notification.commentId || notification.contentId || "";

  switch (notification.type) {
    case "LIKE":
      message = `<strong>${senderName}</strong> liked your comment.`;
      icon = <FaThumbsUp />;
      break;
    case "DISLIKE":
      message = `<strong>${senderName}</strong> disliked your comment.`;
      icon = <FaThumbsDown />;
      break;
    case "REPLY":
      message = `<strong>${senderName}</strong> replied to your comment.`;
      icon = <FaReply />;
      linkTarget = notification.commentId;
      break;
    default:
      message = `New update on your content.`;
  }

  const link = `/${notification.contentId}#${linkTarget}`;

  const handleClick = async () => {
    if (!notification.read) {
      try {
        await fetch(`/api/notifications/${notification._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ read: true }),
        });
        onMarkRead(notification._id);
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }
  };

  return (
    <a
      href={link}
      onClick={handleClick}
      className={`notification-item ${notification.read ? "" : "unread"}`}
    >
      <div className="notification-icon">{icon}</div>
      <div className="notification-content">
        <p
          className="notification-message"
          dangerouslySetInnerHTML={{ __html: message }}
        />
        <span className="notification-time">
          {formatTimeAgo(notification.createdAt)}
        </span>
      </div>
    </a>
  );
};

// --- Main Notification Component ---
export default function Notification() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = session?.user?.id;

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/notifications`);
      if (!res.ok) throw new Error(`Failed to fetch notifications`);
      const data = await res.json();
      setNotifications(data.notifications);
    } catch (err) {
      console.error(err);
      setError("Failed to load notifications.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  };

  if (!session) {
    return (
      <div className="notification-container">
        <div className="notification-header">
          <h1 className="notification-title">Notifications</h1>
          <p className="notification-description">
            Please log in to view your notifications.
          </p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="notification-container">
      <div className="notification-header">
        <h1 className="notification-title">
          Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
        </h1>
        <p className="notification-description">
          Recent activity on your comments.
        </p>
      </div>

      <div className="notification-list">
        {isLoading && (
          <p className="notification-loading">Loading notifications...</p>
        )}
        {error && <p className="notification-error">{error}</p>}
        {!isLoading && notifications.length === 0 && !error && (
          <p className="notification-empty">
            You're all caught up! No new activity.
          </p>
        )}
        {notifications.map((notif) => (
          <NotificationItem
            key={notif._id}
            notification={notif}
            onMarkRead={handleMarkRead}
          />
        ))}
      </div>
    </div>
  );
}

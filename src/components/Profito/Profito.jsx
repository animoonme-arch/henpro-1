"use client";
import React, { useState, useEffect } from "react";
import {
  FaKey,
  FaPen,
  FaUser,
  FaSave,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
} from "react-icons/fa"; // Added icons for toast
import { useSession, signIn } from "next-auth/react";
import { imageData } from "@/data/imageData"; // Assuming this data structure is correct
import { AiOutlineClose } from "react-icons/ai";
// import { toast } from "react-toastify"; // REMOVED external toast library
import "./profito.css";

// Define the Custom Toast Component
const CustomToast = ({ message, type, onClose }) => {
  let Icon = FaInfoCircle;
  if (type === "success") Icon = FaCheckCircle;
  if (type === "error") Icon = FaTimesCircle;

  return (
    <div className={`custom-toast custom-toast-${type}`}>
      <div className="toast-icon-message">
        <Icon />
        <p>{message}</p>
      </div>
      <button onClick={onClose} className="toast-close-btn">
        <AiOutlineClose />
      </button>
    </div>
  );
};

export default function Profito() {
  const { data: session, update } = useSession();
  const [newEmail, setNewEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newAvatar, setNewAvatar] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [changep, setChangep] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Custom Toast State
  const [customToast, setCustomToast] = useState(null);

  // Function to display the custom toast
  const showCustomToast = (message, type = "info") => {
    setCustomToast({ message, type });
    setTimeout(() => {
      setCustomToast(null);
    }, 4000); // Toast disappears after 4 seconds
  };

  useEffect(() => {
    if (session?.user) {
      setNewEmail(session.user.email || "");
      setNewUsername(session.user.username || "");
      // Use the canonical avatar URL logic
      const currentAvatar =
        session.user.avatar?.replace(
          "https://img.flawlessfiles.com/_r/100x100/100/avatar/",
          "https://cdn.noitatnemucod.net/avatar/100x100/"
        ) || "/default-avatar.png";
      setNewAvatar(currentAvatar);
    }
  }, [session]);

  const date = new Date(session?.user?.timeOfJoining);
  const formattedDate = date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(""); // Clear previous errors
    const userId = session?.user?.id;
    const updatedFields = {};

    if (!validateEmail(newEmail)) {
      showCustomToast("Please enter a valid email address.", "error"); // Custom Toast
      setIsSaving(false);
      return;
    }

    if (changep) {
      if (newPassword.trim().length < 6) {
        showCustomToast("Password must be at least 6 characters.", "error"); // Custom Toast
        setIsSaving(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        showCustomToast("Passwords do not match.", "error"); // Custom Toast
        setIsSaving(false);
        return;
      }
    }

    // Only include fields that have changed
    if (newEmail !== session?.user?.email) updatedFields.email = newEmail;
    if (newUsername !== session?.user?.username)
      updatedFields.username = newUsername;
    if (newAvatar !== session?.user?.avatar) updatedFields.avatar = newAvatar;
    if (newPassword.trim() !== "") updatedFields.password = newPassword;

    if (Object.keys(updatedFields).length === 0) {
      showCustomToast("No changes detected.", "info"); // Custom Toast
      setIsSaving(false);
      return;
    }

    updatedFields.userId = userId;

    try {
      const response = await fetch("/api/updateProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });

      const data = await response.json();

      if (response.ok) {
        // Re-authenticate if email or password changed
        if (updatedFields.email || updatedFields.password) {
          await signIn("credentials", {
            email: newEmail,
            password: updatedFields.password || newPassword, // Use the new password if set
            redirect: false,
          });
        }

        // Update NextAuth session state
        await update({
          email: newEmail,
          username: newUsername,
          avatar: newAvatar,
        });

        showCustomToast("Profile updated successfully! 🎉", "success"); // Custom Toast
        setNewPassword("");
        setConfirmPassword("");
        setChangep(false); // Close password fields
      } else {
        showCustomToast(data.message || "Something went wrong.", "error"); // Custom Toast
      }
    } catch (err) {
      showCustomToast("An API error occurred.", "error"); // Custom Toast
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handlers for Avatar Modal
  const selectAvatarAndClose = (img) => {
    setNewAvatar(img);
    setShowModal(false);
  };

  const handleModalSave = () => {
    handleSave(); // Saves the current state including the new avatar
    setShowModal(false);
  };

  return (
    <div className="profile-edit-container">
      {/* RENDER CUSTOM TOAST HERE */}
      {customToast && (
        <CustomToast
          message={customToast.message}
          type={customToast.type}
          onClose={() => setCustomToast(null)}
        />
      )}

      <h2 className="profile-title">
        <FaUser /> Edit Profile
      </h2>
      <div className="profile-card">
        {/* Left Section: Avatar */}
        <div className="profile-aatar-section">
          <div className="aatar-wrapper" onClick={() => setShowModal(true)}>
            <img
              src={newAvatar || "/default-avatar.png"}
              className="user-aatar"
              alt="Profile"
            />
            <div className="edit-pen-icon">
              <FaPen />
            </div>
          </div>
          <p className="join-date">
            Joined: <span>{formattedDate}</span>
          </p>
        </div>

        {/* Right Section: Form Details */}
        <div className="profile-form-section">
          <div className="form-grid">
            {/* Username Field */}
            <div className="form-field">
              <label htmlFor="username-input" className="field-label-custom">
                YOUR NAME
              </label>
              <input
                id="username-input"
                className="field-input-custom"
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                name="username"
              />
            </div>

            {/* Email Field */}
            <div className="form-field">
              <label htmlFor="email-input" className="field-label-custom">
                EMAIL ADDRESS
              </label>
              <input
                id="email-input"
                className="field-input-custom"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                name="email"
              />
            </div>
          </div>

          {/* Change Password Toggle */}
          <button
            className="change-password-toggle"
            onClick={() => setChangep(!changep)}
            aria-expanded={changep}
          >
            <FaKey /> {changep ? "Cancel Change" : "Change Password"}
          </button>

          {/* Password Fields (Conditional) */}
          {changep && (
            <div className="password-fields-container">
              <div className="form-field">
                <label
                  htmlFor="new-password-input"
                  className="field-label-custom"
                >
                  NEW PASSWORD
                </label>
                <input
                  id="new-password-input"
                  className="field-input-custom"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div className="form-field">
                <label
                  htmlFor="confirm-password-input"
                  className="field-label-custom"
                >
                  CONFIRM PASSWORD
                </label>
                <input
                  id="confirm-password-input"
                  className="field-input-custom"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && <div className="save-error">{error}</div>}

          {/* Save Button */}
          <button
            className="save-button-custom"
            onClick={handleSave}
            disabled={isSaving}
          >
            <FaSave /> {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Avatar Selection Modal */}
      {showModal && (
        <div
          className="avatar-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-content-custom"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="close-modal-btn"
              aria-label="Close"
            >
              <AiOutlineClose />
            </button>

            <h3 className="modal-title">Select an Avatar</h3>

            <div className="avatar-selection-scroll">
              {Object.keys(imageData.hashtags).map((category) => (
                <div key={category} className="avatar-category">
                  <h4 className="category-title">{category}</h4>
                  <div className="avatar-images-grid">
                    {imageData.hashtags[category].images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={category}
                        onClick={() => selectAvatarAndClose(img)}
                        className={`modal-avatar-image ${
                          newAvatar === img ? "selected" : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-footer-custom">
              <button
                className="modal-btn cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="modal-btn apply" onClick={handleModalSave}>
                Apply & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

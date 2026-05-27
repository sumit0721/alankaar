import { useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext.jsx";
import { updateProfile, changePassword } from "../services/authService.js";

function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    profilePicture: user?.profilePicture || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileData((current) => ({ ...current, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordData((current) => ({ ...current, [name]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    try {
      setProfileSubmitting(true);
      const response = await updateProfile(profileData);
      updateUser(response.data.data);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setPasswordSubmitting(true);
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password.");
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <section className="section-block">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">Account</span>
          <h1>Your Profile</h1>
        </div>

        <div className="profile-layout">
          <div className="profile-card">
            <div className="profile-avatar-section">
              {profileData.profilePicture ? (
                <img
                  src={profileData.profilePicture}
                  alt="Profile"
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {user?.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
              <h3>{user?.name}</h3>
              <p>{user?.email}</p>
            </div>

            <form className="auth-form" onSubmit={handleProfileSubmit}>
              <label className="form-field">
                <span>Full Name</span>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  placeholder="Your name"
                />
              </label>

              <label className="form-field">
                <span>Phone Number</span>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  placeholder="Your phone number"
                />
              </label>

              <label className="form-field">
                <span>Profile Picture URL</span>
                <input
                  type="url"
                  name="profilePicture"
                  value={profileData.profilePicture}
                  onChange={handleProfileChange}
                  placeholder="https://example.com/photo.jpg"
                />
              </label>

              <button type="submit" className="primary-button" disabled={profileSubmitting}>
                {profileSubmitting ? "Saving..." : "Update Profile"}
              </button>
            </form>
          </div>

          <div className="profile-card">
            <h3>Change Password</h3>
            <form className="auth-form" onSubmit={handlePasswordSubmit}>
              <label className="form-field">
                <span>Current Password</span>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                />
              </label>

              <label className="form-field">
                <span>New Password</span>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="At least 6 characters"
                />
              </label>

              <label className="form-field">
                <span>Confirm New Password</span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Re-enter new password"
                />
              </label>

              <button type="submit" className="primary-button" disabled={passwordSubmitting}>
                {passwordSubmitting ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;

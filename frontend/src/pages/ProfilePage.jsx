import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Trash2, X, ShieldAlert, Eye, EyeOff } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, isDeletingAccount, deleteAccount } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) return;
    try {
      await deleteAccount(deletePassword);
    } catch {
      // Error handled in store, keep modal open
    }
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-6">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* avatar upload section */}

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 "
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium  mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>

          {/* ---- DANGER ZONE ---- */}
          <div className="border-2 border-error/40 rounded-xl p-6 bg-error/5">
            <div className="flex items-center gap-3 mb-3">
              <ShieldAlert className="size-5 text-error shrink-0" />
              <h2 className="text-lg font-semibold text-error">Danger Zone</h2>
            </div>
            <p className="text-sm text-base-content/70 mb-4">
              Once you delete your account, <strong>all your messages, data and group memberships
              will be permanently removed</strong>. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-error btn-sm gap-2"
            >
              <Trash2 className="size-4" />
              Delete Account Permanently
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-md p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-error/10 rounded-xl flex items-center justify-center">
                  <Trash2 className="size-5 text-error" />
                </div>
                <h2 className="text-lg font-semibold">Delete Account</h2>
              </div>
              <button
                onClick={() => { setShowDeleteModal(false); setDeletePassword(""); }}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Warning */}
            <div className="bg-error/10 border border-error/30 rounded-xl p-4 mb-5">
              <p className="text-sm text-error font-medium mb-1">⚠️ This is permanent!</p>
              <ul className="text-sm text-base-content/70 space-y-1 list-disc list-inside">
                <li>All your messages will be deleted</li>
                <li>You'll be removed from all groups</li>
                <li>Your profile will be permanently erased</li>
              </ul>
            </div>

            {/* Password input */}
            <div className="mb-5">
              <label className="label">
                <span className="label-text font-medium">Confirm your password to proceed</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered input-error w-full pr-10"
                  placeholder="Enter your current password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleDeleteAccount()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeletePassword(""); }}
                className="btn btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={!deletePassword.trim() || isDeletingAccount}
                className="btn btn-error flex-1 gap-2"
              >
                {isDeletingAccount ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProfilePage;
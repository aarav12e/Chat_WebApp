import { useState } from "react";
import { X, Shield, UserMinus, UserPlus, Trash2, LogOut, Search, Camera } from "lucide-react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const GroupInfoPanel = ({ onClose }) => {
  const { selectedGroup, updateGroup, addMember, removeMember, leaveGroup, deleteGroup } = useGroupStore();
  const { authUser } = useAuthStore();
  const { users } = useChatStore();
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  if (!selectedGroup) return null;

  const isAdmin = selectedGroup.admins?.some((a) => a._id === authUser._id);
  const memberIds = selectedGroup.members?.map((m) => m._id) || [];
  const nonMembers = users.filter((u) => !memberIds.includes(u._id));
  const filteredNonMembers = nonMembers.filter((u) =>
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGroupPicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      setIsUploading(true);
      await updateGroup(selectedGroup._id, { groupPic: reader.result });
      setIsUploading(false);
    };
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm("Remove this member from the group?")) {
      await removeMember(selectedGroup._id, userId);
    }
  };

  const handleAddMember = async (userId) => {
    await addMember(selectedGroup._id, userId);
  };

  const handleLeave = async () => {
    if (window.confirm("Are you sure you want to leave this group?")) {
      await leaveGroup(selectedGroup._id);
      onClose();
    }
  };

  const handleDeleteGroup = async () => {
    if (window.confirm("Permanently delete this group and all its messages?")) {
      await deleteGroup(selectedGroup._id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-base-300">
          <h2 className="text-lg font-semibold">Group Info</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Group avatar & name */}
          <div className="flex flex-col items-center py-6 px-5 gap-3">
            <div className="relative">
              <img
                src={selectedGroup.groupPic || "/group-avatar.png"}
                alt={selectedGroup.name}
                className="size-24 rounded-full object-cover border-4 border-base-300"
                onError={(e) => (e.target.src = "/avatar.png")}
              />
              {isAdmin && (
                <label
                  htmlFor="group-pic-upload"
                  className={`absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all ${
                    isUploading ? "animate-pulse pointer-events-none" : ""
                  }`}
                >
                  <Camera className="size-4 text-base-200" />
                  <input
                    type="file"
                    id="group-pic-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleGroupPicUpload}
                  />
                </label>
              )}
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold">{selectedGroup.name}</h3>
              {selectedGroup.description && (
                <p className="text-sm text-base-content/60 mt-1">{selectedGroup.description}</p>
              )}
              <p className="text-xs text-base-content/40 mt-1">
                {selectedGroup.members?.length || 0} members
              </p>
            </div>
          </div>

          {/* Members list */}
          <div className="px-5 pb-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm text-base-content/70 uppercase tracking-wider">
                Members
              </h4>
              {isAdmin && (
                <button
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="btn btn-ghost btn-xs gap-1"
                >
                  <UserPlus className="size-3" />
                  Add
                </button>
              )}
            </div>

            {/* Add member search */}
            {showAddMember && isAdmin && (
              <div className="mb-3 p-3 bg-base-200 rounded-xl">
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-base-content/40" />
                  <input
                    type="text"
                    placeholder="Search people to add..."
                    className="input input-sm input-bordered w-full pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {filteredNonMembers.length === 0 ? (
                    <p className="text-xs text-base-content/50 text-center py-2">No users to add</p>
                  ) : (
                    filteredNonMembers.map((u) => (
                      <button
                        key={u._id}
                        onClick={() => handleAddMember(u._id)}
                        className="w-full flex items-center gap-2 p-2 hover:bg-base-300 rounded-lg transition-colors"
                      >
                        <img src={u.profilePic || "/avatar.png"} alt="" className="size-7 rounded-full object-cover" />
                        <span className="text-sm flex-1 text-left">{u.fullName}</span>
                        <UserPlus className="size-3.5 text-primary" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Members */}
            <div className="space-y-1">
              {selectedGroup.members?.map((member) => {
                const isAdminMember = selectedGroup.admins?.some((a) => a._id === member._id);
                const isSelf = member._id === authUser._id;
                return (
                  <div
                    key={member._id}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-base-200 transition-colors"
                  >
                    <img
                      src={member.profilePic || "/avatar.png"}
                      alt={member.fullName}
                      className="size-9 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-sm truncate">
                          {member.fullName} {isSelf && "(You)"}
                        </span>
                        {isAdminMember && (
                          <span className="badge badge-primary badge-xs gap-0.5">
                            <Shield className="size-2.5" />
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                    {isAdmin && !isSelf && (
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        className="btn btn-ghost btn-xs text-error"
                        title="Remove member"
                      >
                        <UserMinus className="size-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 pb-5 pt-2 space-y-2 border-t border-base-300 mt-3">
            <button
              onClick={handleLeave}
              className="btn btn-outline btn-warning w-full gap-2"
            >
              <LogOut className="size-4" />
              Leave Group
            </button>
            {isAdmin && (
              <button
                onClick={handleDeleteGroup}
                className="btn btn-outline btn-error w-full gap-2"
              >
                <Trash2 className="size-4" />
                Delete Group
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupInfoPanel;

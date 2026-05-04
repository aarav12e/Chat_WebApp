import { useState } from "react";
import { X, Users, Search, Plus, Check } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";

const CreateGroupModal = ({ onClose }) => {
  const { users } = useChatStore();
  const { createGroup } = useGroupStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsCreating(true);
    const group = await createGroup({
      name: name.trim(),
      description: description.trim(),
      members: selectedMembers,
    });
    setIsCreating(false);
    if (group) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-base-300">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Users className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Create Group</h2>
              <p className="text-xs text-base-content/60">Add members to your group</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Group Name */}
          <div>
            <label className="label">
              <span className="label-text font-medium">Group Name *</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="e.g. Project Team, Friends..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">
              <span className="label-text font-medium">Description</span>
              <span className="label-text-alt text-base-content/50">Optional</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="What's this group about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Selected members badge row */}
          {selectedMembers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedMembers.map((memberId) => {
                const user = users.find((u) => u._id === memberId);
                return (
                  <span
                    key={memberId}
                    onClick={() => toggleMember(memberId)}
                    className="badge badge-primary gap-1 cursor-pointer hover:badge-error transition-colors py-3 px-2"
                  >
                    <img
                      src={user?.profilePic || "/avatar.png"}
                      alt=""
                      className="size-4 rounded-full object-cover"
                    />
                    {user?.fullName}
                    <X className="size-3" />
                  </span>
                );
              })}
            </div>
          )}

          {/* Search members */}
          <div>
            <label className="label">
              <span className="label-text font-medium">
                Add Members ({selectedMembers.length} selected)
              </span>
            </label>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
              <input
                type="text"
                className="input input-bordered w-full pl-9"
                placeholder="Search people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-1 max-h-48 overflow-y-auto rounded-xl border border-base-300">
              {filteredUsers.length === 0 ? (
                <p className="text-center text-base-content/50 py-4 text-sm">No users found</p>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedMembers.includes(user._id);
                  return (
                    <button
                      key={user._id}
                      onClick={() => toggleMember(user._id)}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-base-200 transition-colors rounded-lg ${
                        isSelected ? "bg-primary/10" : ""
                      }`}
                    >
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.fullName}
                        className="size-9 rounded-full object-cover"
                      />
                      <span className="flex-1 text-left font-medium text-sm">{user.fullName}</span>
                      <div
                        className={`size-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-base-300"
                        }`}
                      >
                        {isSelected && <Check className="size-3 text-primary-content" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-base-300 flex gap-3">
          <button onClick={onClose} className="btn btn-ghost flex-1">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
            className="btn btn-primary flex-1 gap-2"
          >
            {isCreating ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <Plus className="size-4" />
            )}
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;

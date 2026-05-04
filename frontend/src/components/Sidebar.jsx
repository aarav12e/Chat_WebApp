import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, MessageSquare, Plus } from "lucide-react";
import CreateGroupModal from "./CreateGroupModal";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { groups, selectedGroup, setSelectedGroup, getMyGroups, isGroupsLoading } = useGroupStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("contacts"); // "contacts" | "groups"
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  useEffect(() => {
    getUsers();
    getMyGroups();
  }, [getUsers, getMyGroups]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSelectedGroup(null);
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setSelectedUser(null);
  };

  if (isUsersLoading && activeTab === "contacts") return <SidebarSkeleton />;

  return (
    <>
      <aside className="h-full w-full sm:w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
        {/* Tabs */}
        <div className="border-b border-base-300 w-full">
          <div className="flex">
            <button
              onClick={() => setActiveTab("contacts")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "contacts"
                  ? "border-primary text-primary"
                  : "border-transparent text-base-content/60 hover:text-base-content"
              }`}
            >
              <MessageSquare className="size-4 shrink-0" />
              <span className="sm:hidden lg:block">Contacts</span>
            </button>
            <button
              onClick={() => setActiveTab("groups")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "groups"
                  ? "border-primary text-primary"
                  : "border-transparent text-base-content/60 hover:text-base-content"
              }`}
            >
              <Users className="size-4 shrink-0" />
              <span className="sm:hidden lg:block">Groups</span>
            </button>
          </div>
        </div>

        {/* Contacts tab */}
        {activeTab === "contacts" && (
          <>
            {/* Online filter */}
            <div className="p-4 border-b border-base-300">
              <div className="flex sm:hidden lg:flex items-center gap-2">
                <label className="cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showOnlineOnly}
                    onChange={(e) => setShowOnlineOnly(e.target.checked)}
                    className="checkbox checkbox-sm"
                  />
                  <span className="text-sm">Online only</span>
                </label>
                <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
              </div>
            </div>

            <div className="overflow-y-auto w-full py-3 flex-1">
              {filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleSelectUser(user)}
                  className={`
                    w-full p-3 flex items-center gap-3
                    hover:bg-base-300 transition-colors
                    ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
                  `}
                >
                  <div className="relative shrink-0">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="size-12 object-cover rounded-full"
                    />
                    {onlineUsers.includes(user._id) && (
                      <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-base-100" />
                    )}
                  </div>

                  <div className="sm:hidden lg:block text-left min-w-0 flex-1">
                    <div className="font-medium truncate">{user.fullName}</div>
                    <div className="text-sm text-zinc-400">
                      {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                    </div>
                  </div>
                </button>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center text-zinc-500 py-4 text-sm">No users found</div>
              )}
            </div>
          </>
        )}

        {/* Groups tab */}
        {activeTab === "groups" && (
          <>
            {/* Header with create button */}
            <div className="p-4 border-b border-base-300 flex items-center justify-between">
              <span className="text-sm font-medium sm:hidden lg:block">My Groups</span>
              <button
                onClick={() => setShowCreateGroup(true)}
                className="btn btn-primary btn-sm gap-1"
                title="Create Group"
              >
                <Plus className="size-4" />
                <span className="sm:hidden lg:inline">New</span>
              </button>
            </div>

            <div className="overflow-y-auto w-full py-3 flex-1">
              {isGroupsLoading ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-sm" />
                </div>
              ) : groups.length === 0 ? (
                <div className="text-center text-zinc-500 py-6 px-4 text-sm">
                  <Users className="size-8 mx-auto mb-2 opacity-40" />
                  <p>No groups yet</p>
                  <p className="text-xs mt-1 opacity-70">Create one to get started!</p>
                </div>
              ) : (
                groups.map((group) => (
                  <button
                    key={group._id}
                    onClick={() => handleSelectGroup(group)}
                    className={`
                      w-full p-3 flex items-center gap-3
                      hover:bg-base-300 transition-colors
                      ${selectedGroup?._id === group._id ? "bg-base-300 ring-1 ring-base-300" : ""}
                    `}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={group.groupPic || "/avatar.png"}
                        alt={group.name}
                        className="size-12 object-cover rounded-full"
                        onError={(e) => (e.target.src = "/avatar.png")}
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 bg-primary rounded-full p-0.5">
                        <Users className="size-2.5 text-primary-content" />
                      </span>
                    </div>

                    <div className="sm:hidden lg:block text-left min-w-0 flex-1">
                      <div className="font-medium truncate">{group.name}</div>
                      <div className="text-sm text-zinc-400">
                        {group.members?.length || 0} members
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </aside>

      {showCreateGroup && (
        <CreateGroupModal onClose={() => setShowCreateGroup(false)} />
      )}
    </>
  );
};

export default Sidebar;
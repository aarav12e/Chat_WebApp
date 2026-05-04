import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useGroupStore = create((set, get) => ({
  groups: [],
  selectedGroup: null,
  groupMessages: [],
  isGroupsLoading: false,
  isGroupMessagesLoading: false,

  getMyGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post("/groups", groupData);
      set({ groups: [res.data, ...get().groups] });
      toast.success("Group created successfully!");

      // Join the socket room for the new group
      const socket = useAuthStore.getState().socket;
      if (socket) socket.emit("joinGroup", res.data._id);

      return res.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create group");
      return null;
    }
  },

  getGroupMessages: async (groupId) => {
    set({ isGroupMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/messages`);
      set({ groupMessages: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isGroupMessagesLoading: false });
    }
  },

  sendGroupMessage: async (messageData) => {
    const { selectedGroup } = get();
    if (!selectedGroup) return;
    try {
      const res = await axiosInstance.post(`/groups/${selectedGroup._id}/send`, messageData);
      set({ groupMessages: [...get().groupMessages, res.data] });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  },

  deleteGroupMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      set({ groupMessages: get().groupMessages.filter((m) => m._id !== messageId) });
      toast.success("Message deleted");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to delete message");
    }
  },

  updateGroup: async (groupId, updateData) => {
    try {
      const res = await axiosInstance.put(`/groups/${groupId}`, updateData);
      set({
        groups: get().groups.map((g) => (g._id === groupId ? res.data : g)),
        selectedGroup: get().selectedGroup?._id === groupId ? res.data : get().selectedGroup,
      });
      toast.success("Group updated!");
      return res.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update group");
      return null;
    }
  },

  addMember: async (groupId, userId) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/members`, { userId });
      set({
        groups: get().groups.map((g) => (g._id === groupId ? res.data : g)),
        selectedGroup: get().selectedGroup?._id === groupId ? res.data : get().selectedGroup,
      });
      toast.success("Member added!");
      return res.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add member");
      return null;
    }
  },

  removeMember: async (groupId, userId) => {
    try {
      const res = await axiosInstance.delete(`/groups/${groupId}/members/${userId}`);
      set({
        groups: get().groups.map((g) => (g._id === groupId ? res.data : g)),
        selectedGroup: get().selectedGroup?._id === groupId ? res.data : get().selectedGroup,
      });
      toast.success("Member removed!");
      return res.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove member");
      return null;
    }
  },

  leaveGroup: async (groupId) => {
    try {
      await axiosInstance.delete(`/groups/${groupId}/leave`);
      set({
        groups: get().groups.filter((g) => g._id !== groupId),
        selectedGroup: null,
        groupMessages: [],
      });
      const socket = useAuthStore.getState().socket;
      if (socket) socket.emit("leaveGroup", groupId);
      toast.success("Left group successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to leave group");
    }
  },

  deleteGroup: async (groupId) => {
    try {
      await axiosInstance.delete(`/groups/${groupId}`);
      set({
        groups: get().groups.filter((g) => g._id !== groupId),
        selectedGroup: null,
        groupMessages: [],
      });
      toast.success("Group deleted successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete group");
    }
  },

  subscribeToGroupMessages: () => {
    const { selectedGroup } = get();
    if (!selectedGroup) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newGroupMessage", (newMessage) => {
      if (newMessage.groupId !== selectedGroup._id) return;
      set({ groupMessages: [...get().groupMessages, newMessage] });
    });

    socket.on("messageDeleted", ({ messageId, groupId }) => {
      if (groupId && groupId !== selectedGroup._id) return;
      set({ groupMessages: get().groupMessages.filter((m) => m._id !== messageId) });
    });

    socket.on("groupUpdated", (updatedGroup) => {
      if (updatedGroup._id !== selectedGroup._id) return;
      set({
        selectedGroup: updatedGroup,
        groups: get().groups.map((g) => (g._id === updatedGroup._id ? updatedGroup : g)),
      });
    });

    socket.on("memberRemoved", ({ groupId, userId }) => {
      const authUser = useAuthStore.getState().authUser;
      if (userId === authUser._id && groupId === selectedGroup._id) {
        set({ selectedGroup: null, groupMessages: [], groups: get().groups.filter((g) => g._id !== groupId) });
        toast.error("You were removed from the group");
      }
    });

    socket.on("groupDeleted", ({ groupId }) => {
      if (groupId !== selectedGroup._id) return;
      set({ selectedGroup: null, groupMessages: [], groups: get().groups.filter((g) => g._id !== groupId) });
      toast.error("This group was deleted by an admin");
    });

    socket.on("memberLeft", ({ groupId }) => {
      if (groupId !== selectedGroup._id) return;
      get().getMyGroups(); // refresh groups to get updated member list
    });
  },

  unsubscribeFromGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newGroupMessage");
    socket.off("messageDeleted");
    socket.off("groupUpdated");
    socket.off("memberRemoved");
    socket.off("groupDeleted");
    socket.off("memberLeft");
  },

  setSelectedGroup: (group) => set({ selectedGroup: group, groupMessages: [] }),
}));

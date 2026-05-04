import Group from "../models/group.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io } from "../lib/socket.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const creatorId = req.user._id;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Group name is required" });
    }

    // Always include the creator in members
    const memberSet = [...new Set([...(members || []), creatorId.toString()])];

    const group = new Group({
      name: name.trim(),
      description: description?.trim() || "",
      members: memberSet,
      admins: [creatorId],
      createdBy: creatorId,
    });

    await group.save();
    await group.populate("members", "-password");
    await group.populate("admins", "-password");

    res.status(201).json(group);
  } catch (error) {
    console.log("Error in createGroup:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ members: userId })
      .populate("members", "-password")
      .populate("admins", "-password")
      .sort({ updatedAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    console.log("Error in getMyGroups:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user._id;

    // Check membership
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!group.members.some((m) => m.toString() === userId.toString())) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    const messages = await Message.find({ groupId })
      .populate("senderId", "fullName profilePic")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getGroupMessages:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: groupId } = req.params;
    const senderId = req.user._id;

    // Check membership
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!group.members.some((m) => m.toString() === senderId.toString())) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      groupId,
      text,
      image: imageUrl,
    });

    await newMessage.save();
    await newMessage.populate("senderId", "fullName profilePic");

    // Emit to the group's socket room
    io.to(`group_${groupId}`).emit("newGroupMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendGroupMessage:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { name, description, groupPic } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.admins.some((a) => a.toString() === userId.toString())) {
      return res.status(403).json({ message: "Only admins can update group info" });
    }

    if (name) group.name = name.trim();
    if (description !== undefined) group.description = description.trim();

    if (groupPic) {
      const uploadResponse = await cloudinary.uploader.upload(groupPic);
      group.groupPic = uploadResponse.secure_url;
    }

    await group.save();
    await group.populate("members", "-password");
    await group.populate("admins", "-password");

    // Notify group members
    io.to(`group_${groupId}`).emit("groupUpdated", group);

    res.status(200).json(group);
  } catch (error) {
    console.log("Error in updateGroup:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addMember = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { userId: newMemberId } = req.body;
    const requesterId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.admins.some((a) => a.toString() === requesterId.toString())) {
      return res.status(403).json({ message: "Only admins can add members" });
    }

    if (group.members.some((m) => m.toString() === newMemberId)) {
      return res.status(400).json({ message: "User is already a member" });
    }

    group.members.push(newMemberId);
    await group.save();
    await group.populate("members", "-password");
    await group.populate("admins", "-password");

    io.to(`group_${groupId}`).emit("groupUpdated", group);

    res.status(200).json(group);
  } catch (error) {
    console.log("Error in addMember:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { id: groupId, userId: targetUserId } = req.params;
    const requesterId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.admins.some((a) => a.toString() === requesterId.toString())) {
      return res.status(403).json({ message: "Only admins can remove members" });
    }

    if (targetUserId === requesterId.toString()) {
      return res.status(400).json({ message: "Use leave group to remove yourself" });
    }

    group.members = group.members.filter((m) => m.toString() !== targetUserId);
    group.admins = group.admins.filter((a) => a.toString() !== targetUserId);
    await group.save();
    await group.populate("members", "-password");
    await group.populate("admins", "-password");

    io.to(`group_${groupId}`).emit("groupUpdated", group);
    io.to(`group_${groupId}`).emit("memberRemoved", { groupId, userId: targetUserId });

    res.status(200).json(group);
  } catch (error) {
    console.log("Error in removeMember:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.some((m) => m.toString() === userId.toString())) {
      return res.status(400).json({ message: "You are not a member of this group" });
    }

    const isSoleAdmin =
      group.admins.length === 1 &&
      group.admins[0].toString() === userId.toString() &&
      group.members.length > 1;

    if (isSoleAdmin) {
      // Promote next member
      const nextMember = group.members.find((m) => m.toString() !== userId.toString());
      if (nextMember) group.admins.push(nextMember);
    }

    group.members = group.members.filter((m) => m.toString() !== userId.toString());
    group.admins = group.admins.filter((a) => a.toString() !== userId.toString());

    if (group.members.length === 0) {
      // No members left, delete group
      await Message.deleteMany({ groupId: group._id });
      await Group.findByIdAndDelete(groupId);
      return res.status(200).json({ message: "Group deleted as last member left" });
    }

    await group.save();

    io.to(`group_${groupId}`).emit("memberLeft", { groupId, userId: userId.toString() });

    res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    console.log("Error in leaveGroup:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.admins.some((a) => a.toString() === userId.toString())) {
      return res.status(403).json({ message: "Only admins can delete the group" });
    }

    await Message.deleteMany({ groupId });
    await Group.findByIdAndDelete(groupId);

    io.to(`group_${groupId}`).emit("groupDeleted", { groupId });

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.log("Error in deleteGroup:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroup,
  getMyGroups,
  getGroupMessages,
  sendGroupMessage,
  updateGroup,
  addMember,
  removeMember,
  leaveGroup,
  deleteGroup,
} from "../controllers/group.controller.js";

const router = express.Router();

router.post("/", protectRoute, createGroup);
router.get("/", protectRoute, getMyGroups);
router.get("/:id/messages", protectRoute, getGroupMessages);
router.post("/:id/send", protectRoute, sendGroupMessage);
router.put("/:id", protectRoute, updateGroup);
router.post("/:id/members", protectRoute, addMember);
router.delete("/:id/members/:userId", protectRoute, removeMember);
router.delete("/:id/leave", protectRoute, leaveGroup);
router.delete("/:id", protectRoute, deleteGroup);

export default router;

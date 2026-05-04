import { Server } from "socket.io";
import http from "http";
import express from "express";
import Group from "../models/group.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", async (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;

    // Join all group rooms this user is a member of
    try {
      const groups = await Group.find({ members: userId });
      groups.forEach((group) => {
        socket.join(`group_${group._id}`);
      });
    } catch (err) {
      console.log("Error joining group rooms:", err.message);
    }
  }

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Allow client to join a group room dynamically (e.g. after creating a new group)
  socket.on("joinGroup", (groupId) => {
    socket.join(`group_${groupId}`);
  });

  socket.on("leaveGroup", (groupId) => {
    socket.leave(`group_${groupId}`);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
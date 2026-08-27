import express from "express";
import { Server } from "socket.io";
import http from "http";

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:4000";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: [allowedOrigin] } });
// makea  server htpp with both socket and express

const userSocketMap = {}; // {userId: [socketId1, socketId2]}

export function getReceiverSocketId(userId) {
  return userSocketMap[userId]; // now returns an array of socket ids
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    if (!userSocketMap[userId]) userSocketMap[userId] = [];
    userSocketMap[userId].push(socket.id);
  }

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    if (userId && userSocketMap[userId]) {
      userSocketMap[userId] = userSocketMap[userId].filter(id => id !== socket.id);
      if (userSocketMap[userId].length === 0) {
        delete userSocketMap[userId];
      }
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, server, io, getReceiverSocketId };

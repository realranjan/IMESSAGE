import express from "express";
import { Server } from "socket.io";
import http from "http";

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:4000";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: [allowedOrigin] } });
// makea  server htpp with both socket and express

function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

//online users map ={userId:socketId} userid 123:456socket mapping between them to link them
const userSocketMap = {};
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId; // from frimtrend
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  //listen for events
  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { app, server, io, getReceiverSocketId };

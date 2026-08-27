import { io } from "socket.io-client";
const socket = io("https://imessage-ysbb.onrender.com", { query: { userId: "fake_id_123" }, transports: ["websocket"] });
socket.on("connect", () => {
    console.log("Connected remotely with id:", socket.id);
});
socket.on("getOnlineUsers", (users) => {
    console.log("Remote online users:", users);
    socket.disconnect();
    setTimeout(() => process.exit(0), 100);
});
socket.on("connect_error", (err) => {
    console.log("Remote connect error:", err.message);
    process.exit(1);
});
setTimeout(() => {
    console.log("Remote timeout");
    process.exit(1);
}, 5000);

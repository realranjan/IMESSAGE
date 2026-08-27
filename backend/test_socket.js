import { io } from "socket.io-client";
const socket = io("http://localhost:5000", { query: { userId: "test_id" } });
socket.on("connect", () => {
    console.log("Connected with id:", socket.id);
});
socket.on("getOnlineUsers", (users) => {
    console.log("Online users:", users);
    socket.disconnect();
    setTimeout(() => process.exit(0), 100);
});
socket.on("connect_error", (err) => {
    console.log("Connect error:", err.message);
    process.exit(1);
});
setTimeout(() => {
    console.log("Timeout");
    process.exit(1);
}, 3000);

import 'dotenv/config';
import { connectDB } from "./src/lib/db.js";
import Message from "./src/models/message.model.js";
import mongoose from "mongoose";

async function test() {
  await connectDB();
  const newMessage = new Message({
    senderId: new mongoose.Types.ObjectId(),
    receiverId: new mongoose.Types.ObjectId(),
    text: "test",
  });
  await newMessage.save();
  console.log("JSON Output:", JSON.stringify(newMessage));
  process.exit(0);
}
test();

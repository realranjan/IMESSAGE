import { connectDB } from "./backend/src/lib/db.js";
import Message from "./backend/src/models/message.model.js";

async function test() {
  await connectDB();
  
  const myId = '6a8f4c7952c2a44b0d3949cf'; // from earlier
  const userToChatId = '6a8f4cae52c2a44b0d3949d0';
  
  const msgs = await Message.find({
    $or: [
      { senderId: myId, receiverId: userToChatId },
      { senderId: userToChatId, receiverId: myId },
    ],
  }).sort({ createdAt: 1 });
  
  console.log("Found matches:", msgs.length);
  process.exit(0);
}

test();

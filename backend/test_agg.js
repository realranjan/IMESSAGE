import 'dotenv/config';
import { connectDB } from "./src/lib/db.js";
import Message from "./src/models/message.model.js";
import mongoose from "mongoose";

async function test() {
  await connectDB();
  
  const loggedInUserId = new mongoose.Types.ObjectId('6a8f4c7952c2a44b0d3949cf'); // myId
  
  try {
      const conversations = await Message.aggregate([
        //1.keep only the messages i sent or received
        {
          $match: {
            $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
          },
        },
        //2.collapse them into one row per cahrt pattern, noticing our lastest mesag time.
        {
          $group: {
            //the partner is the other person
            _id: {
              $cond: [
                { $eq: ["$senderId", loggedInUserId] },
                "$receiverId",
                "$senderId",
              ],
            },
            lastMessageAt: { $max: "$createdAt" },
            unreadCount: { 
              $sum: { 
                $cond: [
                  { $and: [{ $eq: ["$receiverId", loggedInUserId] }, { $eq: ["$isRead", false] }] }, 
                  1, 
                  0
                ] 
              } 
            }
          },
        },
        //3.put the most recent messages on top .
        { $sort: { lastMessageAt: -1 } },
        //4.look up each partners user profile (comes back as an array).
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        //5.pull that profile make it document from array
        { $replaceRoot: { newRoot: { $first: "$user" } } },
        //6.hode the private clerkid from result
        { $project: { clerkId: 0 } },
      ]);
      console.log("Conversations:", conversations.length);
      console.log(conversations);
  } catch (err) {
      console.error(err);
  }
  process.exit(0);
}

test();

import User from "../models/user.model.js";
import { upload } from "../middleware/upload.middleware.js";
import { io, getReceiverSocketId } from "../lib/socket.js";
import { hasImageKitConfig, uploadChatMedia } from "../lib/imagekit.js";
import Message from "../models/message.model.js";
export async function getUSersForSidebar(req, res) {
  try {
    const loggedInUserId = req.user._id; // we did that req.user=user

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-clerkId");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error({ "Error in getUSersforsidebar": error.message });
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getConversationsForSidebar(req, res) {
  try {
    const loggedInUserId = req.user._id;

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
      { $replaceRoot: { newRoot: { $first: "user" } } },
      //6.hode the private clerkid from result
      { $project: { clerkId: 0 } },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error in getconversationsfor dide bar ".error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMessages(req, res) {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // Fix Mongoose $or string-casting failure by explicitly casting the route parameter
    const mongoose = (await import("mongoose")).default;
    const targetId = new mongoose.Types.ObjectId(userToChatId);

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: targetId },
        { senderId: targetId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getconversationsfor dide bar ".error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function sendMessage(req, res) {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    //case 1
    let imageUrl; // null values
    let videoUrl;
    if (req.file) {
      if (!hasImageKitConfig()) {
        return res
          .status(500)
          .json({ message: "media upload is not configured" });
      }

      const url = await uploadChatMedia(req.file);
      if (req.file.mimetype.startsWith("video/")) {
        videoUrl = url;
      } else {
        imageUrl = url;
      }
    }

    const newMessage = new Message({
      senderId: senderId,
      receiverId: receiverId,
      text: text,
      image: imageUrl,
      video: videoUrl,
    });
    
    await newMessage.save();
    
    //to view the message whch was created we jave to rfresh it hence we will impleent it using socket io relatime talking mesaging here
    //
    const receiverSocketId = getReceiverSocketId(receiverId);
    
    //only send data if user is online
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in getconversationsfor dide bar ".error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

import { getAuth } from "@clerk/express";
import User from "../models/user.model.js";
//check if user is authenticaed or not and re use req.user everywhere which ahs user
export async function protectRoute(req, res, next) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ message: "unauthorized" });
      return;
    }

    const user = await User.findOne({
      clerkId: userId,
    });

    if (!user) {
      res.status(404).json({ message: "USer profile is not synced yet" });
      return;
    }

    req.user = user; // we are appending another property to req.user which ahs body adna ll
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

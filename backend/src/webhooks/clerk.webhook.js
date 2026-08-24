import express from "express";
import User from "../models/user.model.js";
import { verifyWebhook } from "@clerk/backend/webhooks";
import dotenv from "dotenv";

const clerkWebhook = express.Router();
dotenv.config();
// we check if the req coming has signinf secret or not
clerkWebhook.post("/", async (req, res) => {
  try {
    const signingsecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    if (!signingsecret) {
      return res
        .status(503)
        .json({ message: "Webhook secret is not provided" });
    }
    //the clerk send in post request if some ome send the post req
    // the clerk we put bufffer so we have to conver that data into string
    const payload = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : String(req.body);

    const request = new Request("http://internal/webhooks/clerk", {
      method: "POST",
      headers: new Headers(req.headers),
      body: payload,
    });
    //handle error if the sig is wrong

    // adn then get the data here after verifying all the dat is returned in evt
    const evt = await verifyWebhook(request, { signingSecret: signingsecret });

    if (evt.type === "user.created" || evt.type === "user.updated") {
      const u = evt.data;

      // we get the email from data
      const email =
        u.email_addresses?.find((e) => e.id === u.primary_email_address_id)
          ?.email_address ?? u.email_addresses?.[0]?.email_address;

      //full name from data
      const fullName =
        [u.first_name, u.last_name].filter(Boolean).join(" ") ||
        u.username ||
        email?.split("@")[0];

      //upate them in momgodb
      await User.findOneAndUpdate(
        { clerkId: u.id },
        { clerkId: u.id, email, fullName, profilePic: u.image_url },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
    }
    if (evt.type === "user.deleted") {
      if (evt.data.id) await User.findOneAndDelete({ clerkId: evt.data.id });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error in clerk webhook:", error);
    res.status(400).json({ message: "Webhook verification failed" });
  }
});
export default clerkWebhook;

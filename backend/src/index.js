import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import https from "https";
import { connectDB } from "./lib/db.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import clerkWebhook from "./webhooks/clerk.webhook.js";

import job from "./lib/cron.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL;

const publicDir = path.join(process.cwd(), "public");
// so that the data remain s in raw foramt not parsed
app.use(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhook,
);

//default middlewrre

app.use(express.json());
app.use(cors({ origin: FRONTEND_URL, credentials: true })); //any website to call not safe so
app.use(clerkMiddleware());

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
//
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  app.get(/.*/, (req, res, next) => {
    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
  });
}
//catch all routes
// // Load SSL certs
// const sslOptions = {
//   key: fs.readFileSync("server.key"),
//   cert: fs.readFileSync("server.cert"),
// };

// Connect DB first, then start HTTPS server
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`✅ HTTP Express server running at http://localhost:${port}`);

      if (process.env.NODE_ENV === "production") {
        return job.start();
      }
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to DB:", err.message);
    process.exit(1);
  });

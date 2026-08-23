import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import https from "https";
import { connectDB } from "./lib/db.js";
import express from "express";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL;

//default middlewrre

app.use(express.json());
app.use(cors({ origin: FRONTEND_URL, credentials: true })); //any website to call not safe so
app.use(clerkMiddleware());

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

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
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to DB:", err.message);
    process.exit(1);
  });

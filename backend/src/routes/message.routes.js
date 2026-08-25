import express from "express";
import { upload } from "../middleware/upload.middleware.js";
import {
  getUSersForSidebar,
  getMessages,sendMessage
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = express.Router();
router.use(protectRoute); // instead of router.get("/users", protectRoute, getUSersForSidebar);
router.get("/users", getUSersForSidebar);
router.get("/conversations", getUSersForSidebar);
router.get("/:id", getMessages);
router.post("/send/:id", upload.single("media") ,sendMessage);
//todo:show this in the frontend part
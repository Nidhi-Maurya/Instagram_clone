import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { addReelComment, createReel, dislikeReel, getReelFeed, likeReel, viewReel } from "../controllers/reel.controller.js";

const router = express.Router();

router.post("/create", isAuthenticated, upload.single("video"), createReel);
router.get("/feed", isAuthenticated, getReelFeed);
router.get("/:id/like", isAuthenticated, likeReel);
router.get("/:id/dislike", isAuthenticated, dislikeReel);
router.post("/:id/comment", isAuthenticated, addReelComment);
router.post("/:id/view", isAuthenticated, viewReel);

export default router;

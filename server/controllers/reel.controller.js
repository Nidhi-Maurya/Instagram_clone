import { Reel } from "../models/reel.model.js";
import { ReelComment } from "../models/reelComment.model.js";
import User from "../models/user.model.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";

export const createReel = async (req, res) => {
  try {
    const { caption } = req.body;
    const video = req.file;
    const authorId = req.id;

    if (!video) {
      return res.status(400).json({ message: "Video required", success: false });
    }

    if (!video.mimetype?.startsWith("video/")) {
      return res.status(400).json({ message: "Only video files are allowed", success: false });
    }

    const fileUri = getDataUri(video);
    const cloudResponse = await cloudinary.uploader.upload(fileUri, {
      resource_type: "video",
      folder: "insta_clone_reels",
      eager: [{ width: 720, height: 1280, crop: "limit", quality: "auto" }],
    });

    const reel = await Reel.create({
      caption,
      video: cloudResponse.secure_url,
      thumbnail: cloudResponse.secure_url?.replace(/\.(mp4|mov|webm)$/i, ".jpg") || "",
      author: authorId,
    });

    await reel.populate({ path: "author", select: "username profilePicture followers" });

    return res.status(201).json({
      message: "Reel uploaded successfully",
      reel,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Reel upload failed", success: false });
  }
};

export const getReelFeed = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(12, Math.max(3, Number(req.query.limit) || 6));
    const skip = (page - 1) * limit;
    const currentUser = await User.findById(req.id).select("following");
    const followingIds = (currentUser?.following || []).map((id) => id.toString());

    const reels = await Reel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit * 3)
      .populate({ path: "author", select: "username profilePicture followers" })
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 }, limit: 20 },
        populate: { path: "author", select: "username profilePicture" },
      });

    const rankedReels = reels
      .map((reel) => {
        const authorId = reel.author?._id?.toString();
        const likesCount = Array.isArray(reel.likes) ? reel.likes.length : 0;
        const commentsCount = Array.isArray(reel.comments) ? reel.comments.length : 0;
        const authorFollowersCount = Array.isArray(reel.author?.followers) ? reel.author.followers.length : 0;
        const ageHours = Math.max(1, (Date.now() - new Date(reel.createdAt).getTime()) / (1000 * 60 * 60));
        const recencyScore = Math.max(0, 72 - ageHours) / 72;
        const discoveryBoost = authorId && !followingIds.includes(authorId) ? 8 : 0;

        return {
          reel,
          score: likesCount * 3 + commentsCount * 4 + reel.views * 0.2 + authorFollowersCount * 0.3 + discoveryBoost + recencyScore * 10,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.reel);

    return res.status(200).json({
      reels: rankedReels,
      page,
      hasMore: reels.length > limit,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to fetch reels", success: false });
  }
};

export const likeReel = async (req, res) => {
  try {
    const userId = req.id;
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: "Reel not found", success: false });

    await reel.updateOne({ $addToSet: { likes: userId } });
    return res.status(200).json({ message: "Reel liked", success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to like reel", success: false });
  }
};

export const dislikeReel = async (req, res) => {
  try {
    const userId = req.id;
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: "Reel not found", success: false });

    await reel.updateOne({ $pull: { likes: userId } });
    return res.status(200).json({ message: "Reel disliked", success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to dislike reel", success: false });
  }
};

export const viewReel = async (req, res) => {
  try {
    await Reel.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to update view", success: false });
  }
};

export const addReelComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "text required", success: false });

    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: "Reel not found", success: false });

    const comment = await ReelComment.create({
      text: text.trim(),
      author: req.id,
      reel: reel._id,
    });
    await comment.populate({ path: "author", select: "username profilePicture" });

    reel.comments.push(comment._id);
    await reel.save();

    return res.status(201).json({ message: "Comment added", comment, success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to comment", success: false });
  }
};

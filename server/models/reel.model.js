import mongoose from "mongoose";

const reelSchema = new mongoose.Schema(
  {
    caption: { type: String, default: "" },
    video: { type: String, required: true },
    thumbnail: { type: String, default: "" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "ReelComment" }],
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Reel = mongoose.model("Reel", reelSchema);

import mongoose from "mongoose";

const reelCommentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reel: { type: mongoose.Schema.Types.ObjectId, ref: "Reel", required: true },
  },
  { timestamps: true }
);

export const ReelComment = mongoose.model("ReelComment", reelCommentSchema);

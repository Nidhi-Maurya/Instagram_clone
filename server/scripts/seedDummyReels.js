import dotenv from "dotenv";
dotenv.config({});

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import cloudinary from "../utils/cloudinary.js";
import User from "../models/user.model.js";
import { Reel } from "../models/reel.model.js";

const seedSources = [
  {
    source: "https://res.cloudinary.com/demo/video/upload/dog.mp4",
    caption: "Golden hour walk. Demo reel.",
    slug: "golden-hour-walk",
  },
  {
    source: "https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4",
    caption: "Ocean mood. Demo reel.",
    slug: "ocean-mood",
  },
  {
    source: "https://res.cloudinary.com/demo/video/upload/elephants.mp4",
    caption: "Wildlife moment. Demo reel.",
    slug: "wildlife-moment",
  },
];

const captions = [
  "Aesthetic evening reel.",
  "Slow motion city vibe.",
  "Weekend memory.",
  "Nature looks good today.",
  "Tiny clip, big mood.",
  "Travel style moment.",
  "Soft light reel.",
  "Explore something new.",
  "Daily life highlight.",
  "Clean reel for testing.",
  "Visual story moment.",
  "Simple but cinematic.",
  "Fresh reel drop.",
  "Just a good view.",
  "Scrolling mood.",
  "Reel feed starter.",
  "Good frame, good day.",
  "Short video vibe.",
  "Demo content reel.",
  "Made for the reels page.",
];

const buildSeedItems = () => captions.map((caption, index) => {
  const source = seedSources[index % seedSources.length];
  return {
    source: source.source,
    caption,
    slug: `demo-reel-${String(index + 1).padStart(2, "0")}-${source.slug}`,
  };
});

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in .env");
  }
  await mongoose.connect(process.env.MONGODB_URI);
};

const getSeedUser = async () => {
  const email = "reels.seed@instagram-clone.local";
  const existingUser = await User.findOne({ email });
  if (existingUser) return existingUser;

  const password = await bcrypt.hash(`Seed@${Date.now()}`, 10);
  return User.create({
    username: "instagram_reels",
    email,
    password,
    bio: "Demo reels for the reels feed",
  });
};

const uploadVideo = async (item) => {
  const uploadOptions = {
    resource_type: "video",
    folder: "insta_clone_seed_reels",
    public_id: item.slug,
    overwrite: true,
  };

  try {
    return await cloudinary.uploader.upload(item.source, uploadOptions);
  } catch (error) {
    console.log(`Primary source failed for ${item.slug}. Falling back to dog demo video.`);
    return cloudinary.uploader.upload(seedSources[0].source, uploadOptions);
  }
};

const seedReels = async () => {
  await connectDB();
  const seedUser = await getSeedUser();
  const seedItems = buildSeedItems();

  let created = 0;
  let skipped = 0;

  for (const item of seedItems) {
    const exists = await Reel.findOne({ author: seedUser._id, caption: item.caption });
    if (exists) {
      skipped += 1;
      continue;
    }

    const uploadResult = await uploadVideo(item);
    await Reel.create({
      author: seedUser._id,
      caption: item.caption,
      video: uploadResult.secure_url,
      thumbnail: uploadResult.secure_url?.replace(/\.(mp4|mov|webm)$/i, ".jpg") || "",
      views: Math.floor(Math.random() * 900) + 100,
    });
    created += 1;
    console.log(`Created ${created}: ${item.caption}`);
  }

  console.log(`Seed complete. Created: ${created}, skipped: ${skipped}`);
  await mongoose.disconnect();
};

seedReels().catch(async (error) => {
  console.error("Seed failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});

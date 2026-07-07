import dotenv from "dotenv";
dotenv.config({});

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import cloudinary from "../utils/cloudinary.js";
import User from "../models/user.model.js";
import { Reel } from "../models/reel.model.js";
import { ReelComment } from "../models/reelComment.model.js";

const seedSources = [
  {
    source: "https://media.w3.org/2010/05/sintel/trailer.mp4",
    slug: "sintel-trailer",
  },
  {
    source: "https://media.w3.org/2010/05/bunny/trailer.mp4",
    slug: "bunny-trailer",
  },
  {
    source: "https://res.cloudinary.com/demo/video/upload/elephants.mp4",
    slug: "elephants",
  },
  {
    source: "https://res.cloudinary.com/demo/video/upload/dog.mp4",
    slug: "dog",
  },
  {
    source: "https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4",
    slug: "sea-turtle",
  },
  {
    source: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    slug: "flower",
  },
  {
    source: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
    slug: "sample-5s",
  },
  {
    source: "https://samplelib.com/lib/preview/mp4/sample-10s.mp4",
    slug: "sample-10s",
  },
  {
    source: "https://samplelib.com/lib/preview/mp4/sample-15s.mp4",
    slug: "sample-15s",
  },
  {
    source: "https://samplelib.com/lib/preview/mp4/sample-20s.mp4",
    slug: "sample-20s",
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
    slug: `demo-reel-v2-${String(index + 1).padStart(2, "0")}-${source.slug}`,
    startOffset: index % 2 === 0 ? "0" : "2",
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
  const oldSeedReels = await Reel.find({ author: seedUser._id }).select("_id");
  const oldSeedReelIds = oldSeedReels.map((reel) => reel._id);
  if (oldSeedReelIds.length) {
    await Promise.all([
      ReelComment.deleteMany({ reel: { $in: oldSeedReelIds } }),
      Reel.deleteMany({ _id: { $in: oldSeedReelIds } }),
    ]);
    console.log(`Removed old seed reels: ${oldSeedReelIds.length}`);
  }

  for (const item of seedItems) {
    const uploadResult = await uploadVideo(item);
    const videoUrl = cloudinary.url(uploadResult.public_id, {
      resource_type: "video",
      secure: true,
      transformation: [
        { start_offset: item.startOffset, duration: "7", crop: "fill", width: 720, height: 1280, gravity: "center", quality: "auto" },
      ],
    });

    await Reel.create({
      author: seedUser._id,
      caption: item.caption,
      video: videoUrl,
      thumbnail: uploadResult.secure_url?.replace(/\.(mp4|mov|webm)$/i, ".jpg") || "",
      views: Math.floor(Math.random() * 900) + 100,
    });
    created += 1;
    console.log(`Created ${created}: ${item.caption}`);
  }

  console.log(`Seed complete. Created: ${created}`);
  await mongoose.disconnect();
};

seedReels().catch(async (error) => {
  console.error("Seed failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});

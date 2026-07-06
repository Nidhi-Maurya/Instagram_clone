// test-cloudinary.js
import cloudinary from "./utils/cloudinary.js";

try {
  const result = await cloudinary.uploader.upload(
    "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    {
      resource_type: "image",
    }
  );

  console.log("Upload success:", result.secure_url);
} catch (error) {
  console.log("Upload failed:", error);
}
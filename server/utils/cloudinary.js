 import {v2 as cloudinary} from "cloudinary";

 import dotenv from "dotenv";

 dotenv.config({});

 cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  api_key:process.env.API_KEY,
  api_secret:process.env.API_SECRET
 });

 export default cloudinary;




// import { v2 as cloudinary } from "cloudinary";
// import dotenv from "dotenv";

// dotenv.config();

// const cloudName = process.env.CLOUD_NAME?.trim();
// const apiKey = process.env.API_KEY?.trim();
// const apiSecret = process.env.API_SECRET?.trim();

// console.log("Cloudinary Check:", {
//   cloudName,
//   apiKey,
//   apiSecretLoaded: Boolean(apiSecret),
//   apiSecretLength: apiSecret?.length,
// });

// cloudinary.config({
//   cloud_name: cloudName,
//   api_key: apiKey,
//   api_secret: apiSecret,
// });


// // cloudinary.api.ping()
// //   .then((res) => console.log("Cloudinary ping success:", res))
// //   .catch((err) => console.log("Cloudinary ping error:", err));

// export default cloudinary;
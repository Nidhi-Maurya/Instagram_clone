import dotenv from 'dotenv';
dotenv.config({});

import  connectDB  from './utils/db.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from "http";
import userRoute from "./routes/user.route.js"
import postRoute from "./routes/post.route.js"
import messageRoute from "./routes/message.route.js"
import { initSocket } from "./socket.js";
import path from "path"

const PORT = process.env.PORT || 8000;

const __dirname = path.resolve();


const app= express();
const server = createServer(app);
initSocket(server);



app.get("/", (req,res)=>{
  res.send("Hello Nidhi ");
})



// ! middle ware 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials:true,
}

app.use(cors(corsOptions));


// ! here import api 

app.use("/api/v1/user",userRoute);
// "http://localhost:8000/api/v1/user/register"
// ! api for post 
app.use("/api/v1/post",postRoute);
app.use("/api/v1/message",messageRoute)


app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get("/*splat", (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});


server.listen(PORT,()=>{

connectDB();

  console.log(`Server is running on port ${PORT}`);
})



// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";

// import connectDB from "./utils/db.js";
// import userRoute from "./routes/user.route.js";

// const app = express();
// const PORT = process.env.PORT || 8000;

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );

// app.get("/", (req, res) => {
//   res.send("Hello Nidhi");
// });

// app.use("/api/v1/user", userRoute);

// connectDB();

// const server = app.listen(PORT, "127.0.0.1", () => {
//   console.log(`Server running on http://127.0.0.1:${PORT}`);
// });

// server.on("error", (error) => {
//   console.log("Server listen error:", error);
// });

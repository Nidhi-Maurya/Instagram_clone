

// import mongoose from  'mongoose';

// const userSchema= new mongoose.Schema({
//   username:{ type:String, required:true,unique:true},
//   email:{ type:String, required:true,unique:true},
//   password:{ type:String, required:true},
//   profilePicture:{ type:String, default:""},
//   bio:{ type:String, default:"", max:200},
//   gender:{type:String, enum:["male", "female", "other"], default:""},
//   followers: [{type:mongoose.Schema.Types.ObjectId, ref:"User"}],
//   following: [{type:mongoose.Schema.Types.ObjectId, ref:"User"}],
//   posts: [{type:mongoose.Schema.Types.ObjectId, ref:"Post"}],
//   bookmarks: [{type:mongoose.Schema.Types.ObjectId, ref:"Post"}],
// } ,{timestamps:true});


// export const User = mongoose.model("User", userSchema);



import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 200 },
    gender: { type: String, enum: ["male", "female", "other"], default: "other" },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followRequestsSent: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followRequestsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;


import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";
import { Post } from "../models/post.modal.js";
import { Comment } from "../models/comment.modal.js";
import { Reel } from "../models/reel.model.js";
import { ReelComment } from "../models/reelComment.model.js";
import { getIO, getReceiverSocketId } from "../socket.js";

const passwordRuleMessage = "Password must be at least 8 characters and include uppercase, lowercase, number and special character";
const isStrongPassword = (password = "") => (
  password.length >= 8
  && /[A-Z]/.test(password)
  && /[a-z]/.test(password)
  && /\d/.test(password)
  && /[^A-Za-z0-9]/.test(password)
);

export const register  = async(req,res)=>{
  try{
    const {username,email,password} =req.body;
    if(!username|| !email || !password) {
      return res.status(400).json({
        message:"fill the all fields",
        success:false,
      })
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: passwordRuleMessage,
        success: false,
      })
    }
    const user =await User.findOne({email});
    if(user){
      return res.status(400).json({
        message:"Email already exists try with another email",
        success:false,
      })
    };

    const hashedPassword =await bcrypt.hash(password,10);
    await User.create({username,email,password:hashedPassword});

    return res.status(201).json({
      message:"Account created successfully",
      success:true,
    })
  }catch(error){
    console.log(error)
  }
}


//! LOGIN USER 


export const login = async( req,res)=>{
  try {
    const {email,password} = req.body;
    if(!email || !password){
      return res.status(400).json({
        message:"fill the all fields",
        success:false,
      })
    } 
let user =await User.findOne({email}).populate("followRequestsReceived", "username profilePicture bio followers");
if(!user){
  return res.status(401).json({
    message:"User not found",
    success:false,
  })
}
const isPasswordMatch = await bcrypt.compare(password,user.password);
if(!isPasswordMatch){
  return res.status(401).json({
    message:"Invalid password",
    success:false,
  })
}

const token = await jwt.sign({id:user._id},process.env.SECRET_KEY,{expiresIn:"1d"});

// ! populate each post if in the post array 

const populatedPost= await Promise.all(
  user.posts.map(async (postId)=>{
    const post = await Post.findById(postId);
     if(post.author.equals(user._id)){
      return post;
     }

     return null;

  })
)




return res.cookie('token',token,{httpOnly:true,sameSite:'strict',maxAge:24*60*60*1000}).status(200).json({
  message:`Welcome back ${user.username}`,
  success:true,
  user:{
    _id:user._id,
    username:user.username,
    email:user.email,
    profilePicture:user.profilePicture,
    bio:user.bio,
    gender:user.gender,
    followers:user.followers,
    following:user.following,
    followRequestsSent:user.followRequestsSent,
    followRequestsReceived:user.followRequestsReceived,
    posts:populatedPost.filter(Boolean),
    bookmarks:user.bookmarks
  }
})


  }catch(error){
console.log(error)
  }
}




// ! LOGOUT USER


export const logout = async(req,res)=>{
 try{
   return res.clearCookie('token',"", {maxAge:0}).status(200).json({
    message:"Logout successful",
    success:true
  })

 }catch(error){
  console.log(error)
 }
};



// ! GET USER PROFILE

export const getProfile = async( req,res)=>{
  try{
    const userId= req.params.id;
    let user=await User.findById(userId).select('-password').populate({
      path:'posts',
      options:{sort:{createdAt:-1}},
      populate:{path:'author',select:'username profilePicture'}
    }).populate({
      path:'bookmarks',
      options:{sort:{createdAt:-1}},
      populate:{path:'author',select:'username profilePicture'}
    }).populate({
      path:'followRequestsReceived',
      select:'username profilePicture bio followers'
    }).populate({
      path:'followers',
      select:'username profilePicture bio followers'
    }).populate({
      path:'following',
      select:'username profilePicture bio followers'
    });
    return res.status(200).json({
      user,
      success:true,
    });

  }catch(error){
console.log(error);
  }
}



// ! Edit Profile,


export const editProfile =async(req,res)=>{
  try{
    const {bio,gender,username}= req.body;
    const profilePicture=req.file || req.files?.profilePhoto?.[0] || req.files?.profilePicture?.[0];
    const  userId= req.id;
    let cloudResponse;
    if(profilePicture){
      const fileUri = getDataUri(profilePicture);
      cloudResponse=  await cloudinary.uploader.upload(fileUri)
    }

// console.log("USER ID FROM TOKEN:", req.id);

    const user = await User.findById(userId).select('-password');
    if(!user){
       return res.status(404).json({
        message: "User not found",
        success:false,
       })
    }
    if(username !== undefined){
      const trimmedUsername = String(username).trim();
      if(!trimmedUsername){
        return res.status(400).json({
          message: "Username is required",
          success:false,
        })
      }
      const usernameExists = await User.findOne({
        username: trimmedUsername,
        _id: { $ne: userId },
      });
      if(usernameExists){
        return res.status(400).json({
          message: "Username already taken",
          success:false,
        })
      }
      user.username = trimmedUsername;
    }
    if(bio !== undefined) user.bio=bio;
    if(gender !== undefined) user.gender=gender;
    if(profilePicture) user.profilePicture= cloudResponse.secure_url;

    await user.save();

    return  res.status(200).json({
      message:"Profile Updated",
      success:true,
      user,
    })

  }catch(error){
    console.log(error);
    return res.status(500).json({
      message: "Profile update failed",
      success:false,
      error:error.message,
    })
  }
}


// const uploadToCloudinary = (fileBuffer) => {
//   return new Promise((resolve, reject) => {
//     const uploadStream = cloudinary.uploader.upload_stream(
//       {
// resource_type: "auto",
//       },
//       (error, result) => {
//         if (error) reject(error);
//         else resolve(result);
//       }
//     );

//     uploadStream.end(fileBuffer);
//   });
// };

// export const editProfile = async (req, res) => {
//   try {
//     const { bio, gender } = req.body;
//     const profilePicture = req.file;
//     const userId = req.id;

//     let cloudResponse;
//   if (profilePicture) {
//       console.log("File check:", {
//         originalname: profilePicture.originalname,
//         mimetype: profilePicture.mimetype,
//         size: profilePicture.size,
//         hasBuffer: Boolean(profilePicture.buffer),
//       });

//       cloudResponse = await uploadToCloudinary(profilePicture.buffer);
//     }


//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({
//         message: "User not found",
//         success: false,
//       });
//     }

//     if (bio) user.bio = bio;
//     if (gender) user.gender = gender;
//     // if (profilePicture) user.profilePicture = cloudResponse.secure_url;
// if (profilePicture) {
//   console.log("Uploaded file check:", {
//     fieldname: profilePicture.fieldname,
//     originalname: profilePicture.originalname,
//     mimetype: profilePicture.mimetype,
//     size: profilePicture.size,
//     hasBuffer: Boolean(profilePicture.buffer),
//   });

//   const fileUri = getDataUri(profilePicture);

//   console.log("File URI check:", {
//     hasFileUri: Boolean(fileUri),
//     startsWith: fileUri?.substring(0, 40),
//   });

//   cloudResponse = await cloudinary.uploader.upload(fileUri, {
//     folder: "insta_clone",
//     resource_type: "auto",
//   });
// }
//     await user.save();

//     return res.status(200).json({
//       message: "Profile Updated",
//       success: true,
//       user,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       message: "Internal server error",
//       success: false,
//       error: error.message,
//     });
//   }
// };
// ! Suggested USER 



export const getSuggestedUser = async (req,res)=>{
  try {
    const suggestedUsers= await User.find({ _id:{$ne:req.id}}).select("-password");
    if(!suggestedUsers){
      return res.status(400).json({
        message:" No users",
      })
    }

return res.status(200).json({
  success:true,
  users:suggestedUsers
})

  }catch(error){
    console.log(error);
  }
};


// ! follow un follow


// export const followOrUnfollow =async(req,res)=>{
//   try{
//      const followeKrneVala = req.Id;  // ,me
//      console.log("followkrnevska" , followeKrneVala);
//      const jiskofollowKrenge = req.params.id; 
//       // my friend
//       console.log("jiskofollowe krnung", jiskofollowKrenge)

//   if(followeKrneVala === jiskofollowKrenge){
//     return res.status(400).json({
//       message: "You can't folow yourself",
//       success:false
//     })
//   }

//   const user =await User.findById(followeKrneVala);
//   const targetUser = await User.findById(jiskofollowKrenge)

//     if(!user || ! targetUser){
//       return res.status(400).json({
//         message:"User not found",
//         success:false,
//       })
//     }
 
//     //  ! now check follow kre or unfollow kre 

//  const isFollowing = user.following.includes(jiskoFollowKrenge);
//  if(isFollowing){
//   //! unfllowing logic

//    await Promise.all([
//   User.updateOne({_id:followeKrneVala},{$pull:{following:jiskoFollowKrenge}}),
//    User.updateOne({_id:jiskofollowKrenge},{$pull:{follower:followeKrneVala}}),
// ])

// return res.status(200).json({
//   message:"Ufollowed",
//   success:true,
// })


//  }  else {
//   // ! unfollowing Logic 
// await Promise.all([
//   User.updateOne({_id:followeKrneVala},{$push:{following:jiskoFollowKrenge}}),
//    User.updateOne({_id:jiskofollowKrenge},{$push:{follower:followeKrneVala}}),
// ])

// return res.status(200).json({
//   message:"following",
//   success:true,
// })

//  }

//   }catch(error){
//     console.log(error)
//   }
// }



export const followOrUnfollow = async (req, res) => {
  try {
    const followKrneVala = req.id; // me
    const jiskoFollowKrenge = req.params.id; // target user


    if (followKrneVala === jiskoFollowKrenge) {
      return res.status(400).json({
        message: "You can't follow yourself",
        success: false,
      });
    }

    const user = await User.findById(followKrneVala);
    const targetUser = await User.findById(jiskoFollowKrenge);

    if (!user || !targetUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const isFollowing = user.following.some((id) => id.toString() === jiskoFollowKrenge);
    const hasRequested = user.followRequestsSent.some((id) => id.toString() === jiskoFollowKrenge);

    if (isFollowing) {
      await Promise.all([
        User.updateOne(
          { _id: followKrneVala },
          { $pull: { following: jiskoFollowKrenge, followRequestsSent: jiskoFollowKrenge } }
        ),
        User.updateOne(
          { _id: jiskoFollowKrenge },
          { $pull: { followers: followKrneVala, followRequestsReceived: followKrneVala } }
        ),
      ]);

      return res.status(200).json({
        message: "Unfollowed",
        following: false,
        requested: false,
        success: true,
      });
    }

    if (hasRequested) {
      await Promise.all([
        User.updateOne(
          { _id: followKrneVala },
          { $pull: { followRequestsSent: jiskoFollowKrenge } }
        ),
        User.updateOne(
          { _id: jiskoFollowKrenge },
          { $pull: { followRequestsReceived: followKrneVala } }
        ),
      ]);

      const receiverSocketId = getReceiverSocketId(jiskoFollowKrenge);
      if (receiverSocketId) {
        getIO()?.to(receiverSocketId).emit("followRequestNotification", {
          type: "cancel",
          userId: followKrneVala,
        });
      }

      return res.status(200).json({
        message: "Request cancelled",
        following: false,
        requested: false,
        success: true,
      });
    }

    await Promise.all([
      User.updateOne(
        { _id: followKrneVala },
        { $addToSet: { followRequestsSent: jiskoFollowKrenge } }
      ),
      User.updateOne(
        { _id: jiskoFollowKrenge },
        { $addToSet: { followRequestsReceived: followKrneVala } }
      ),
    ]);

    const receiverSocketId = getReceiverSocketId(jiskoFollowKrenge);
    if (receiverSocketId) {
      getIO()?.to(receiverSocketId).emit("followRequestNotification", {
        type: "request",
        user: {
          _id: user._id,
          username: user.username,
          profilePicture: user.profilePicture,
          bio: user.bio,
          followers: user.followers,
        },
      });
    }

    return res.status(200).json({
      message: "Follow request sent",
      following: false,
      requested: true,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const userPosts = await Post.find({ author: userId }).select("_id");
    const userPostIds = userPosts.map((post) => post._id);
    const userComments = await Comment.find({ author: userId }).select("_id");
    const userCommentIds = userComments.map((comment) => comment._id);
    const userReels = await Reel.find({ author: userId }).select("_id");
    const userReelIds = userReels.map((reel) => reel._id);
    const userReelComments = await ReelComment.find({ author: userId }).select("_id");
    const userReelCommentIds = userReelComments.map((comment) => comment._id);

    await Promise.all([
      Comment.deleteMany({ $or: [{ author: userId }, { post: { $in: userPostIds } }] }),
      ReelComment.deleteMany({ $or: [{ author: userId }, { reel: { $in: userReelIds } }] }),
      Post.deleteMany({ author: userId }),
      Reel.deleteMany({ author: userId }),
      Post.updateMany(
        {},
        {
          $pull: {
            likes: userId,
            comments: { $in: userCommentIds },
          },
        }
      ),
      Reel.updateMany(
        {},
        {
          $pull: {
            likes: userId,
            comments: { $in: userReelCommentIds },
          },
        }
      ),
      User.updateMany(
        { _id: { $ne: userId } },
        {
          $pull: {
            followers: userId,
            following: userId,
            followRequestsSent: userId,
            followRequestsReceived: userId,
            bookmarks: { $in: userPostIds },
          },
        }
      ),
      User.findByIdAndDelete(userId),
    ]);

    return res.clearCookie('token',"", {maxAge:0}).status(200).json({
      message: "Account permanently deleted",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Account deletion failed",
      success: false,
      error: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.id)
      .select("-password")
      .populate("followRequestsReceived", "username profilePicture bio followers");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const populatedPost = await Promise.all(
      user.posts.map(async (postId) => {
        const post = await Post.findById(postId);
        if (post?.author?.equals(user._id)) {
          return post;
        }
        return null;
      })
    );

    return res.status(200).json({
      success: true,
      user: {
        _id:user._id,
        username:user.username,
        email:user.email,
        profilePicture:user.profilePicture,
        bio:user.bio,
        gender:user.gender,
        followers:user.followers,
        following:user.following,
        followRequestsSent:user.followRequestsSent,
        followRequestsReceived:user.followRequestsReceived,
        posts:populatedPost.filter(Boolean),
        bookmarks:user.bookmarks
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to fetch user",
      success: false,
    });
  }
};

export const respondFollowRequest = async (req, res) => {
  try {
    const receiverId = req.id;
    const senderId = req.params.id;
    const action = req.params.action;

    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({
        message: "Invalid request action",
        success: false,
      });
    }

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver || !sender) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const hasRequest = receiver.followRequestsReceived.some((id) => id.toString() === senderId);
    if (!hasRequest) {
      return res.status(404).json({
        message: "Follow request not found",
        success: false,
      });
    }

    const receiverUpdate = {
      $pull: { followRequestsReceived: senderId },
    };
    const senderUpdate = {
      $pull: { followRequestsSent: receiverId },
    };

    if (action === "accept") {
      receiverUpdate.$addToSet = { followers: senderId };
      senderUpdate.$addToSet = { following: receiverId };
    }

    await Promise.all([
      User.updateOne({ _id: receiverId }, receiverUpdate),
      User.updateOne({ _id: senderId }, senderUpdate),
    ]);

    return res.status(200).json({
      message: action === "accept" ? "Follow request accepted" : "Follow request deleted",
      accepted: action === "accept",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Request update failed",
      success: false,
      error: error.message,
    });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();
    if (!query) {
      return res.status(200).json({
        success: true,
        users: [],
      });
    }

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const users = await User.find({
      _id: { $ne: req.id },
      username: { $regex: escapedQuery, $options: "i" },
    })
      .select("username profilePicture bio followers")
      .limit(20);

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Search failed",
      success: false,
    });
  }
};

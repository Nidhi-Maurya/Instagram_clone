
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";
import { Post } from "../models/post.modal.js";

export const register  = async(req,res)=>{
  try{
    const {username,email,password} =req.body;
    if(!username|| !email || !password) {
      return res.status(400).json({
        message:"fill the all fields",
        success:false,
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
let user =await User.findOne({email});
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




return res.cookie('token',token,{
  httpOnly:true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge:24*60*60*1000
}).status(200).json({
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
   return res.clearCookie('token', {
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge:0
   }).status(200).json({
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
    const {bio,gender}= req.body;
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

    const isFollowing = user.following.includes(jiskoFollowKrenge);

    if (isFollowing) {
      await Promise.all([
        User.updateOne(
          { _id: followKrneVala },
          { $pull: { following: jiskoFollowKrenge } }
        ),
        User.updateOne(
          { _id: jiskoFollowKrenge },
          { $pull: { followers: followKrneVala } }
        ),
      ]);

      return res.status(200).json({
        message: "Unfollowed",
        success: true,
      });
    } else {
      await Promise.all([
        User.updateOne(
          { _id: followKrneVala },
          { $push: { following: jiskoFollowKrenge } }
        ),
        User.updateOne(
          { _id: jiskoFollowKrenge },
          { $push: { followers: followKrneVala } }
        ),
      ]);

      return res.status(200).json({
        message: "Following",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};


import sharp from "sharp";
import  { Post } from "../models/post.modal.js";
import User from "../models/user.model.js";
import cloudinary from "../utils/cloudinary.js";
import { Comment } from "../models/comment.modal.js";
import { getIO, getReceiverSocketId } from "../socket.js";

const emitToReceiver = (receiverId, eventName, payload) => {
  const receiverSocketIds = getReceiverSocketId(receiverId);
  const socketIds = Array.isArray(receiverSocketIds) ? receiverSocketIds : receiverSocketIds ? [receiverSocketIds] : [];
  socketIds.forEach((socketId) => getIO()?.to(socketId).emit(eventName, payload));
};

export  const addNewPost = async (req,res)=>{
  try{
    
    const {caption} = req.body;

    console.log("BODY:", req.body);
    const image = req.file;
    const authorId=req.id;

    if(!image) return res.status(400).json({message:'Image required'});

// !Image upload
const optimizedImageBuffer = await sharp(image.buffer).resize({width:800,height:800,fit:'inside'}).toFormat('jpeg',{quality:80}).toBuffer();


const fileUri =`data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;

const cloudResponse =await cloudinary.uploader.upload(fileUri)

const post = await Post.create({
  caption,
  image:cloudResponse.secure_url,
  author:authorId
});

const user =await User.findById(authorId);

if(user){
  user.posts.push(post._id);
  await user.save();
}

await post.populate({path:'author',select :'-password'});

return res.status(201).json({
  message:'Post uploaded successdully',
  post,
  success:true,
})

  }catch(error){
    console.log(error);
  }
}


// ! get all post 


export const getAllPost =async (req,res)=>{
  try{

    const posts = await Post.find().sort({createdAt:-1}).populate({path:'author',select:'username  profilePicture'}).populate({
      path:'comments',
      sort:{createdAt:-1},
      populate:{path:'author',select: 'username profilePicture'}
    })
return res.status(200).json({
  posts,success:true
})
  }catch(error){
    console.log(error)
  }
}

export const getExplorePosts = async (req, res) => {
  try {
    const currentUserId = req.id;
    const currentUser = await User.findById(currentUserId).select("following");
    const followingIds = (currentUser?.following || []).map((id) => id.toString());

    const posts = await Post.find({ author: { $ne: currentUserId } })
      .sort({ createdAt: -1 })
      .limit(120)
      .populate({ path: "author", select: "username profilePicture followers" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: { path: "author", select: "username profilePicture" },
      });

    const rankedPosts = posts
      .map((post) => {
        const authorId = post.author?._id?.toString();
        const likesCount = Array.isArray(post.likes) ? post.likes.length : 0;
        const commentsCount = Array.isArray(post.comments) ? post.comments.length : 0;
        const isNotFollowingAuthor = authorId && !followingIds.includes(authorId);
        const authorFollowersCount = Array.isArray(post.author?.followers) ? post.author.followers.length : 0;
        const ageHours = Math.max(1, (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60));
        const recencyScore = Math.max(0, 48 - ageHours) / 48;

        return {
          post,
          score:
            likesCount * 3 +
            commentsCount * 4 +
            authorFollowersCount * 0.4 +
            (isNotFollowingAuthor ? 8 : 0) +
            recencyScore * 10,
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((item) => item.post);

    return res.status(200).json({
      success: true,
      posts: rankedPosts,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Explore posts failed",
      success: false,
    });
  }
};


// ! user all post 


export const getPostOfUser = async (req,res)=>{
  try {
    const authorId=req.id;
    const posts = await Post.find({author:authorId}).sort({createdAt:-1}).populate({
      path:'author',
      select:'username profilePicture'
    }).populate({
      path:'comments',
      sort:{createdAt:-1},
      populate:{
        path:'author',
        select:"username profilePicture"
      }
    })
    return res.status(200).json({
  posts,success:true
  })

  }catch(err){
    console.log(err);
  }
}


// ! likes  


export const likePost = async (req,res) =>{
  try{
     const likeKrneWalaUserKiId= req.id;
     const postId= req.params.id;
     const post = await Post.findById(postId).populate({path:'author',select:'username profilePicture'});
     if(!post) return res.status(404).json({
      message: "Post not found",
      success:false
     })

    //  ! LIKES LOGIC

    await post.updateOne({$addToSet:{likes:likeKrneWalaUserKiId}});

    await post.save();

    const postOwnerId = post.author?._id?.toString();
    if(postOwnerId && postOwnerId !== likeKrneWalaUserKiId){
      const likedUser = await User.findById(likeKrneWalaUserKiId).select("username profilePicture");
      const notification = {
        type: "like",
        userId: likeKrneWalaUserKiId,
        postId,
        postImage: post.image,
        userDetails: likedUser,
        message: "liked your post",
      };
      const receiverSocketId = getReceiverSocketId(postOwnerId);
      if(receiverSocketId) emitToReceiver(postOwnerId, "notification", notification);
    }

    return res.status(200).json({message:'post liked',success:true})


  }catch(err){
    console.log(err)
  }
}



// ! DISLIKE POST 


export const dislikePost = async (req,res) =>{
  try{
     const likeKrneWalaUserKiId= req.id;
     const postId= req.params.id;
     const post = await Post.findById(postId).populate({path:'author',select:'username profilePicture'});
     if(!post) return res.status(404).json({
      message: "Post not found",
      success:false
     })

    //  ! LIKES LOGIC

    await post.updateOne({$pull:{likes:likeKrneWalaUserKiId}});

    await post.save();

    const postOwnerId = post.author?._id?.toString();
    if(postOwnerId && postOwnerId !== likeKrneWalaUserKiId){
      const notification = {
        type: "dislike",
        userId: likeKrneWalaUserKiId,
        postId,
      };
      const receiverSocketId = getReceiverSocketId(postOwnerId);
      if(receiverSocketId) emitToReceiver(postOwnerId, "notification", notification);
    }

    return res.status(200).json({message:'post disliked',success:true})


  }catch(err){
    console.log(err)
  }
}



// ! add comment 

// export const addComment = async(req,res)=>{
//   try{
//     const postId=req.params.id;
//     const commentKrneWaleUserKiId =req.id;

//     const {text} =req.body;
//     const post =await Post.findById(postId);
//     if(!text){
//       return res.status(400).json({message:'text required',success:false})
//     }

// const comment =await Comment.create({
//   text,
//   author:commentKrneWaleUserKiId,
//   post:postId
// }).populate({
//   path:'author',
//   select:"username  profilePicture"
// });

// post.comments.push(comment._id);
// await post.save();


// return res.status(201).json({
//   message:'Comment Added',
//   comment,
//   success:true
// })

//   }
//   catch(err){
//     console.log(err)
//   }
// };

export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const commentKrneWaleUserKiId = req.id;

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        message: "text required",
        success: false,
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    const comment = await Comment.create({
      text,
      author: commentKrneWaleUserKiId,
      post: postId,
    });

    await comment.populate({
      path: "author",
      select: "username profilePicture",
    });

    post.comments.push(comment._id);
    await post.save();

    return res.status(201).json({
      message: "Comment Added",
      comment,
      success: true,
    });
  } catch (err) {
    console.log(err);
  }
};


// ! logic for  single single post comments getting 


export const getCommentsOfPost = async (req,res)=>{
  try{
    const postId= req.params.id;
    const comments = await Comment.find({post:postId}).populate('author', 'username profilePicture');
    if(!comments) return res.status(404).json({
      message:"No comments",
       success: false
    });
    return res.status(200).json({success:true,comments})

  }catch(err){
    console.log(err)
  }
}



// ! Delete POst

export const DeletePost = async (req,res)=>{
  try {
const postId= req.params.id;
const authorId=req.id;

const post = await Post.findById(postId);
if(!post ) return res.status(404).json({message:"Post not found", success:false});
// ! check if if the logged in use is the owner of the post 

if(post.author.toString() !== authorId) return res.status(403).json({message:"unauthorized"});

// ! Delte post

await Post.findByIdAndDelete(postId);

// ! remove post id from user id

let user = await User.findById(authorId);
user.posts=user.posts.filter(id=> id.toString() !== postId)

await user.save();

// delete associated comments 

 await Comment.deleteMany({post:postId});

 return res.status(200).json({
  success:true,
  message:"Post Deleted"
 })

  }
  catch(err){
    console.log(err)
  }
}



// ! BOOK MARK POST 

 export const bookMarkPost = async(req,res)=>{
  try{
    const postId =req.params.id;
    const authorId =req.id;
    const  post= await Post.findById(postId);
    if(!post ) return res.status(404).json({message:"Post not found",success:false});

    const user = await User.findById(authorId);
    if(user.bookmarks.includes(post._id)){
      //! already bookmard --> remove it
      await user.updateOne({$pull : {bookmarks:post._id}});
      await user.save();
      return res.status(200).json({type: 'unsaved',message: 'Post remove from bookmark',success:true})


    }else {
      //! save it
await user.updateOne({$addToSet : {bookmarks:post._id}});
      await user.save();
      return res.status(200).json({type: 'saved',message: 'Post  bookmarked',success:true})

    }



  }
   catch(err){
console.log(err)
  }
 }

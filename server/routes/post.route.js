


import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

import { addNewPost,getAllPost,getCommentsOfPost,getPostOfUser,likePost,dislikePost ,addComment, DeletePost,bookMarkPost, getExplorePosts} from "../controllers/post.controller.js";


const router =express.Router();

router.post("/addpost", isAuthenticated, upload.single("image"), addNewPost);
router.get("/all", isAuthenticated, getAllPost);
router.get("/explore", isAuthenticated, getExplorePosts);
router.get("/userpost/all", isAuthenticated, getPostOfUser);
router.get("/:id/like", isAuthenticated, likePost);
router.get("/:id/dislike", isAuthenticated, dislikePost);
router.post("/:id/comment", isAuthenticated, addComment);
router.get("/:id/comment/all", isAuthenticated, getCommentsOfPost);
router.delete("/delete/:id", isAuthenticated, DeletePost);
router.get("/:id/bookmark", isAuthenticated, bookMarkPost);




export default router;


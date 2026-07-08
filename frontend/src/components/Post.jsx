import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { Button } from './ui/button'
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from './CommentDialog'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { setAuthUser, updateUserProfilePostComments, updateUserProfilePostLikes } from '@/redux/authSlice'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Badge } from './ui/badge'
import { apiUrl, getUserId } from '@/lib/api'

const Post = ({ post }) => {
    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);
    const { user } = useSelector(store => store.auth);
    const { posts } = useSelector(store => store.post);
    const userId = getUserId(user);
    const userBookmarks = Array.isArray(user?.bookmarks) ? user.bookmarks : [];
    const isInitiallyBookmarked = userBookmarks.some((bookmark) => {
        const bookmarkId = typeof bookmark === "string" ? bookmark : bookmark?._id;
        return bookmarkId === post?._id;
    });
    const [liked, setLiked] = useState((post.likes || []).includes(userId) || false);
    const [postLike, setPostLike] = useState((post.likes || []).length);
    const [comment, setComment] = useState(post.comments || []);
    const [bookmarked, setBookmarked] = useState(isInitiallyBookmarked);
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if (inputText.trim()) {
            setText(inputText);
        } else {
            setText("");
        }
    }

    const likeOrDislikeHandler = async () => {
        try {
            const action = liked ? 'dislike' : 'like';
            const res = await axios.get(apiUrl(`/api/v1/post/${post._id}/${action}`), { withCredentials: true });
            console.log(res.data);
            if (res.data.success) {
                const updatedLikes = liked ? postLike - 1 : postLike + 1;
                setPostLike(updatedLikes);
                setLiked(!liked);

                // apne post ko update krungi
                const updatedPostData = posts.map(p =>
                    p._id === post._id ? {
                        ...p,
                        likes: liked ? (p.likes || []).filter(id => id !== userId) : [...(p.likes || []), userId]
                    } : p
                );
                dispatch(setPosts(updatedPostData));
                dispatch(updateUserProfilePostLikes({
                    postId: post._id,
                    userId,
                    type: liked ? "dislike" : "like",
                }));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const commentHandler = async () => {

        try {
            const res = await axios.post(apiUrl(`/api/v1/post/${post._id}/comment`), { text }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            console.log(res.data);
            if (res.data.success) {
                const updatedCommentData = [...comment, res.data.comment];
                setComment(updatedCommentData);

                const updatedPostData = posts.map(p =>
                    p._id === post._id ? { ...p, comments: updatedCommentData } : p
                );

                dispatch(setPosts(updatedPostData));
                dispatch(setSelectedPost({ ...post, comments: updatedCommentData }));
                dispatch(updateUserProfilePostComments({ postId: post._id, comment: res.data.comment }));
                toast.success(res.data.message);
                setText("");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const deletePostHandler = async () => {
        try {
            const res = await axios.delete(apiUrl(`/api/v1/post/delete/${post?._id}`), { withCredentials: true })
            if (res.data.success) {
                const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id);
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.messsage);
        }
    }

    const bookmarkHandler = async () => {
        try {
            const res = await axios.get(apiUrl(`/api/v1/post/${post?._id}/bookmark`), {withCredentials:true});
            if(res.data.success){
                const nextBookmarked = res.data.type === 'saved';
                const nextBookmarks = nextBookmarked
                    ? [...userBookmarks, post._id]
                    : userBookmarks.filter((bookmark) => {
                        const bookmarkId = typeof bookmark === "string" ? bookmark : bookmark?._id;
                        return bookmarkId !== post._id;
                    });

                setBookmarked(nextBookmarked);
                dispatch(setAuthUser({ ...user, bookmarks: nextBookmarks }));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <article className='mx-auto my-6 w-full max-w-md overflow-hidden px-1 sm:my-8 sm:px-0'>
            <div className='flex items-center justify-between'>
                <div className='flex min-w-0 items-center gap-2'>
                    <Avatar className='shrink-0'>
                        <AvatarImage src={post.author?.profilePicture} alt="post_image" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className='flex min-w-0 items-center gap-2'>
                        <h1 className='truncate text-sm font-medium'>{post.author?.username}</h1>
                       {userId === post.author?._id &&  <Badge variant="secondary">Author</Badge>}
                    </div>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <MoreHorizontal className='cursor-pointer' />
                    </DialogTrigger>
                    <DialogContent className="flex flex-col items-center text-sm text-center">
                        {
                        post?.author?._id !== userId && <Button variant='ghost' className="cursor-pointer w-fit text-[#ED4956] font-bold">Unfollow</Button>
                        }
                        
                        <Button variant='ghost' className="cursor-pointer w-fit">Add to favorites</Button>
                        {
                            user && userId === post?.author?._id && <Button onClick={deletePostHandler} variant='ghost' className="cursor-pointer w-fit">Delete</Button>
                        }
                    </DialogContent>
                </Dialog>
            </div>
            <img
                className='rounded-sm my-2 w-full aspect-square object-cover'
                src={post.image}
                alt="post_img"
            />

            <div className='flex items-center justify-between my-2'>
                <div className='flex items-center gap-3'>
                    {
                        liked ? <FaHeart onClick={likeOrDislikeHandler} size={'24'} className='cursor-pointer text-red-600' /> : <FaRegHeart onClick={likeOrDislikeHandler} size={'22px'} className='cursor-pointer hover:text-gray-600' />
                    }

                    <MessageCircle onClick={() => {
                        dispatch(setSelectedPost(post));
                        setOpen(true);
                    }} className='cursor-pointer hover:text-gray-600' />
                    <Send className='cursor-pointer hover:text-gray-600' />
                </div>
                <Bookmark
                    onClick={bookmarkHandler}
                    className={`cursor-pointer hover:text-gray-600 ${bookmarked ? 'fill-black text-black' : ''}`}
                />
            </div>
            <span className='font-medium block mb-2'>{postLike} likes</span>
            <p className='break-words text-sm leading-6'>
                <span className='font-medium mr-2'>{post.author?.username}</span>
                {post.caption}
            </p>
            {
                comment.length > 0 && (
                    <span onClick={() => {
                        dispatch(setSelectedPost(post));
                        setOpen(true);
                    }} className='cursor-pointer text-sm text-gray-400'>View all {comment.length} comments</span>
                )
            }
            <CommentDialog open={open} setOpen={setOpen} />
            <div className='flex items-center justify-between gap-2 border-b border-gray-100 py-2'>
                <input
                    type="text"
                    placeholder='Add a comment...'
                    value={text}
                    onChange={changeEventHandler}
                    className='min-w-0 flex-1 outline-none text-sm'
                />
                {
                    text && <button type='button' onClick={commentHandler} className='shrink-0 text-sm font-medium text-[#3BADF8]'>Post</button>
                }

            </div>
        </article>
    )
}

export default Post

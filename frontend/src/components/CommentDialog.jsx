import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { Button } from './ui/button'
import { useDispatch, useSelector } from 'react-redux'
import Comment from './Comment'
import axios from 'axios'
import { toast } from 'sonner'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { updateUserProfilePostComments, updateUserProfilePostLikes } from '@/redux/authSlice'
import { apiUrl, getUserId } from '@/lib/api'

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const { selectedPost, posts } = useSelector(store => store.post);
  const { user } = useSelector(store => store.auth);
  const userId = getUserId(user);
  const [comment, setComment] = useState([]);
  const [liked, setLiked] = useState(false);
  const [postLike, setPostLike] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedPost) {
      setComment(Array.isArray(selectedPost.comments) ? selectedPost.comments : []);
      const likes = Array.isArray(selectedPost.likes) ? selectedPost.likes : [];
      setLiked(likes.includes(userId));
      setPostLike(likes.length);
    }
  }, [selectedPost, userId]);

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  }

  const sendMessageHandler = async () => {

    try {
      const res = await axios.post(apiUrl(`/api/v1/post/${selectedPost?._id}/comment`), { text }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);

        const updatedPostData = posts.map(p =>
          p._id === selectedPost._id ? { ...p, comments: updatedCommentData } : p
        );
        dispatch(setPosts(updatedPostData));
        dispatch(setSelectedPost({ ...selectedPost, comments: updatedCommentData }));
        dispatch(updateUserProfilePostComments({ postId: selectedPost._id, comment: res.data.comment }));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const likeOrDislikeHandler = async () => {
    if (!selectedPost?._id || !userId) return;
    try {
      const action = liked ? "dislike" : "like";
      const res = await axios.get(apiUrl(`/api/v1/post/${selectedPost._id}/${action}`), { withCredentials: true });
      if (res.data.success) {
        const nextLiked = !liked;
        const updatedLikes = nextLiked
          ? [...(Array.isArray(selectedPost.likes) ? selectedPost.likes : []), userId]
          : (Array.isArray(selectedPost.likes) ? selectedPost.likes : []).filter((id) => id !== userId);
        const updatedPost = { ...selectedPost, likes: updatedLikes };

        setLiked(nextLiked);
        setPostLike(updatedLikes.length);
        dispatch(setSelectedPost(updatedPost));
        dispatch(setPosts(posts.map((post) => post._id === selectedPost._id ? updatedPost : post)));
        dispatch(updateUserProfilePostLikes({
          postId: selectedPost._id,
          userId,
          type: nextLiked ? "like" : "dislike",
        }));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent onInteractOutside={() => setOpen(false)} className="h-[92dvh] max-w-6xl overflow-hidden p-0 md:h-[86dvh]">
        <div className='flex h-full min-h-0 flex-col bg-white md:flex-row'>
          <div className='flex max-h-[46dvh] w-full items-center justify-center bg-black md:max-h-none md:w-[58%]'>
            <img
              src={selectedPost?.image}
              alt="post_img"
              className='max-h-full w-full object-contain'
            />
          </div>
          <div className='flex min-h-0 w-full flex-1 flex-col md:w-[42%]'>
            <div className='flex h-14 shrink-0 items-center justify-between border-b border-gray-200 px-4'>
              <div className='flex min-w-0 items-center gap-3'>
                <Link>
                  <Avatar className='h-8 w-8 shrink-0'>
                    <AvatarImage src={selectedPost?.author?.profilePicture} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Link>
                <div className='min-w-0'>
                  <Link className='block truncate text-sm font-semibold'>{selectedPost?.author?.username}</Link>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <MoreHorizontal className='cursor-pointer' />
                </DialogTrigger>
                <DialogContent className="flex flex-col items-center text-sm text-center">
                  <div className='w-full cursor-pointer text-[#ED4956] font-bold'>
                    Unfollow
                  </div>
                  <div className='w-full cursor-pointer'>
                    Add to favorites
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className='min-h-0 flex-1 overflow-y-auto px-4 py-3'>
              <div className='pb-3'>
                <div className='flex items-start gap-3 py-2'>
                  <Avatar className='h-8 w-8 shrink-0'>
                    <AvatarImage src={selectedPost?.author?.profilePicture} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <p className='min-w-0 break-words text-sm leading-5'>
                    <span className='font-semibold'>{selectedPost?.author?.username}</span>
                    {selectedPost?.caption && <span className='pl-1'>{selectedPost.caption}</span>}
                  </p>
                </div>
              </div>

              {comment.length > 0 ? (
                comment.map((comment) => <Comment key={comment._id} comment={comment} />)
              ) : (
                <div className='flex h-32 flex-col items-center justify-center text-center text-sm text-gray-500'>
                  <MessageCircle className='mb-2 h-8 w-8 text-gray-300' />
                  <p>No comments yet.</p>
                  <p>Start the conversation.</p>
                </div>
              )}
            </div>

            <div className='shrink-0 border-t border-gray-200'>
              <div className='flex items-center justify-between px-4 py-3'>
                <div className='flex items-center gap-4'>
                  <Heart
                    onClick={likeOrDislikeHandler}
                    className={`h-6 w-6 cursor-pointer hover:text-gray-500 ${liked ? "fill-red-500 text-red-500" : ""}`}
                  />
                  <MessageCircle className='h-6 w-6 cursor-pointer hover:text-gray-500' />
                  <Send className='h-6 w-6 cursor-pointer hover:text-gray-500' />
                </div>
              </div>
              <div className='px-4 pb-2 text-sm font-semibold'>{postLike} likes</div>
              <div className='flex items-center gap-3 border-t border-gray-100 px-4 py-3'>
                <input type="text" value={text} onChange={changeEventHandler} placeholder='Add a comment...' className='min-w-0 flex-1 bg-transparent text-sm outline-none' />
                <Button disabled={!text.trim()} onClick={sendMessageHandler} variant="ghost" className='h-8 shrink-0 px-0 font-semibold text-[#0095F6] hover:bg-transparent hover:text-[#1877f2] disabled:text-[#9ccff5]'>Post</Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CommentDialog

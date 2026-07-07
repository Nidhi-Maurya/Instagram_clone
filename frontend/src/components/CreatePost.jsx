import React, { useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { readFileAsDataURL } from '@/lib/utils';
import { Film, ImagePlus, Loader2, MapPin, Smile, X } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '@/redux/postSlice';
import { apiUrl } from '@/lib/api';

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const videoUrlRef = useRef("");
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [mediaPreview, setMediaPreview] = useState("");
  const [mode, setMode] = useState("post");
  const [loading, setLoading] = useState(false);
  const {user} = useSelector(store=>store.auth);
  const {posts} = useSelector(store=>store.post);
  const dispatch = useDispatch();

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
      setFile(file);
      if (mode === "reel") {
        const objectUrl = URL.createObjectURL(file);
        videoUrlRef.current = objectUrl;
        setMediaPreview(objectUrl);
      } else {
        const dataUrl = await readFileAsDataURL(file);
        setMediaPreview(dataUrl);
      }
    }
  }

  const resetPostState = () => {
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current);
      videoUrlRef.current = "";
    }
    setFile("");
    setCaption("");
    setMediaPreview("");
    setMode("post");
    setLoading(false);
    if (imageRef.current) imageRef.current.value = "";
  }

  const closeDialog = () => {
    if (loading) return;
    resetPostState();
    setOpen(false);
  }

  const createPostHandler = async (e) => {
    const formData = new FormData();
    formData.append("caption", caption);
    if (mediaPreview) formData.append("image", file);
    try {
      setLoading(true);
      const res = await axios.post(apiUrl('/api/v1/post/addpost'), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]));// [1] -> [1,2] -> total element = 2
        toast.success(res.data.message);
        resetPostState();
        setOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Post upload failed");
    } finally {
      setLoading(false);
    }
  }

  const createReelHandler = async () => {
    const formData = new FormData();
    formData.append("caption", caption);
    if (mediaPreview) formData.append("video", file);
    try {
      setLoading(true);
      const res = await axios.post(apiUrl('/api/v1/reel/create'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        resetPostState();
        setOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Reel upload failed");
    } finally {
      setLoading(false);
    }
  }

  const shareHandler = () => {
    if (mode === "reel") createReelHandler();
    else createPostHandler();
  }

  const modeChangeHandler = (nextMode) => {
    if (loading || nextMode === mode) return;
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current);
      videoUrlRef.current = "";
    }
    setMode(nextMode);
    setFile("");
    setMediaPreview("");
    if (imageRef.current) imageRef.current.value = "";
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && closeDialog()}>
      <DialogContent onInteractOutside={(e) => {
        e.preventDefault();
        closeDialog();
      }} className='max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-[920px] gap-0 overflow-hidden rounded-xl border-0 p-0 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-xl xl:max-w-[980px]'>
        <DialogHeader className='relative flex h-11 shrink-0 items-center justify-center border-b border-gray-200 px-14 text-center'>
          <button
            type='button'
            onClick={closeDialog}
            className='absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full hover:bg-gray-100'
            aria-label='Close create post'
          >
            <X className='h-5 w-5' />
          </button>
          <h2 className='text-base font-semibold'>{mediaPreview ? (mode === "reel" ? "Create new reel" : "Create new post") : "Create"}</h2>
          {mediaPreview && (
            <button
              type='button'
              disabled={loading}
              onClick={shareHandler}
              className='absolute right-3 top-1/2 max-w-20 -translate-y-1/2 truncate text-sm font-semibold text-[#0095F6] disabled:text-gray-300 sm:right-4'
            >
              {loading ? "Sharing..." : "Share"}
            </button>
          )}
        </DialogHeader>

        {!mediaPreview ? (
          <div className='flex min-h-[360px] flex-col items-center justify-center px-6 py-10 text-center sm:min-h-[480px]'>
            <div className='mb-8 flex rounded-lg bg-gray-100 p-1'>
              <button
                type='button'
                onClick={() => modeChangeHandler("post")}
                className={`flex h-9 items-center gap-2 rounded-md px-4 text-sm font-semibold ${mode === "post" ? 'bg-white shadow-sm' : 'text-gray-500'}`}
              >
                <ImagePlus className='h-4 w-4' />
                Post
              </button>
              <button
                type='button'
                onClick={() => modeChangeHandler("reel")}
                className={`flex h-9 items-center gap-2 rounded-md px-4 text-sm font-semibold ${mode === "reel" ? 'bg-white shadow-sm' : 'text-gray-500'}`}
              >
                <Film className='h-4 w-4' />
                Reel
              </button>
            </div>
            <div className='mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-black sm:h-24 sm:w-24'>
              {mode === "reel" ? <Film className='h-10 w-10 sm:h-12 sm:w-12' /> : <ImagePlus className='h-10 w-10 sm:h-12 sm:w-12' />}
            </div>
            <p className='mb-6 text-lg font-light sm:text-xl'>{mode === "reel" ? "Select a video for your reel" : "Drag photos here"}</p>
            <input ref={imageRef} type='file' accept={mode === "reel" ? 'video/*' : 'image/*'} className='hidden' onChange={fileChangeHandler} />
            <button
              type='button'
              onClick={() => imageRef.current.click()}
              className='max-w-full rounded-lg bg-[#0095F6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1877F2]'
            >
              Select from computer
            </button>
          </div>
        ) : (
          <div className='flex h-[calc(100dvh-4rem)] max-h-[760px] min-h-0 flex-col overflow-hidden md:grid md:h-auto md:min-h-[520px] md:grid-cols-[minmax(0,1fr)_340px] lg:min-h-[560px]'>
            <div className='flex min-h-0 flex-1 items-center justify-center bg-black md:flex-none'>
              {mode === "reel" ? (
                <video src={mediaPreview} controls muted className='max-h-full w-full object-contain' />
              ) : (
                <img src={mediaPreview} alt="preview_img" className='max-h-full w-full object-contain' />
              )}
            </div>

            <aside className='flex max-h-[45%] min-h-[240px] flex-col overflow-y-auto border-t border-gray-200 bg-white md:max-h-none md:min-h-0 md:overflow-hidden md:border-l md:border-t-0'>
              <div className='flex min-w-0 shrink-0 items-center gap-3 px-4 py-3 sm:py-4'>
                <Avatar className='h-8 w-8 shrink-0'>
                  <AvatarImage src={user?.profilePicture} alt="img" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className='min-w-0'>
                  <h1 className='truncate text-sm font-semibold'>{user?.username}</h1>
                </div>
              </div>

              <div className='shrink-0 border-b border-gray-100 px-4'>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={2200}
                  className="min-h-24 resize-none border-none px-0 text-sm focus-visible:ring-transparent focus-visible:ring-offset-0 sm:min-h-36 sm:text-base"
                  placeholder="Write a caption..."
                />
                <div className='mb-3 flex items-center justify-between text-gray-400'>
                  <Smile className='h-5 w-5' />
                  <span className='text-xs'>{caption.length}/2,200</span>
                </div>
              </div>

              <button type='button' className='flex h-11 shrink-0 items-center justify-between border-b border-gray-100 px-4 text-left text-sm text-gray-500 sm:h-12'>
                <span>Add location</span>
                <MapPin className='h-5 w-5' />
              </button>

              <button type='button' onClick={() => imageRef.current.click()} className='flex h-11 shrink-0 items-center px-4 text-sm font-semibold text-[#0095F6] hover:bg-gray-50 sm:h-12'>
                Change {mode === "reel" ? "video" : "image"}
              </button>
              <input ref={imageRef} type='file' accept={mode === "reel" ? 'video/*' : 'image/*'} className='hidden' onChange={fileChangeHandler} />

              {loading && (
                <div className='mt-auto flex items-center justify-center gap-2 border-t border-gray-100 px-4 py-4 text-sm font-semibold text-gray-600'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Sharing
                </div>
              )}
            </aside>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CreatePost

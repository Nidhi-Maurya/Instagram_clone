import React, { useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { readFileAsDataURL } from '@/lib/utils';
import { ImagePlus, Loader2, MapPin, Smile, X } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '@/redux/postSlice';
import { apiUrl } from '@/lib/api';

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const {user} = useSelector(store=>store.auth);
  const {posts} = useSelector(store=>store.post);
  const dispatch = useDispatch();

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const dataUrl = await readFileAsDataURL(file);
      setImagePreview(dataUrl);
    }
  }

  const resetPostState = () => {
    setFile("");
    setCaption("");
    setImagePreview("");
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
    if (imagePreview) formData.append("image", file);
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

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && closeDialog()}>
      <DialogContent onInteractOutside={(e) => {
        e.preventDefault();
        closeDialog();
      }} className='w-[calc(100vw-1rem)] max-w-[920px] gap-0 overflow-hidden rounded-xl border-0 p-0 shadow-2xl sm:rounded-xl'>
        <DialogHeader className='relative flex h-11 shrink-0 items-center justify-center border-b border-gray-200 px-12 text-center'>
          <button
            type='button'
            onClick={closeDialog}
            className='absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full hover:bg-gray-100'
            aria-label='Close create post'
          >
            <X className='h-5 w-5' />
          </button>
          <h2 className='text-base font-semibold'>{imagePreview ? "Create new post" : "Create new post"}</h2>
          {imagePreview && (
            <button
              type='button'
              disabled={loading}
              onClick={createPostHandler}
              className='absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#0095F6] disabled:text-gray-300'
            >
              {loading ? "Sharing..." : "Share"}
            </button>
          )}
        </DialogHeader>

        {!imagePreview ? (
          <div className='flex min-h-[480px] flex-col items-center justify-center px-6 text-center'>
            <div className='mb-4 flex h-24 w-24 items-center justify-center rounded-full border-2 border-black'>
              <ImagePlus className='h-12 w-12' />
            </div>
            <p className='mb-6 text-xl font-light'>Drag photos and videos here</p>
            <input ref={imageRef} type='file' accept='image/*' className='hidden' onChange={fileChangeHandler} />
            <button
              type='button'
              onClick={() => imageRef.current.click()}
              className='rounded-lg bg-[#0095F6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1877F2]'
            >
              Select from computer
            </button>
          </div>
        ) : (
          <div className='grid max-h-[calc(100dvh-5rem)] min-h-[520px] grid-cols-1 overflow-hidden md:grid-cols-[minmax(0,1fr)_340px]'>
            <div className='flex min-h-0 items-center justify-center bg-black'>
              <img src={imagePreview} alt="preview_img" className='max-h-full w-full object-contain' />
            </div>

            <aside className='flex min-h-0 flex-col border-t border-gray-200 bg-white md:border-l md:border-t-0'>
              <div className='flex min-w-0 items-center gap-3 px-4 py-4'>
                <Avatar className='h-8 w-8 shrink-0'>
                  <AvatarImage src={user?.profilePicture} alt="img" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className='min-w-0'>
                  <h1 className='truncate text-sm font-semibold'>{user?.username}</h1>
                </div>
              </div>

              <div className='border-b border-gray-100 px-4'>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={2200}
                  className="min-h-36 resize-none border-none px-0 text-base focus-visible:ring-transparent focus-visible:ring-offset-0"
                  placeholder="Write a caption..."
                />
                <div className='mb-3 flex items-center justify-between text-gray-400'>
                  <Smile className='h-5 w-5' />
                  <span className='text-xs'>{caption.length}/2,200</span>
                </div>
              </div>

              <button type='button' className='flex h-12 items-center justify-between border-b border-gray-100 px-4 text-left text-sm text-gray-500'>
                <span>Add location</span>
                <MapPin className='h-5 w-5' />
              </button>

              <button type='button' onClick={() => imageRef.current.click()} className='flex h-12 items-center px-4 text-sm font-semibold text-[#0095F6] hover:bg-gray-50'>
                Change image
              </button>
              <input ref={imageRef} type='file' accept='image/*' className='hidden' onChange={fileChangeHandler} />

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

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Heart, MessageCircle } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setSelectedPost } from '@/redux/postSlice'
import { apiUrl } from '@/lib/api'
import CommentDialog from './CommentDialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

const getTileClass = (index) => {
  const pattern = index % 18;
  if (pattern === 4 || pattern === 13) return 'row-span-2';
  if (pattern === 8) return 'col-span-2 row-span-2';
  return '';
}

const getInitial = (username = '') => username.trim().charAt(0).toUpperCase() || 'U';

const ExploreSkeleton = () => (
  <div className='grid auto-rows-[31vw] grid-flow-dense grid-cols-3 gap-0.5 sm:auto-rows-[190px] sm:gap-1 md:auto-rows-[250px] lg:auto-rows-[300px]'>
    {Array.from({ length: 15 }).map((_, index) => (
      <div
        key={index}
        className={`min-h-0 animate-pulse bg-gray-100 ${getTileClass(index)}`}
      />
    ))}
  </div>
);

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPost, setOpenPost] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchExplorePosts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(apiUrl('/api/v1/post/explore'), { withCredentials: true });
        if (res.data.success) {
          setPosts(res.data.posts || []);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchExplorePosts();
  }, []);

  const openPostHandler = (post) => {
    dispatch(setSelectedPost(post));
    setOpenPost(true);
  }

  if (loading) {
    return (
      <main className='mx-auto w-full max-w-[975px] px-0 pb-24 sm:px-4 sm:py-6 lg:pb-8'>
        <div className='flex h-12 items-center border-b border-gray-100 px-3 lg:hidden'>
          <h1 className='text-xl font-bold text-gray-950'>Explore</h1>
        </div>
        <ExploreSkeleton />
      </main>
    )
  }

  return (
    <main className='mx-auto w-full max-w-[975px] px-0 pb-24 sm:px-4 sm:py-6 lg:pb-8'>
      <div className='flex h-12 items-center border-b border-gray-100 px-3 lg:hidden'>
        <h1 className='text-xl font-bold text-gray-950'>Explore</h1>
      </div>
      {posts.length === 0 ? (
        <div className='flex min-h-[60dvh] flex-col items-center justify-center px-6 text-center'>
          <h1 className='text-xl font-semibold'>No posts to explore yet</h1>
          <p className='mt-2 max-w-sm text-sm text-gray-500'>Posts from other users will appear here when they upload content.</p>
        </div>
      ) : (
        <div className='grid auto-rows-[31vw] grid-flow-dense grid-cols-3 gap-0.5 sm:auto-rows-[190px] sm:gap-1 md:auto-rows-[250px] lg:auto-rows-[300px]'>
          {posts.map((post, index) => {
            const likesCount = Array.isArray(post?.likes) ? post.likes.length : 0;
            const commentsCount = Array.isArray(post?.comments) ? post.comments.length : 0;
            const tileClass = getTileClass(index);
            const author = post?.author;

            return (
              <button
                type='button'
                key={post?._id}
                onClick={() => openPostHandler(post)}
                className={`group relative min-h-0 min-w-0 overflow-hidden bg-gray-100 text-left outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 ${tileClass}`}
                aria-label='Open explore post'
              >
                <img
                  src={post?.image}
                  alt={post?.caption || 'Explore post'}
                  className='h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]'
                />
                <div className='absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/45 group-focus-visible:bg-black/45' />
                <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100'>
                  <div className='flex items-center gap-5 text-sm font-bold text-white sm:text-base'>
                    <span className='flex items-center gap-1.5'>
                      <Heart className='h-5 w-5 fill-white sm:h-6 sm:w-6' />
                      {likesCount}
                    </span>
                    <span className='flex items-center gap-1.5'>
                      <MessageCircle className='h-5 w-5 fill-white sm:h-6 sm:w-6' />
                      {commentsCount}
                    </span>
                  </div>
                </div>
                <div className='absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/60 via-black/15 to-transparent p-2 opacity-100 sm:p-3 md:opacity-0 md:transition-opacity md:group-hover:opacity-100'>
                  <div className='flex min-w-0 items-center gap-2'>
                    <Avatar className='h-6 w-6 border border-white/70 sm:h-7 sm:w-7'>
                      <AvatarImage src={author?.profilePicture} />
                      <AvatarFallback className='bg-gray-200 text-[10px] font-semibold text-gray-700'>
                        {getInitial(author?.username)}
                      </AvatarFallback>
                    </Avatar>
                    <span className='min-w-0 truncate text-xs font-semibold text-white sm:text-sm'>
                      {author?.username || 'instagram_user'}
                    </span>
                  </div>
                  <span className='hidden shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur sm:inline'>
                    {likesCount + commentsCount}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
      <CommentDialog open={openPost} setOpen={setOpenPost} />
    </main>
  )
}

export default Explore

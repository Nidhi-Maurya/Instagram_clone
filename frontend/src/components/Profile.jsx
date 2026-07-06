import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import useGetUserProfile from '@/hooks/useGetUserProfile';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from './ui/button';
import { Bookmark, Film, Grid3X3, Heart, MessageCircle, Tags } from 'lucide-react';
import { getUserId } from '@/lib/api';
import CommentDialog from './CommentDialog';
import { setSelectedPost } from '@/redux/postSlice';

const Profile = () => {
  const params = useParams();
  const navigate = useNavigate();
  const userId = params.id;
  useGetUserProfile(userId);
  const [activeTab, setActiveTab] = useState('posts');
  const [openPost, setOpenPost] = useState(false);
  const hasValidUserId = userId && userId !== "undefined" && userId !== "null";

  const { userProfile, user } = useSelector(store => store.auth);
  const dispatch = useDispatch();

  const currentUserId = getUserId(user);
  const profileUserId = getUserId(userProfile);
  const isLoggedInUserProfile = currentUserId === profileUserId;
  const isFollowing = false;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  }

  const openPostHandler = (post) => {
    dispatch(setSelectedPost(post));
    setOpenPost(true);
  }

  const posts = Array.isArray(userProfile?.posts) ? userProfile.posts : [];
  const bookmarks = Array.isArray(userProfile?.bookmarks) ? userProfile.bookmarks : [];
  const followers = Array.isArray(userProfile?.followers) ? userProfile.followers : [];
  const following = Array.isArray(userProfile?.following) ? userProfile.following : [];
  const displayedPost = activeTab === 'posts' ? posts : bookmarks;

  useEffect(() => {
    if (!hasValidUserId) {
      navigate("/");
    }
  }, [hasValidUserId, navigate]);

  if (!hasValidUserId) {
    return null;
  }

  return (
    <div className='mx-auto flex w-full max-w-[935px] justify-center'>
      <div className='flex w-full flex-col pb-6 md:py-8'>
        <section className='px-4 py-4 md:px-0 md:pb-10 md:pt-0'>
          <h1 className='mb-4 truncate text-xl font-semibold sm:hidden'>{userProfile?.username}</h1>

          <div className='flex min-w-0 items-center gap-6 md:grid md:grid-cols-[290px_minmax(0,1fr)] md:items-start md:gap-0'>
            <Avatar className='h-20 w-20 shrink-0 md:mx-auto md:h-[150px] md:w-[150px]'>
              <AvatarImage src={userProfile?.profilePicture} alt="profilephoto" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>

            <div className='grid min-w-0 flex-1 grid-cols-3 text-center sm:hidden'>
              <div className='flex flex-col'>
                <span className='font-semibold'>{posts.length}</span>
                <span className='text-sm text-gray-500'>posts</span>
              </div>
              <div className='flex flex-col'>
                <span className='font-semibold'>{followers.length}</span>
                <span className='text-sm text-gray-500'>followers</span>
              </div>
              <div className='flex flex-col'>
                <span className='font-semibold'>{following.length}</span>
                <span className='text-sm text-gray-500'>following</span>
              </div>
            </div>

            <div className='hidden min-w-0 flex-1 md:block'>
              <div className='flex min-w-0 flex-wrap items-center gap-2'>
                <span className='mr-3 min-w-0 truncate text-xl font-normal leading-8'>{userProfile?.username}</span>
                {isLoggedInUserProfile ? (
                  <>
                    <Link to="/account/edit"><Button variant='secondary' className='h-8 px-4 text-sm font-semibold hover:bg-gray-200'>Edit profile</Button></Link>
                    <Button variant='secondary' className='h-8 px-4 text-sm font-semibold hover:bg-gray-200'>View archive</Button>
                    <Button variant='secondary' className='h-8 px-4 text-sm font-semibold hover:bg-gray-200'>Ad tools</Button>
                  </>
                ) : (
                  isFollowing ? (
                    <>
                      <Button variant='secondary' className='h-8 px-4 text-sm font-semibold'>Unfollow</Button>
                      <Button variant='secondary' className='h-8 px-4 text-sm font-semibold'>Message</Button>
                    </>
                  ) : (
                    <Button className='h-8 bg-[#0095F6] px-4 text-sm font-semibold hover:bg-[#3192d2]'>Follow</Button>
                  )
                )}
              </div>

              <div className='mt-6 flex flex-wrap items-center gap-x-10 gap-y-2 text-base'>
                <p><span className='font-semibold'>{posts.length} </span>posts</p>
                <p><span className='font-semibold'>{followers.length} </span>followers</p>
                <p><span className='font-semibold'>{following.length} </span>following</p>
              </div>

              <div className='mt-5 min-w-0 text-base'>
                <p className='truncate font-semibold'>{userProfile?.username}</p>
                {userProfile?.bio?.trim() && (
                  <p className='whitespace-pre-wrap break-words'>{userProfile.bio}</p>
                )}
              </div>
            </div>
          </div>

          <div className='mt-4 min-w-0 text-sm md:hidden'>
            <p className='truncate font-semibold'>{userProfile?.username}</p>
            {userProfile?.bio?.trim() && (
              <p className='whitespace-pre-wrap break-words'>{userProfile.bio}</p>
            )}
          </div>

          <div className='mt-4 grid grid-cols-2 gap-2 sm:hidden'>
            {isLoggedInUserProfile ? (
              <>
                <Link to="/account/edit" className='min-w-0'><Button variant='secondary' className='h-8 w-full px-3 hover:bg-gray-200'>Edit profile</Button></Link>
                <Button variant='secondary' className='h-8 w-full px-3 hover:bg-gray-200'>Share profile</Button>
              </>
            ) : (
              isFollowing ? (
                <>
                  <Button variant='secondary' className='h-8 w-full'>Unfollow</Button>
                  <Button variant='secondary' className='h-8 w-full'>Message</Button>
                </>
              ) : (
                <>
                  <Button className='h-8 w-full bg-[#0095F6] hover:bg-[#3192d2]'>Follow</Button>
                  <Button variant='secondary' className='h-8 w-full'>Message</Button>
                </>
              )
            )}
          </div>
        </section>

        <div className='mt-2 border-t border-t-gray-200 md:mt-0'>
          <div className='grid grid-cols-4 text-center text-xs md:flex md:h-[53px] md:items-start md:justify-center md:gap-[60px] md:text-xs md:font-semibold md:tracking-wider'>
            <button type='button' className={`flex h-12 items-center justify-center py-3 ${activeTab === 'posts' ? 'border-t border-black text-black' : 'text-gray-500'}`} onClick={() => handleTabChange('posts')} aria-label='Posts'>
              <Grid3X3 className='h-5 w-5 md:mr-1.5 md:h-3 md:w-3' />
              <span className='hidden md:inline'>POSTS</span>
            </button>
            <button type='button' className={`flex h-12 items-center justify-center py-3 ${activeTab === 'saved' ? 'border-t border-black text-black' : 'text-gray-500'}`} onClick={() => handleTabChange('saved')} aria-label='Saved'>
              <Bookmark className='h-5 w-5 md:mr-1.5 md:h-3 md:w-3' />
              <span className='hidden md:inline'>SAVED</span>
            </button>
            <button type='button' className='flex h-12 items-center justify-center py-3 text-gray-500' aria-label='Reels'>
              <Film className='h-5 w-5 md:mr-1.5 md:h-3 md:w-3' />
              <span className='hidden md:inline'>REELS</span>
            </button>
            <button type='button' className='flex h-12 items-center justify-center py-3 text-gray-500' aria-label='Tagged'>
              <Tags className='h-5 w-5 md:mr-1.5 md:h-3 md:w-3' />
              <span className='hidden md:inline'>TAGS</span>
            </button>
          </div>
          <div className='grid grid-cols-3 gap-px md:gap-7'>
            {
              displayedPost.map((post) => {
                const likeCount = Array.isArray(post?.likes) ? post.likes.length : 0;
                const commentCount = Array.isArray(post?.comments) ? post.comments.length : 0;

                return (
                  <button
                    type='button'
                    key={post?._id}
                    onClick={() => openPostHandler(post)}
                    className='group relative block cursor-pointer overflow-hidden text-left'
                    aria-label='Open post'
                  >
                    <img src={post?.image} alt='postimage' className='aspect-square w-full object-cover' />
                    <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                      <div className='flex items-center space-x-3 text-white sm:space-x-4'>
                        <span className='flex items-center gap-1 sm:gap-2'>
                          <Heart className='h-4 w-4 sm:h-6 sm:w-6' />
                          <span>{likeCount}</span>
                        </span>
                        <span className='flex items-center gap-1 sm:gap-2'>
                          <MessageCircle className='h-4 w-4 sm:h-6 sm:w-6' />
                          <span>{commentCount}</span>
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })
            }
          </div>
        </div>
      </div>
      <CommentDialog open={openPost} setOpen={setOpenPost} />
    </div>
  )
}

export default Profile

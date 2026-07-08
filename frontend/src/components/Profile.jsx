import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import useGetUserProfile from '@/hooks/useGetUserProfile';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from './ui/button';
import { Bookmark, Film, Grid3X3, Heart, MessageCircle, Tags, X } from 'lucide-react';
import { apiUrl, getUserId } from '@/lib/api';
import CommentDialog from './CommentDialog';
import { setSelectedPost } from '@/redux/postSlice';
import axios from 'axios';
import { toast } from 'sonner';
import { setAuthUser, setUserProfile } from '@/redux/authSlice';
import { Dialog, DialogContent } from './ui/dialog';

const getInitial = (username = '') => username.trim().charAt(0).toUpperCase() || 'U';

const Profile = () => {
  const params = useParams();
  const navigate = useNavigate();
  const userId = params.id;
  useGetUserProfile(userId);
  const [activeTab, setActiveTab] = useState('posts');
  const [openPost, setOpenPost] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [connectionsOpen, setConnectionsOpen] = useState(false);
  const [connectionsType, setConnectionsType] = useState('followers');
  const hasValidUserId = userId && userId !== "undefined" && userId !== "null";

  const { userProfile, user } = useSelector(store => store.auth);
  const dispatch = useDispatch();

  const currentUserId = getUserId(user);
  const profileUserId = getUserId(userProfile);
  const isLoggedInUserProfile = currentUserId === profileUserId;
  const isFollowing = (Array.isArray(user?.following) ? user.following : []).some((id) => String(id) === String(profileUserId))
    || (Array.isArray(userProfile?.followers) ? userProfile.followers : []).some((id) => String(id) === String(currentUserId));
  const isRequested = (Array.isArray(user?.followRequestsSent) ? user.followRequestsSent : []).some((id) => String(id) === String(profileUserId));

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  }

  const openPostHandler = (post) => {
    dispatch(setSelectedPost(post));
    setOpenPost(true);
  }

  const openConnections = (type) => {
    setConnectionsType(type);
    setConnectionsOpen(true);
  }

  const followOrUnfollowHandler = async () => {
    if (!profileUserId || isLoggedInUserProfile || followLoading) return;

    try {
      setFollowLoading(true);
      const res = await axios.post(apiUrl(`/api/v1/user/followunfollow/${profileUserId}`), {}, { withCredentials: true });
      if (res.data.success) {
        const following = Boolean(res.data.following);
        const requested = Boolean(res.data.requested);
        const currentFollowing = Array.isArray(user?.following) ? user.following.map(String) : [];
        const currentRequestsSent = Array.isArray(user?.followRequestsSent) ? user.followRequestsSent.map(String) : [];
        const currentFollowers = Array.isArray(userProfile?.followers) ? userProfile.followers.map(String) : [];

        dispatch(setAuthUser({
          ...user,
          following: following
            ? [...new Set([...currentFollowing, String(profileUserId)])]
            : currentFollowing.filter((id) => id !== String(profileUserId)),
          followRequestsSent: requested
            ? [...new Set([...currentRequestsSent, String(profileUserId)])]
            : currentRequestsSent.filter((id) => id !== String(profileUserId)),
        }));
        dispatch(setUserProfile({
          ...userProfile,
          followers: following
            ? [...new Set([...currentFollowers, String(currentUserId)])]
            : currentFollowers.filter((id) => id !== String(currentUserId)),
        }));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setFollowLoading(false);
    }
  }

  const posts = Array.isArray(userProfile?.posts) ? userProfile.posts : [];
  const bookmarks = Array.isArray(userProfile?.bookmarks) ? userProfile.bookmarks : [];
  const followers = Array.isArray(userProfile?.followers) ? userProfile.followers : [];
  const following = Array.isArray(userProfile?.following) ? userProfile.following : [];
  const connectionUsers = connectionsType === 'followers' ? followers : following;
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
              <button type='button' onClick={() => openConnections('followers')} className='flex flex-col'>
                <span className='font-semibold'>{followers.length}</span>
                <span className='text-sm text-gray-500'>followers</span>
              </button>
              <button type='button' onClick={() => openConnections('following')} className='flex flex-col'>
                <span className='font-semibold'>{following.length}</span>
                <span className='text-sm text-gray-500'>following</span>
              </button>
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
                      <Button onClick={followOrUnfollowHandler} disabled={followLoading} variant='secondary' className='h-8 px-4 text-sm font-semibold'>Following</Button>
                      <Button variant='secondary' className='h-8 px-4 text-sm font-semibold'>Message</Button>
                    </>
                  ) : isRequested ? (
                    <Button onClick={followOrUnfollowHandler} disabled={followLoading} variant='secondary' className='h-8 px-4 text-sm font-semibold'>Requested</Button>
                  ) : (
                    <Button onClick={followOrUnfollowHandler} disabled={followLoading} className='h-8 bg-[#0095F6] px-4 text-sm font-semibold hover:bg-[#3192d2]'>Follow</Button>
                  )
                )}
              </div>

              <div className='mt-6 flex flex-wrap items-center gap-x-10 gap-y-2 text-base'>
                <p><span className='font-semibold'>{posts.length} </span>posts</p>
                <button type='button' onClick={() => openConnections('followers')} className='hover:text-gray-500'><span className='font-semibold'>{followers.length} </span>followers</button>
                <button type='button' onClick={() => openConnections('following')} className='hover:text-gray-500'><span className='font-semibold'>{following.length} </span>following</button>
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
                  <Button onClick={followOrUnfollowHandler} disabled={followLoading} variant='secondary' className='h-8 w-full'>Following</Button>
                  <Button variant='secondary' className='h-8 w-full'>Message</Button>
                </>
              ) : isRequested ? (
                <>
                  <Button onClick={followOrUnfollowHandler} disabled={followLoading} variant='secondary' className='h-8 w-full'>Requested</Button>
                  <Button variant='secondary' className='h-8 w-full'>Message</Button>
                </>
              ) : (
                <>
                  <Button onClick={followOrUnfollowHandler} disabled={followLoading} className='h-8 w-full bg-[#0095F6] hover:bg-[#3192d2]'>Follow</Button>
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
      <Dialog open={connectionsOpen} onOpenChange={setConnectionsOpen}>
        <DialogContent className='w-[calc(100vw-2rem)] max-w-md gap-0 overflow-hidden rounded-xl border-0 p-0 shadow-2xl'>
          <div className='relative flex h-12 items-center justify-center border-b border-gray-200 px-12'>
            <h2 className='text-base font-bold capitalize'>{connectionsType}</h2>
            <button
              type='button'
              onClick={() => setConnectionsOpen(false)}
              className='absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full hover:bg-gray-100'
              aria-label='Close'
            >
              <X className='h-5 w-5' />
            </button>
          </div>
          <div className='max-h-[65dvh] min-h-56 overflow-y-auto py-2'>
            {connectionUsers.length > 0 ? (
              connectionUsers.map((connectionUser) => {
                const connectionUserId = getUserId(connectionUser);
                const username = connectionUser?.username || 'instagram_user';
                return (
                  <button
                    type='button'
                    key={connectionUserId || username}
                    onClick={() => {
                      if (connectionUserId) {
                        setConnectionsOpen(false);
                        navigate(`/profile/${connectionUserId}`);
                      }
                    }}
                    className='flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50'
                  >
                    <Avatar className='h-11 w-11 shrink-0'>
                      <AvatarImage src={connectionUser?.profilePicture} />
                      <AvatarFallback className='bg-gray-100 text-sm font-semibold text-gray-700'>{getInitial(username)}</AvatarFallback>
                    </Avatar>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-semibold'>{username}</p>
                      {connectionUser?.bio?.trim() && (
                        <p className='truncate text-sm text-gray-500'>{connectionUser.bio}</p>
                      )}
                    </div>
                  </button>
                )
              })
            ) : (
              <div className='flex h-56 flex-col items-center justify-center px-6 text-center'>
                <p className='text-sm font-semibold'>No {connectionsType} yet</p>
                <p className='mt-1 text-xs text-gray-500'>{connectionsType === 'followers' ? 'Followers will appear here.' : 'Following users will appear here.'}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Profile

import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { apiUrl, getUserId } from '@/lib/api';
import axios from 'axios';
import { setAuthUser, setSuggestedUsers } from '@/redux/authSlice';
import { toast } from 'sonner';

const SuggestedUsers = () => {
    const { suggestedUsers, user: authUser } = useSelector(store => store.auth);
    const [followLoadingId, setFollowLoadingId] = useState("");
    const dispatch = useDispatch();
    const authUserId = getUserId(authUser);

    const isFollowingProfile = (profile) => {
        const profileId = getUserId(profile);
        const following = Array.isArray(authUser?.following) ? authUser.following : [];
        const followers = Array.isArray(profile?.followers) ? profile.followers : [];
        return following.some((id) => String(id) === String(profileId))
            || followers.some((id) => String(id) === String(authUserId));
    }

    const isRequestedProfile = (profile) => {
        const profileId = getUserId(profile);
        const requestsSent = Array.isArray(authUser?.followRequestsSent) ? authUser.followRequestsSent : [];
        return requestsSent.some((id) => String(id) === String(profileId));
    }

    const updateSuggestedProfileFollowState = (profileId, following) => {
        dispatch(setSuggestedUsers(suggestedUsers.map((profile) => {
            if (getUserId(profile) !== profileId) return profile;
            const followers = Array.isArray(profile.followers) ? profile.followers.map(String) : [];
            return {
                ...profile,
                followers: following
                    ? [...new Set([...followers, String(authUserId)])]
                    : followers.filter((id) => id !== String(authUserId)),
            };
        })));
    }

    const followRequestHandler = async (profile) => {
        const profileId = getUserId(profile);
        if (!profileId || profileId === authUserId || followLoadingId) return;

        try {
            setFollowLoadingId(profileId);
            const res = await axios.post(apiUrl(`/api/v1/user/followunfollow/${profileId}`), {}, { withCredentials: true });
            if (res.data.success) {
                const following = Boolean(res.data.following);
                const requested = Boolean(res.data.requested);
                const currentFollowing = Array.isArray(authUser?.following) ? authUser.following.map(String) : [];
                const currentRequestsSent = Array.isArray(authUser?.followRequestsSent) ? authUser.followRequestsSent.map(String) : [];

                dispatch(setAuthUser({
                    ...authUser,
                    following: following
                        ? [...new Set([...currentFollowing, String(profileId)])]
                        : currentFollowing.filter((id) => id !== String(profileId)),
                    followRequestsSent: requested
                        ? [...new Set([...currentRequestsSent, String(profileId)])]
                        : currentRequestsSent.filter((id) => id !== String(profileId)),
                }));
                updateSuggestedProfileFollowState(profileId, following);
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Action failed");
        } finally {
            setFollowLoadingId("");
        }
    }

    return (
        <div className='my-10'>
            <div className='flex items-center justify-between text-sm'>
                <h1 className='font-semibold text-gray-600'>Suggested for you</h1>
                <span className='font-medium cursor-pointer'>See All</span>
            </div>
            {
                suggestedUsers.map((user) => {
                    const userId = getUserId(user);
                    const isFollowing = isFollowingProfile(user);
                    const isRequested = isRequestedProfile(user);
                    return (
                        <div key={user._id} className='my-5 flex min-w-0 items-center justify-between gap-3'>
                            <div className='flex min-w-0 items-center gap-2'>
                                <Link to={userId ? `/profile/${userId}` : '#'}>
                                    <Avatar>
                                        <AvatarImage src={user?.profilePicture} alt={user?.username || "profile"} />
                                        <AvatarFallback />
                                    </Avatar>
                                </Link>
                                <div className='min-w-0'>
                                    <h1 className='truncate text-sm font-semibold'><Link to={userId ? `/profile/${userId}` : '#'}>{user?.username}</Link></h1>
                                    {user?.bio?.trim() && (
                                        <span className='block truncate text-sm text-gray-600'>{user.bio}</span>
                                    )}
                                </div>
                            </div>
                            <button
                                type='button'
                                disabled={followLoadingId === userId}
                                onClick={() => followRequestHandler(user)}
                                className={`shrink-0 text-xs font-bold disabled:opacity-60 ${isFollowing || isRequested ? 'text-gray-700 hover:text-black' : 'text-[#3BADF8] hover:text-[#3495d6]'}`}
                            >
                                {followLoadingId === userId ? "..." : isFollowing ? "Following" : isRequested ? "Requested" : "Follow"}
                            </button>
                        </div>
                    )
                })
            }

        </div>
    )
}

export default SuggestedUsers

import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getUserId } from '@/lib/api';

const SuggestedUsers = () => {
    const { suggestedUsers } = useSelector(store => store.auth);
    return (
        <div className='my-10'>
            <div className='flex items-center justify-between text-sm'>
                <h1 className='font-semibold text-gray-600'>Suggested for you</h1>
                <span className='font-medium cursor-pointer'>See All</span>
            </div>
            {
                suggestedUsers.map((user) => {
                    const userId = getUserId(user);
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
                            <span className='shrink-0 cursor-pointer text-xs font-bold text-[#3BADF8] hover:text-[#3495d6]'>Follow</span>
                        </div>
                    )
                })
            }

        </div>
    )
}

export default SuggestedUsers

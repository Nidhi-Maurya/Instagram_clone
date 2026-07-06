import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import SuggestedUsers from './SuggestedUsers';
import { getUserId } from '@/lib/api';

const RightSidebar = () => {
  const { user } = useSelector(store => store.auth);
  const userId = getUserId(user);
  return (
    <aside className='my-10 hidden w-80 shrink-0 xl:block'>
      <div className='flex min-w-0 items-center gap-2'>
        <Link to={userId ? `/profile/${userId}` : '/login'}>
          <Avatar>
            <AvatarImage src={user?.profilePicture} alt="post_image" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Link>
        <div className='min-w-0'>
          <h1 className='truncate text-sm font-semibold'><Link to={userId ? `/profile/${userId}` : '/login'}>{user?.username}</Link></h1>
          {user?.bio?.trim() && (
            <span className='block truncate text-sm text-gray-600'>{user.bio}</span>
          )}
        </div>
      </div>
      <SuggestedUsers/>
    </aside>
  )
}

export default RightSidebar

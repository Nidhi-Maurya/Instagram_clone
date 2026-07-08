import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

const Comment = ({ comment }) => {
    const username = comment?.author?.username || comment?.username || 'instagram_user';
    const profilePicture = comment?.author?.profilePicture || comment?.profilePicture || "";
    const text = comment?.text || comment?.comment || "";

    return (
        <div className='py-2'>
            <div className='flex items-start gap-3'>
                <Avatar className='h-8 w-8 shrink-0'>
                    <AvatarImage src={profilePicture} />
                    <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <p className='min-w-0 break-words text-sm leading-5'>
                    <span className='font-semibold'>{username}</span>
                    <span className='pl-1'>{text || "Comment unavailable"}</span>
                </p>
            </div>
        </div>
    )
}

export default Comment

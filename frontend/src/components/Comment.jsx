import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

const Comment = ({ comment }) => {
    return (
        <div className='py-2'>
            <div className='flex items-start gap-3'>
                <Avatar className='h-8 w-8 shrink-0'>
                    <AvatarImage src={comment?.author?.profilePicture} />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <p className='min-w-0 break-words text-sm leading-5'>
                    <span className='font-semibold'>{comment?.author?.username}</span>
                    <span className='pl-1'>{comment?.text}</span>
                </p>
            </div>
        </div>
    )
}

export default Comment

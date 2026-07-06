import React, { useEffect, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useGetAllMessage from '@/hooks/useGetAllMessage'
import useGetRTM from '@/hooks/useGetRTM'
import { getUserId } from '@/lib/api'

const Messages = ({ selectedUser }) => {
    useGetRTM();
    useGetAllMessage();
    const {messages} = useSelector(store=>store.chat);
    const {user} = useSelector(store=>store.auth);
    const userId = getUserId(user);
    const selectedUserId = getUserId(selectedUser);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages, selectedUserId]);

    return (    
        <div className='min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-5'>
            <div className='flex justify-center pb-8 pt-2'>
                <div className='flex max-w-full flex-col items-center justify-center text-center'>
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <span className='mt-3 max-w-full truncate text-lg font-semibold'>{selectedUser?.username}</span>
                    <span className='max-w-full truncate text-sm text-gray-500'>Instagram</span>
                    <Link to={selectedUserId ? `/profile/${selectedUserId}` : '/chat'}><Button className="my-3 h-8 rounded-lg bg-gray-100 px-4 text-sm font-semibold text-black hover:bg-gray-200" variant="secondary">View profile</Button></Link>
                </div>
            </div>
            <div className='flex flex-col gap-2'>
                {
                   messages && messages.map((msg) => {
                        const isOwnMessage = msg.senderId === userId;
                        return (
                            <div key={msg._id} className={`flex w-full items-end gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                                {!isOwnMessage && (
                                    <Avatar className='h-7 w-7 shrink-0'>
                                        <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`max-w-[78%] break-words rounded-[22px] px-4 py-2 text-sm leading-5 sm:max-w-[55%] ${isOwnMessage ? 'bg-[#3797F0] text-white' : 'bg-gray-100 text-black'}`}>
                                    {msg.message}
                                </div>
                            </div>
                        )
                    })
                }
                <div ref={bottomRef} />

            </div>
        </div>  
    )
}

export default Messages

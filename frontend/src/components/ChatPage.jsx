import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { setSelectedUser } from '@/redux/authSlice';
import { ArrowLeft, Info, MessageCircleCode, Send } from 'lucide-react';
import Messages from './Messages';
import axios from 'axios';
import { setMessages } from '@/redux/chatSlice';
import { apiUrl, getUserId } from '@/lib/api';
import { useSearchParams } from 'react-router-dom';
import { clearMessageNotifications } from '@/redux/rtnSlice';

const ChatPage = () => {
    const [textMessage, setTextMessage] = useState("");
    const { user, suggestedUsers, selectedUser } = useSelector(store => store.auth);
    const { onlineUsers, messages } = useSelector(store => store.chat);
    const { messageNotification = [] } = useSelector(store => store.realTimeNotification || {});
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    const selectedUserId = getUserId(selectedUser);
    const targetUserId = searchParams.get("user");

    const sendMessageHandler = async (receiverId) => {
        if (!receiverId || !textMessage.trim()) return;
        try {
            const res = await axios.post(apiUrl(`/api/v1/message/send/${receiverId}`), { message: textMessage.trim() }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setMessages([...messages, res.data.newMessage]));
                setTextMessage("");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const messageKeyDownHandler = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessageHandler(selectedUserId);
        }
    }

    useEffect(() => {
        return () => {
            dispatch(setSelectedUser(null));
        }
    }, [dispatch]);

    useEffect(() => {
        if (!targetUserId) return;
        const notificationFromSender = messageNotification.find((notification) => notification.userId === targetUserId);
        const userFromNotification = suggestedUsers.find((user) => getUserId(user) === targetUserId)
            || (notificationFromSender?.userDetails
                ? { ...notificationFromSender.userDetails, _id: targetUserId }
                : null);
        if (userFromNotification) {
            dispatch(setSelectedUser(userFromNotification));
        }
    }, [targetUserId, suggestedUsers, messageNotification, dispatch]);

    useEffect(() => {
        if (selectedUserId) {
            dispatch(clearMessageNotifications({ userId: selectedUserId }));
        }
    }, [selectedUserId, dispatch]);

    const clearSelectedChat = () => {
        dispatch(setSelectedUser(null));
    }

    return (
        <div className='flex h-[calc(100dvh-4.5rem)] min-w-0 bg-white md:h-[calc(100dvh-5rem)] lg:h-dvh'>
            <section className={`${selectedUser ? 'hidden md:flex' : 'flex'} w-full min-w-0 shrink-0 flex-col border-r border-gray-200 md:w-80 xl:w-[390px]`}>
                <div className='flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-5'>
                    <h1 className='min-w-0 truncate text-xl font-bold'>{user?.username}</h1>
                </div>
                <div className='flex h-14 shrink-0 items-center px-5'>
                    <h2 className='text-base font-bold'>Messages</h2>
                </div>
                <div className='min-h-0 flex-1 overflow-y-auto'>
                    {
                        suggestedUsers.map((suggestedUser) => {
                            const suggestedUserId = getUserId(suggestedUser);
                            const isOnline = onlineUsers.includes(suggestedUserId);
                            const isSelected = selectedUserId === suggestedUserId;
                            return (
                                <button type='button' key={suggestedUserId} onClick={() => dispatch(setSelectedUser(suggestedUser))} className={`flex w-full min-w-0 items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50 ${isSelected ? 'bg-gray-100' : ''}`}>
                                    <div className='relative shrink-0'>
                                        <Avatar className='h-14 w-14'>
                                            <AvatarImage src={suggestedUser?.profilePicture} />
                                            <AvatarFallback>CN</AvatarFallback>
                                        </Avatar>
                                        {isOnline && <span className='absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500' />}
                                    </div>
                                    <div className='min-w-0 flex-1'>
                                        <p className='truncate text-sm font-semibold'>{suggestedUser?.username}</p>
                                        <p className='truncate text-sm text-gray-500'>{isOnline ? 'Active now' : 'Tap to chat'}</p>
                                    </div>
                                </button>
                            )
                        })
                    }
                </div>

            </section>
            {
                selectedUser ? (
                    <section className='flex min-w-0 flex-1 flex-col'>
                        <div className='flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-3 sm:px-5'>
                            <button type='button' onClick={clearSelectedChat} className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 md:hidden' aria-label='Back to messages'>
                                <ArrowLeft className='h-5 w-5' />
                            </button>
                            <Avatar className='h-10 w-10 shrink-0'>
                                <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <div className='min-w-0 flex-1'>
                                <p className='truncate text-sm font-semibold'>{selectedUser?.username}</p>
                                <p className='truncate text-xs text-gray-500'>{onlineUsers.includes(selectedUserId) ? 'Active now' : 'Instagram'}</p>
                            </div>
                            <button type='button' className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100' aria-label='Conversation info'>
                                <Info className='h-6 w-6' />
                            </button>
                        </div>
                        <Messages selectedUser={selectedUser} />
                        <div className='shrink-0 bg-white px-3 py-3 sm:px-5'>
                            <div className='flex min-h-11 items-center gap-2 rounded-full border border-gray-300 px-4 py-2'>
                                <input value={textMessage} onChange={(e) => setTextMessage(e.target.value)} onKeyDown={messageKeyDownHandler} type="text" className='min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-500' placeholder="Message..." />
                                <button
                                    type='button'
                                    disabled={!textMessage.trim()}
                                    onClick={() => sendMessageHandler(selectedUserId)}
                                    className='flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full text-[#0095F6] disabled:cursor-not-allowed disabled:text-gray-300'
                                    aria-label='Send message'
                                >
                                    <Send className='h-5 w-5' />
                                </button>
                            </div>
                        </div>
                    </section>
                ) : (
                    <div className='hidden min-w-0 flex-1 flex-col items-center justify-center px-6 text-center md:flex'>
                        <div className='mb-4 flex h-24 w-24 items-center justify-center rounded-full border-2 border-black'>
                            <MessageCircleCode className='h-12 w-12' />
                        </div>
                        <h1 className='text-xl font-normal'>Your messages</h1>
                        <span className='mt-2 text-sm text-gray-500'>Send private photos and messages to a friend or group.</span>
                    </div>
                )
            }
        </div>
    )
}

export default ChatPage

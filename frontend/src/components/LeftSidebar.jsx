import { Heart, Home, Instagram, LogOut, MessageCircle, PlusSquare, Search, TrendingUp } from 'lucide-react'
import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { toast } from 'sonner'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthUser } from '@/redux/authSlice'
import CreatePost from './CreatePost'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { apiUrl, getUserId } from '@/lib/api'
import { clearLikeNotifications } from '@/redux/rtnSlice'

const LeftSidebar = () => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const userId = getUserId(user);
    const { likeNotification = [], messageNotification = [] } = useSelector(store => store.realTimeNotification || {});
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);


    const logoutHandler = async () => {
        try {
            const res = await axios.get(apiUrl('/api/v1/user/logout'), { withCredentials: true });
            if (res.data.success) {
                dispatch(setAuthUser(null));
                dispatch(setSelectedPost(null));
                dispatch(setPosts([]));
                navigate("/login");
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    const sidebarHandler = (textType) => {
        if (textType === 'Logout') {
            logoutHandler();
        } else if (textType === "Create") {
            setOpen(true);
        } else if (textType === "Profile") {
            if (userId) navigate(`/profile/${userId}`);
            else navigate("/login");
        } else if (textType === "Home") {
            navigate("/");
        } else if (textType === 'Messages') {
            navigate("/chat");
        }
    }

    const openMessageNotification = (notification) => {
        if (!notification?.userId) return;
        navigate(`/chat?user=${notification.userId}`);
    }

    const renderNotificationItem = (item, index) => {
        const isNotification = item.text === "Notifications";
        const isMessages = item.text === "Messages";
        const content = (
            <div
                role='button'
                tabIndex={0}
                onClick={() => !isNotification && sidebarHandler(item.text)}
                onKeyDown={(e) => e.key === 'Enter' && !isNotification && sidebarHandler(item.text)}
                className='relative flex min-h-11 min-w-10 cursor-pointer items-center justify-center rounded-lg p-1 hover:bg-gray-100 sm:min-w-12 sm:p-2 lg:my-3 lg:w-full lg:justify-start lg:gap-3 lg:p-3'
            >
                {item.icon}
                <span className='sr-only lg:not-sr-only'>{item.text}</span>
                {isMessages && messageNotification.length > 0 && (
                    <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white lg:bottom-6 lg:left-6 lg:right-auto lg:top-auto">
                        {messageNotification.length}
                    </span>
                )}
                {isNotification && likeNotification.length > 0 && (
                    <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white lg:bottom-6 lg:left-6 lg:right-auto lg:top-auto">
                        {likeNotification.length}
                    </span>
                )}
            </div>
        );

        if (isMessages && messageNotification.length > 0) {
            return (
                <Popover key={index}>
                    <PopoverTrigger asChild>{content}</PopoverTrigger>
                    <PopoverContent align='start' side='right' className='w-[360px] max-w-[calc(100vw-1rem)] rounded-2xl border border-gray-200 p-0 shadow-xl'>
                        <div className='border-b border-gray-100 px-4 py-3'>
                            <h2 className='text-base font-bold'>Messages</h2>
                        </div>
                        <div className='max-h-[70dvh] overflow-y-auto py-2'>
                            {messageNotification.map((notification) => (
                                <button
                                    key={notification.userId}
                                    type='button'
                                    onClick={() => openMessageNotification(notification)}
                                    className='flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50'
                                >
                                    <Avatar className='h-11 w-11 shrink-0'>
                                        <AvatarImage src={notification.userDetails?.profilePicture} />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                    <div className='min-w-0 flex-1'>
                                        <p className='truncate text-sm font-semibold'>{notification.userDetails?.username}</p>
                                        <p className='truncate text-sm text-gray-500'>{notification.message}</p>
                                    </div>
                                    <span className='h-2 w-2 shrink-0 rounded-full bg-[#0095F6]' />
                                </button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            );
        }

        if (!isNotification) return <React.Fragment key={index}>{content}</React.Fragment>;

        if (likeNotification.length === 0) {
            return <React.Fragment key={index}>{content}</React.Fragment>;
        }

        return (
            <Popover key={index} open={notificationOpen} onOpenChange={setNotificationOpen}>
                <PopoverTrigger asChild>{content}</PopoverTrigger>
                <PopoverContent align='start' side='right' className='w-[360px] max-w-[calc(100vw-1rem)] rounded-2xl border border-gray-200 p-0 shadow-xl'>
                    <div className='border-b border-gray-100 px-4 py-3'>
                        <div className='flex items-center justify-between'>
                            <h2 className='text-base font-bold'>Notifications</h2>
                            {likeNotification.length > 0 && (
                                <button
                                    type='button'
                                    onClick={() => dispatch(clearLikeNotifications())}
                                    className='text-xs font-semibold text-[#0095F6] hover:text-[#1877f2]'
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                    <div className='max-h-[70dvh] overflow-y-auto py-2'>
                        {likeNotification.length === 0 ? (
                            <div className='flex flex-col items-center justify-center px-6 py-10 text-center'>
                                <Heart className='mb-3 h-10 w-10 text-gray-300' />
                                <p className='text-sm font-semibold'>No notifications yet</p>
                                <p className='mt-1 text-xs text-gray-500'>Likes on your posts will appear here.</p>
                            </div>
                        ) : (
                            likeNotification.map((notification) => (
                                <div key={`${notification.userId}-${notification.postId}`} className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50'>
                                    <Avatar className='h-11 w-11 shrink-0'>
                                        <AvatarImage src={notification.userDetails?.profilePicture} />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                    <div className='min-w-0 flex-1'>
                                        <p className='break-words text-sm leading-5'>
                                            <span className='font-semibold'>{notification.userDetails?.username}</span>
                                            <span> liked your post.</span>
                                        </p>
                                        <p className='mt-0.5 text-xs text-gray-500'>Just now</p>
                                    </div>
                                    {notification.postImage && (
                                        <img src={notification.postImage} alt='Liked post' className='h-11 w-11 shrink-0 rounded object-cover' />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        );
    }

    const sidebarItems = [
        { icon: <Home />, text: "Home" },
        { icon: <Search />, text: "Search" },
        { icon: <TrendingUp />, text: "Explore" },
        { icon: <MessageCircle />, text: "Messages" },
        { icon: <Heart />, text: "Notifications" },
        { icon: <PlusSquare />, text: "Create" },
        {
            icon: (
                <Avatar className='w-6 h-6'>
                    <AvatarImage src={user?.profilePicture} alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            ),
            text: "Profile"
        },
        { icon: <LogOut />, text: "Logout" },
    ]
    return (
        <aside className='fixed bottom-0 left-0 z-40 w-full border-t border-gray-200 bg-white px-2 lg:top-0 lg:h-dvh lg:w-64 lg:border-r lg:border-t-0 lg:px-4'>
            <div className='flex h-full flex-row items-center justify-around lg:flex-col lg:items-stretch lg:justify-start'>
                <h1 className='hidden my-8 items-center gap-2 pl-3 text-xl font-bold lg:flex'>
                    <Instagram className='h-7 w-7' />
                    <span>LOGO</span>
                </h1>
                <div className='flex w-full items-center justify-around lg:block'>
                    {sidebarItems.map(renderNotificationItem)}
                </div>
            </div>

            <CreatePost open={open} setOpen={setOpen} />

        </aside>
    )
}

export default LeftSidebar

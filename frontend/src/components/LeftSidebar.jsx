import { AlertTriangle, Film, Heart, Home, Loader2, LogOut, MessageCircle, PlusSquare, Search, TrendingUp, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { FaInstagram } from 'react-icons/fa'
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
import { Dialog, DialogContent } from './ui/dialog'

const LeftSidebar = () => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const userId = getUserId(user);
    const { likeNotification = [], messageNotification = [] } = useSelector(store => store.realTimeNotification || {});
    const followRequestsReceived = Array.isArray(user?.followRequestsReceived) ? user.followRequestsReceived : [];
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [mobileNotificationOpen, setMobileNotificationOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [followLoadingId, setFollowLoadingId] = useState("");
    const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [accountActionLoading, setAccountActionLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("instagram_recent_searches")) || [];
        } catch {
            return [];
        }
    });


    const logoutHandler = async () => {
        try {
            setAccountActionLoading(true);
            const res = await axios.get(apiUrl('/api/v1/user/logout'), { withCredentials: true });
            if (res.data.success) {
                dispatch(setAuthUser(null));
                dispatch(setSelectedPost(null));
                dispatch(setPosts([]));
                setLogoutConfirmOpen(false);
                navigate("/login");
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Logout failed");
        } finally {
            setAccountActionLoading(false);
        }
    }

    const deleteAccountHandler = async () => {
        if (deleteConfirmText !== "DELETE") return;

        try {
            setAccountActionLoading(true);
            const res = await axios.delete(apiUrl('/api/v1/user/delete-account'), { withCredentials: true });
            if (res.data.success) {
                dispatch(setAuthUser(null));
                dispatch(setSelectedPost(null));
                dispatch(setPosts([]));
                setDeleteConfirmOpen(false);
                setLogoutConfirmOpen(false);
                navigate("/signup");
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Account deletion failed");
        } finally {
            setAccountActionLoading(false);
        }
    }

    const sidebarHandler = (textType) => {
        if (textType === 'Logout') {
            setLogoutConfirmOpen(true);
        } else if (textType === "Create") {
            setOpen(true);
        } else if (textType === "Profile") {
            if (userId) navigate(`/profile/${userId}`);
            else navigate("/login");
        } else if (textType === "Home") {
            navigate("/");
        } else if (textType === "Search") {
            setSearchOpen(true);
        } else if (textType === "Explore") {
            navigate("/explore");
        } else if (textType === "Reels") {
            navigate("/reels");
        } else if (textType === 'Messages') {
            navigate("/chat");
        }
    }

    useEffect(() => {
        const query = searchQuery.trim();
        if (!searchOpen || !query) {
            setSearchResults([]);
            setSearchLoading(false);
            return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(async () => {
            try {
                setSearchLoading(true);
                const res = await axios.get(apiUrl(`/api/v1/user/search?q=${encodeURIComponent(query)}`), {
                    withCredentials: true,
                    signal: controller.signal,
                });
                if (res.data.success) {
                    setSearchResults(res.data.users || []);
                }
            } catch (error) {
                if (error.name !== "CanceledError") console.log(error);
            } finally {
                setSearchLoading(false);
            }
        }, 300);

        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [searchOpen, searchQuery]);

    const saveRecentSearch = (profile) => {
        const profileId = getUserId(profile);
        if (!profileId) return;
        const nextRecentSearches = [
            profile,
            ...recentSearches.filter((item) => getUserId(item) !== profileId),
        ].slice(0, 8);
        setRecentSearches(nextRecentSearches);
        localStorage.setItem("instagram_recent_searches", JSON.stringify(nextRecentSearches));
    }

    const openSearchProfile = (profile) => {
        const profileId = getUserId(profile);
        if (!profileId) return;
        saveRecentSearch(profile);
        setSearchOpen(false);
        setSearchQuery("");
        navigate(`/profile/${profileId}`);
    }

    const removeRecentSearch = (profileId) => {
        const nextRecentSearches = recentSearches.filter((item) => getUserId(item) !== profileId);
        setRecentSearches(nextRecentSearches);
        localStorage.setItem("instagram_recent_searches", JSON.stringify(nextRecentSearches));
    }

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem("instagram_recent_searches");
    }

    const isFollowingProfile = (profile) => {
        const profileId = getUserId(profile);
        const following = Array.isArray(user?.following) ? user.following : [];
        const followers = Array.isArray(profile?.followers) ? profile.followers : [];
        return following.some((id) => String(id) === String(profileId))
            || followers.some((id) => String(id) === String(userId));
    }

    const isRequestedProfile = (profile) => {
        const profileId = getUserId(profile);
        const requestsSent = Array.isArray(user?.followRequestsSent) ? user.followRequestsSent : [];
        return requestsSent.some((id) => String(id) === String(profileId));
    }

    const updateSearchProfileFollowState = (profileId, following) => {
        const updateProfile = (profile) => {
            if (getUserId(profile) !== profileId) return profile;
            const followers = Array.isArray(profile.followers) ? profile.followers.map(String) : [];
            return {
                ...profile,
                followers: following
                    ? [...new Set([...followers, String(userId)])]
                    : followers.filter((id) => id !== String(userId)),
            };
        };

        setSearchResults((profiles) => profiles.map(updateProfile));
        setRecentSearches((profiles) => {
            const nextProfiles = profiles.map(updateProfile);
            localStorage.setItem("instagram_recent_searches", JSON.stringify(nextProfiles));
            return nextProfiles;
        });
    }

    const followFromSearchHandler = async (e, profile) => {
        e.stopPropagation();
        const profileId = getUserId(profile);
        if (!profileId || profileId === userId || followLoadingId) return;

        try {
            setFollowLoadingId(profileId);
            const res = await axios.post(apiUrl(`/api/v1/user/followunfollow/${profileId}`), {}, { withCredentials: true });
            if (res.data.success) {
                const following = Boolean(res.data.following);
                const requested = Boolean(res.data.requested);
                const currentFollowing = Array.isArray(user?.following) ? user.following.map(String) : [];
                const currentRequestsSent = Array.isArray(user?.followRequestsSent) ? user.followRequestsSent.map(String) : [];
                dispatch(setAuthUser({
                    ...user,
                    following: following
                        ? [...new Set([...currentFollowing, String(profileId)])]
                        : currentFollowing.filter((id) => id !== String(profileId)),
                    followRequestsSent: requested
                        ? [...new Set([...currentRequestsSent, String(profileId)])]
                        : currentRequestsSent.filter((id) => id !== String(profileId)),
                }));
                updateSearchProfileFollowState(profileId, following);
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Action failed");
        } finally {
            setFollowLoadingId("");
        }
    }

    const respondFollowRequestHandler = async (requestUser, action) => {
        const requestUserId = getUserId(requestUser);
        if (!requestUserId) return;

        try {
            const res = await axios.post(apiUrl(`/api/v1/user/follow-request/${requestUserId}/${action}`), {}, { withCredentials: true });
            if (res.data.success) {
                const currentFollowers = Array.isArray(user?.followers) ? user.followers.map(String) : [];
                dispatch(setAuthUser({
                    ...user,
                    followers: res.data.accepted
                        ? [...new Set([...currentFollowers, String(requestUserId)])]
                        : currentFollowers,
                    followRequestsReceived: followRequestsReceived.filter((item) => getUserId(item) !== requestUserId),
                }));
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Request update failed");
        }
    }

    const openMessageNotification = (notification) => {
        if (!notification?.userId) return;
        navigate(`/chat?user=${notification.userId}`);
    }

    const notificationCount = likeNotification.length + followRequestsReceived.length;

    const renderNotificationsContent = () => (
        <>
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
                {notificationCount === 0 ? (
                    <div className='flex flex-col items-center justify-center px-6 py-10 text-center'>
                        <Heart className='mb-3 h-10 w-10 text-gray-300' />
                        <p className='text-sm font-semibold'>No notifications yet</p>
                        <p className='mt-1 text-xs text-gray-500'>Likes and requests will appear here.</p>
                    </div>
                ) : (
                    <>
                        {followRequestsReceived.map((requestUser) => {
                            const requestUserId = getUserId(requestUser);
                            return (
                                <div key={`request-${requestUserId}`} className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50'>
                                    <Avatar className='h-11 w-11 shrink-0'>
                                        <AvatarImage src={requestUser?.profilePicture} />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                    <div className='min-w-0 flex-1'>
                                        <p className='break-words text-sm leading-5'>
                                            <span className='font-semibold'>{requestUser?.username}</span>
                                            <span> requested to follow you.</span>
                                        </p>
                                    </div>
                                    <div className='flex shrink-0 items-center gap-2'>
                                        <button type='button' onClick={() => respondFollowRequestHandler(requestUser, "accept")} className='rounded-lg bg-[#0095F6] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1877F2]'>
                                            Confirm
                                        </button>
                                        <button type='button' onClick={() => respondFollowRequestHandler(requestUser, "reject")} className='rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-black hover:bg-gray-200'>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        {likeNotification.map((notification) => (
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
                        ))}
                    </>
                )}
            </div>
        </>
    )

    const renderNotificationItem = (item, index) => {
        const isNotification = item.text === "Notifications";
        const isMessages = item.text === "Messages";
        const content = (
            <div
                role='button'
                tabIndex={0}
                onClick={() => {
                    if (isNotification && window.innerWidth < 1024) setMobileNotificationOpen(true);
                    else if (!isNotification) sidebarHandler(item.text);
                }}
                onKeyDown={(e) => e.key === 'Enter' && !isNotification && sidebarHandler(item.text)}
                className={`relative min-h-11 min-w-10 cursor-pointer items-center justify-center rounded-lg p-1 hover:bg-gray-100 sm:min-w-12 sm:p-2 lg:my-3 lg:w-full lg:justify-start lg:gap-3 lg:p-3 ${item.mobileHidden ? 'hidden lg:flex' : 'flex'}`}
            >
                {item.icon}
                <span className='sr-only lg:not-sr-only'>{item.text}</span>
                {isMessages && messageNotification.length > 0 && (
                    <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white lg:bottom-6 lg:left-6 lg:right-auto lg:top-auto">
                        {messageNotification.length}
                    </span>
                )}
                {isNotification && notificationCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white lg:bottom-6 lg:left-6 lg:right-auto lg:top-auto">
                        {notificationCount}
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

        if (notificationCount === 0) {
            return <React.Fragment key={index}>{content}</React.Fragment>;
        }

        return (
            <Popover key={index} open={notificationOpen} onOpenChange={setNotificationOpen}>
                <PopoverTrigger asChild>{content}</PopoverTrigger>
                <PopoverContent align='start' side='right' className='w-[360px] max-w-[calc(100vw-1rem)] rounded-2xl border border-gray-200 p-0 shadow-xl'>
                    {renderNotificationsContent()}
                </PopoverContent>
            </Popover>
        );
    }

    const sidebarItems = [
        { icon: <Home />, text: "Home" },
        { icon: <Search />, text: "Search" },
        { icon: <TrendingUp />, text: "Explore" },
        { icon: <Film />, text: "Reels" },
        { icon: <MessageCircle />, text: "Messages", mobileHidden: true },
        { icon: <Heart />, text: "Notifications", mobileHidden: true },
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
        { icon: <LogOut />, text: "Logout", mobileHidden: true },
    ]

    const visibleSearchItems = searchQuery.trim() ? searchResults : recentSearches;

    return (
        <>
        <header className='fixed left-0 top-0 z-40 flex h-14 w-full items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden'>
            <button type='button' onClick={() => navigate("/")} className='flex min-w-0 items-center gap-2' aria-label='Instagram home'>
                <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white'>
                    <FaInstagram className='h-6 w-6' aria-hidden='true' />
                </span>
                <span
                    className='bg-gradient-to-r from-[#feda75] via-[#d62976] to-[#4f5bd5] bg-clip-text text-[25px] font-semibold leading-none tracking-normal text-transparent'
                    style={{ fontFamily: '"Segoe Script", "Brush Script MT", cursive' }}
                >
                    Instagram
                </span>
            </button>
            <div className='flex items-center gap-2'>
                <button
                    type='button'
                    onClick={() => notificationCount > 0 && setMobileNotificationOpen(true)}
                    className='relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100'
                    aria-label='Notifications'
                >
                    <Heart className='h-6 w-6' />
                    {notificationCount > 0 && (
                        <span className='absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white'>
                            {notificationCount}
                        </span>
                    )}
                </button>
                <button
                    type='button'
                    onClick={() => navigate("/chat")}
                    className='relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100'
                    aria-label='Messages'
                >
                    <MessageCircle className='h-6 w-6' />
                    {messageNotification.length > 0 && (
                        <span className='absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white'>
                            {messageNotification.length}
                        </span>
                    )}
                </button>
            </div>
        </header>

        <aside className='fixed bottom-0 left-0 z-40 w-full border-t border-gray-200 bg-white px-2 py-1 lg:top-0 lg:h-dvh lg:w-64 lg:border-r lg:border-t-0 lg:px-4 lg:py-0'>
            <div className='flex h-full flex-row items-center justify-around lg:flex-col lg:items-stretch lg:justify-start'>
                <h1 className='my-8 hidden items-center gap-3 pl-3 lg:flex'>
                    <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white'>
                        <FaInstagram className='h-6 w-6' aria-hidden='true' />
                    </span>
                    <span
                        className='bg-gradient-to-r from-[#feda75] via-[#d62976] to-[#4f5bd5] bg-clip-text text-[28px] font-semibold leading-none tracking-normal text-transparent'
                        style={{ fontFamily: '"Segoe Script", "Brush Script MT", cursive' }}
                    >
                        Instagram
                    </span>
                </h1>
                <div className='flex w-full items-center justify-around lg:block'>
                    {sidebarItems.map(renderNotificationItem)}
                </div>
            </div>

            <CreatePost open={open} setOpen={setOpen} />

            <Dialog open={mobileNotificationOpen} onOpenChange={setMobileNotificationOpen}>
                <DialogContent className='!bottom-0 !left-0 !top-auto !w-full !max-w-none !translate-x-0 !translate-y-0 gap-0 overflow-hidden rounded-t-2xl border-0 p-0 shadow-2xl lg:hidden'>
                    <div className='flex max-h-[82dvh] min-h-[45dvh] flex-col bg-white'>
                        {renderNotificationsContent()}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={logoutConfirmOpen} onOpenChange={(nextOpen) => !accountActionLoading && setLogoutConfirmOpen(nextOpen)}>
                <DialogContent className='w-[calc(100vw-2rem)] max-w-sm gap-0 overflow-hidden rounded-xl border-0 p-0 text-center shadow-2xl'>
                    <div className='px-6 py-6'>
                        <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100'>
                            <LogOut className='h-6 w-6' />
                        </div>
                        <h2 className='text-lg font-semibold'>Log out?</h2>
                        <p className='mt-2 text-sm text-gray-500'>Are you sure you want to log out of this account?</p>
                    </div>
                    <button
                        type='button'
                        disabled={accountActionLoading}
                        onClick={logoutHandler}
                        className='h-12 border-t border-gray-200 text-sm font-bold text-[#ED4956] disabled:opacity-60'
                    >
                        {accountActionLoading ? "Logging out..." : "Log out"}
                    </button>
                    <button
                        type='button'
                        disabled={accountActionLoading}
                        onClick={() => setDeleteConfirmOpen(true)}
                        className='h-12 border-t border-gray-200 text-sm font-bold text-[#ED4956] disabled:opacity-60'
                    >
                        Delete account permanently
                    </button>
                    <button
                        type='button'
                        disabled={accountActionLoading}
                        onClick={() => setLogoutConfirmOpen(false)}
                        className='h-12 border-t border-gray-200 text-sm disabled:opacity-60'
                    >
                        Cancel
                    </button>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteConfirmOpen} onOpenChange={(nextOpen) => {
                if (!accountActionLoading) {
                    setDeleteConfirmOpen(nextOpen);
                    if (!nextOpen) setDeleteConfirmText("");
                }
            }}>
                <DialogContent className='w-[calc(100vw-2rem)] max-w-md gap-0 overflow-hidden rounded-xl border-0 p-0 shadow-2xl'>
                    <div className='px-6 py-6'>
                        <div className='mb-4 flex items-center gap-3'>
                            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-[#ED4956]'>
                                <AlertTriangle className='h-6 w-6' />
                            </div>
                            <div>
                                <h2 className='text-lg font-semibold'>Delete account permanently?</h2>
                                <p className='text-sm text-gray-500'>This action cannot be undone.</p>
                            </div>
                        </div>
                        <p className='text-sm leading-6 text-gray-600'>
                            Your profile, posts, comments, likes, bookmarks, follow requests, followers and following links will be removed.
                        </p>
                        <label className='mt-5 block text-sm font-semibold text-gray-700'>
                            Type DELETE to confirm
                        </label>
                        <input
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            className='mt-2 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-gray-500'
                            placeholder='DELETE'
                        />
                    </div>
                    <button
                        type='button'
                        disabled={deleteConfirmText !== "DELETE" || accountActionLoading}
                        onClick={deleteAccountHandler}
                        className='h-12 border-t border-gray-200 text-sm font-bold text-[#ED4956] disabled:text-gray-300'
                    >
                        {accountActionLoading ? "Deleting..." : "Delete account"}
                    </button>
                    <button
                        type='button'
                        disabled={accountActionLoading}
                        onClick={() => {
                            setDeleteConfirmOpen(false);
                            setDeleteConfirmText("");
                        }}
                        className='h-12 border-t border-gray-200 text-sm disabled:opacity-60'
                    >
                        Cancel
                    </button>
                </DialogContent>
            </Dialog>

            {searchOpen && (
                <>
                    <button
                        type='button'
                        aria-label='Close search'
                        className='fixed inset-0 z-40 bg-black/20 lg:bg-transparent'
                        onClick={() => setSearchOpen(false)}
                    />
                    <div className='fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] min-h-[70dvh] flex-col rounded-t-2xl border border-gray-200 bg-white shadow-2xl lg:bottom-auto lg:left-64 lg:top-0 lg:h-dvh lg:w-[400px] lg:max-h-none lg:min-h-0 lg:rounded-none lg:border-y-0 lg:border-l-0'>
                        <div className='shrink-0 border-b border-gray-100 px-5 py-5'>
                            <div className='mb-5 flex items-center justify-between'>
                                <h2 className='text-2xl font-bold'>Search</h2>
                                <button
                                    type='button'
                                    onClick={() => setSearchOpen(false)}
                                    className='flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100'
                                    aria-label='Close search'
                                >
                                    <X className='h-5 w-5' />
                                </button>
                            </div>
                            <div className='flex h-10 items-center gap-3 rounded-lg bg-gray-100 px-4'>
                                <Search className='h-5 w-5 shrink-0 text-gray-500' />
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                    className='min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-500'
                                    placeholder='Search'
                                />
                                {searchQuery && (
                                    <button
                                        type='button'
                                        onClick={() => setSearchQuery("")}
                                        className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-400 text-white'
                                        aria-label='Clear search'
                                    >
                                        <X className='h-3.5 w-3.5' />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className='min-h-0 flex-1 overflow-y-auto'>
                            <div className='flex items-center justify-between px-5 py-4'>
                                <h3 className='text-base font-bold'>{searchQuery.trim() ? "Results" : "Recent"}</h3>
                                {!searchQuery.trim() && recentSearches.length > 0 && (
                                    <button type='button' onClick={clearRecentSearches} className='text-sm font-semibold text-[#0095F6]'>
                                        Clear all
                                    </button>
                                )}
                            </div>

                            {searchLoading ? (
                                <div className='flex items-center justify-center py-12'>
                                    <Loader2 className='h-6 w-6 animate-spin text-gray-500' />
                                </div>
                            ) : visibleSearchItems.length > 0 ? (
                                <div className='pb-4'>
                                    {visibleSearchItems.map((profile) => {
                                        const profileId = getUserId(profile);
                                        const isOwnProfile = profileId === userId;
                                        const isFollowing = isFollowingProfile(profile);
                                        const isRequested = isRequestedProfile(profile);
                                        return (
                                            <div key={profileId} className='flex items-center gap-3 px-5 py-3 hover:bg-gray-50'>
                                                <button
                                                    type='button'
                                                    onClick={() => openSearchProfile(profile)}
                                                    className='flex min-w-0 flex-1 items-center gap-3 text-left'
                                                >
                                                    <Avatar className='h-12 w-12 shrink-0'>
                                                        <AvatarImage src={profile?.profilePicture} />
                                                        <AvatarFallback>CN</AvatarFallback>
                                                    </Avatar>
                                                    <div className='min-w-0 flex-1'>
                                                        <p className='truncate text-sm font-semibold'>{profile?.username}</p>
                                                        <p className='truncate text-sm text-gray-500'>{profile?.bio || `${profile?.followers?.length || 0} followers`}</p>
                                                    </div>
                                                </button>
                                                {!isOwnProfile && searchQuery.trim() && (
                                                    <button
                                                        type='button'
                                                        disabled={followLoadingId === profileId}
                                                        onClick={(e) => followFromSearchHandler(e, profile)}
                                                        className={`h-8 shrink-0 rounded-lg px-4 text-sm font-semibold disabled:opacity-60 ${isFollowing || isRequested ? 'bg-gray-100 text-black hover:bg-gray-200' : 'bg-[#0095F6] text-white hover:bg-[#1877F2]'}`}
                                                    >
                                                        {followLoadingId === profileId ? "..." : isFollowing ? "Following" : isRequested ? "Requested" : "Follow"}
                                                    </button>
                                                )}
                                                {!searchQuery.trim() && (
                                                    <button
                                                        type='button'
                                                        onClick={() => removeRecentSearch(profileId)}
                                                        className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100'
                                                        aria-label='Remove recent search'
                                                    >
                                                        <X className='h-4 w-4' />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className='flex h-48 items-center justify-center px-6 text-center text-sm font-semibold text-gray-500'>
                                    {searchQuery.trim() ? "No results found." : "No recent searches."}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

        </aside>
        </>
    )
}

export default LeftSidebar

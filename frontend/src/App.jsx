import { useEffect, useRef } from 'react'
import ChatPage from './components/ChatPage'
import EditProfile from './components/EditProfile'
import Home from './components/Home'
import Explore from './components/Explore'
import Reels from './components/Reels'
import Login from './components/Login'
import MainLayout from './components/MainLayout'
import Profile from './components/Profile'
import Signup from './components/Signup'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { io } from "socket.io-client";
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { setSocket } from './redux/socketSlice'
import { setOnlineUsers } from './redux/chatSlice'
import { setLikeNotification, setMessageNotification } from './redux/rtnSlice'
import { setAuthUser, updateUserProfilePostLikes } from './redux/authSlice'
import ProtectedRoutes from './components/ProtectedRoutes'
import { API_BASE_URL, apiUrl, getUserId } from './lib/api'
import { isSessionExpired } from './lib/session'


const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoutes><MainLayout /></ProtectedRoutes>,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/profile/:id',
        element: <Profile />
      },
      {
        path: '/account/edit',
        element: <EditProfile />
      },
      {
        path: '/chat',
        element: <ChatPage />
      },
      {
        path: '/explore',
        element: <Explore />
      },
      {
        path: '/reels',
        element: <Reels />
      },
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  },
])

function App() {
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();
  const userId = getUserId(user);
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (!userId) return;
    if (isSessionExpired(user)) {
      dispatch(setAuthUser(null));
      return;
    }

    const syncCurrentUser = async () => {
      try {
        const res = await axios.get(apiUrl('/api/v1/user/me'), { withCredentials: true });
        if (res.data.success) {
          dispatch(setAuthUser(res.data.user));
        }
      } catch (error) {
        console.log(error);
        if (error.response?.status === 401) {
          dispatch(setAuthUser(null));
        }
      }
    };

    syncCurrentUser();
    window.addEventListener("focus", syncCurrentUser);
    return () => window.removeEventListener("focus", syncCurrentUser);
  }, [userId, dispatch]);

  useEffect(() => {
    if (!userId || isSessionExpired(userRef.current)) {
      dispatch(setSocket(null));
      return;
    }

    const socketio = io(API_BASE_URL || undefined, {
      query: {
        userId
      },
      transports: ['websocket']
    });
    dispatch(setSocket(socketio));

    // listen all the events
    socketio.on('getOnlineUsers', (onlineUsers) => {
      dispatch(setOnlineUsers(onlineUsers));
    });

    socketio.on('notification', (notification) => {
      dispatch(setLikeNotification(notification));
      dispatch(updateUserProfilePostLikes(notification));
    });

    socketio.on('messageNotification', (notification) => {
      dispatch(setMessageNotification(notification));
    });

    socketio.on('followRequestNotification', (notification) => {
      const currentUser = userRef.current;
      if (!currentUser) return;

      const currentRequests = Array.isArray(currentUser.followRequestsReceived) ? currentUser.followRequestsReceived : [];
      if (notification?.type === "request" && notification?.user) {
        const exists = currentRequests.some((item) => getUserId(item) === getUserId(notification.user));
        if (!exists) {
          const updatedUser = {
            ...currentUser,
            followRequestsReceived: [notification.user, ...currentRequests],
          };
          userRef.current = updatedUser;
          dispatch(setAuthUser(updatedUser));
        }
      } else if (notification?.type === "cancel" && notification?.userId) {
        const updatedUser = {
          ...currentUser,
          followRequestsReceived: currentRequests.filter((item) => getUserId(item) !== notification.userId),
        };
        userRef.current = updatedUser;
        dispatch(setAuthUser(updatedUser));
      }
    });

    return () => {
      socketio.close();
      dispatch(setSocket(null));
    }
  }, [userId, dispatch]);

  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  )
}

export default App

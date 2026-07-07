import { useEffect } from 'react'
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
  const { socket } = useSelector(store => store.socketio);
  const dispatch = useDispatch();
  const userId = getUserId(user);

  useEffect(() => {
    if (!userId) return;

    const syncCurrentUser = async () => {
      try {
        const res = await axios.get(apiUrl('/api/v1/user/me'), { withCredentials: true });
        if (res.data.success) {
          dispatch(setAuthUser(res.data.user));
        }
      } catch (error) {
        console.log(error);
      }
    };

    syncCurrentUser();
    window.addEventListener("focus", syncCurrentUser);
    return () => window.removeEventListener("focus", syncCurrentUser);
  }, [userId, dispatch]);

  useEffect(() => {
    if (userId) {
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
        const currentRequests = Array.isArray(user?.followRequestsReceived) ? user.followRequestsReceived : [];
        if (notification?.type === "request" && notification?.user) {
          const exists = currentRequests.some((item) => getUserId(item) === getUserId(notification.user));
          if (!exists) {
            dispatch(setAuthUser({
              ...user,
              followRequestsReceived: [notification.user, ...currentRequests],
            }));
          }
        } else if (notification?.type === "cancel" && notification?.userId) {
          dispatch(setAuthUser({
            ...user,
            followRequestsReceived: currentRequests.filter((item) => getUserId(item) !== notification.userId),
          }));
        }
      });

      return () => {
        socketio.close();
        dispatch(setSocket(null));
      }
    } else if (socket) {
      socket.close();
      dispatch(setSocket(null));
    }
  }, [user, dispatch]);

  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  )
}

export default App

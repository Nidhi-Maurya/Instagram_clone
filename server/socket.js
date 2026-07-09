import { Server } from "socket.io";

const userSocketMap = {};
let io;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8000",
  process.env.CLIENT_URL,
  process.env.RENDER_EXTERNAL_URL,
].filter(Boolean);

const corsOrigin = (origin, callback) => {
  const isDeploymentOrigin = origin?.endsWith(".onrender.com") || origin?.endsWith(".vercel.app");
  if (!origin || allowedOrigins.includes(origin) || isDeploymentOrigin) {
    callback(null, true);
    return;
  }
  callback(new Error("Not allowed by Socket.IO CORS"));
};

const addUserSocket = (userId, socketId) => {
  if (!userSocketMap[userId]) userSocketMap[userId] = new Set();
  userSocketMap[userId].add(socketId);
};

const removeUserSocket = (userId, socketId) => {
  if (!userSocketMap[userId]) return;
  userSocketMap[userId].delete(socketId);
  if (userSocketMap[userId].size === 0) delete userSocketMap[userId];
};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: corsOrigin,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) addUserSocket(userId, socket.id);

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      if (userId) removeUserSocket(userId, socket.id);
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return io;
};

export const getReceiverSocketId = (receiverId) => {
  const socketIds = userSocketMap[receiverId];
  if (!socketIds) return null;
  return Array.from(socketIds);
};

export const getIO = () => io;

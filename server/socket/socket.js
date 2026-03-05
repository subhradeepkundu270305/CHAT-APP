import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

// Maps userId (string) → socketId
const userSocketMap = {};

let io;

export const initSocket = (httpServer) => {
    // Configure allowed origins for Socket CORS
    const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000"
    ];

    if (process.env.CLIENT_URL) {
        allowedOrigins.push(process.env.CLIENT_URL);
    }

    io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    // ── Authentication middleware ──────────────────────────────────────
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) return next(new Error("Authentication error: no token"));

            const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
            const user = await User.findById(decoded.id).select("-password");
            if (!user) return next(new Error("Authentication error: user not found"));

            socket.userId = user._id.toString();
            next();
        } catch (err) {
            next(new Error("Authentication error: invalid token"));
        }
    });

    // ── Connection handler ─────────────────────────────────────────────
    io.on("connection", (socket) => {
        const userId = socket.userId;
        console.log(`🟢 Socket connected: user=${userId}  socket=${socket.id}`);

        userSocketMap[userId] = socket.id;

        // Broadcast updated online users list to everyone
        io.emit("getOnlineUsers", Object.keys(userSocketMap));

        // ── Typing indicators ──────────────────────────────────────────
        socket.on("typing", ({ to }) => {
            const receiverSocketId = userSocketMap[to];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userTyping", { from: userId });
            }
        });

        socket.on("stopTyping", ({ to }) => {
            const receiverSocketId = userSocketMap[to];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userStopTyping", { from: userId });
            }
        });

        // ── Disconnect ─────────────────────────────────────────────────
        socket.on("disconnect", async () => {
            console.log(`🔴 Socket disconnected: user=${userId}  socket=${socket.id}`);
            delete userSocketMap[userId];

            // Persist lastSeen timestamp
            try {
                const now = new Date();
                await User.findByIdAndUpdate(userId, { lastSeen: now });
                // Broadcast the lastSeen time so contacts can update their UI
                io.emit("userLastSeen", { userId, lastSeen: now.toISOString() });
            } catch (e) {
                console.error("Failed to update lastSeen:", e.message);
            }

            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        });
    });

    return io;
};

/** Returns the socket ID for a given userId, or undefined if offline */
export const getSocketId = (userId) => userSocketMap[userId?.toString()];

/** The Socket.io server instance — import this in controllers to emit events */
export { io };

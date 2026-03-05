import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import http from "http";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.route.js";
import contactRoutes from "./routes/contacts.route.js";
import messageRoutes from "./routes/message.route.js";
import userRoutes from "./routes/user.route.js";
import linkRequestRoutes from "./routes/linkRequest.route.js";
import { initSocket } from "./socket/socket.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialise Socket.io (must be done before routes, after http.Server is ready)
initSocket(server);

// Connect to MongoDB — server stays up even if DB is temporarily unavailable
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/chat-app");
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`⚠️  MongoDB connection failed: ${error.message}`);
        console.error("Server is running but database is unavailable. Check MongoDB Atlas IP Whitelist.");
        // Do NOT exit — let the server keep running so we can diagnose
    }
};

// Middleware
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
}));
app.use(express.json({ limit: "10mb" }));

app.use("/api/status", (req, res) => {
    res.send("Server is running");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/link-requests", linkRequestRoutes);

app.get("/", (req, res) => {
    res.send("Chat App API is running...");
});

// Start server
server.listen(PORT, async () => {
    await connectDB();
    console.log(`Server is running on port ${PORT}`);
});
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const protectRoute = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ error: "Not authorized, no token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ error: "User not found" });
        }

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.status(401).json({ error: "Not authorized, token failed" });
    }
};

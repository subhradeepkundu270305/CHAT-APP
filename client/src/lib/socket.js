import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

/**
 * Creates and returns an authenticated socket instance.
 * Call this once the user has a token (i.e. after login).
 */
export const createSocket = (token) => {
    return io(SERVER_URL, {
        auth: { token },
        // Reconnect automatically if the connection drops
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });
};

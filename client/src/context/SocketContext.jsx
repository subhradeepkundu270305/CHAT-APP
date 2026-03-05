import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createSocket } from '../lib/socket';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const socketRef = useRef(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [lastSeenMap, setLastSeenMap] = useState({}); // { userId: isoString }

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const socket = createSocket(token);
        socketRef.current = socket;

        socket.on('connect', () => console.log('✅ Socket connected:', socket.id));
        socket.on('connect_error', (err) => console.warn('⚠️ Socket error:', err.message));

        socket.on('getOnlineUsers', (userIds) => setOnlineUsers(userIds));

        socket.on('userLastSeen', ({ userId, lastSeen }) => {
            setLastSeenMap(prev => ({ ...prev, [userId]: lastSeen }));
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers, lastSeenMap }}>
            {children}
        </SocketContext.Provider>
    );
};

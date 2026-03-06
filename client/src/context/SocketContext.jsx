import React, { createContext, useContext, useEffect, useState } from 'react';
import { createSocket } from '../lib/socket';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [lastSeenMap, setLastSeenMap] = useState({}); // { userId: isoString }

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const newSocket = createSocket(token);
        setSocket(newSocket);

        newSocket.on('connect', () => console.log('✅ Socket connected:', newSocket.id));
        newSocket.on('connect_error', (err) => console.warn('⚠️ Socket error:', err.message));

        newSocket.on('getOnlineUsers', (userIds) => setOnlineUsers(userIds));

        newSocket.on('userLastSeen', ({ userId, lastSeen }) => {
            setLastSeenMap(prev => ({ ...prev, [userId]: lastSeen }));
        });

        return () => {
            newSocket.disconnect();
            setSocket(null);
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers, lastSeenMap }}>
            {children}
        </SocketContext.Provider>
    );
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Socket URL - in dev Vite proxy handles it, in prod nginx proxies /socket.io/
        const backendMode = import.meta.env.VITE_BACKEND_MODE || 'local';
        const localBackend = import.meta.env.VITE_LOCAL_BACKEND_URL?.replace('/api', '') || 'http://localhost:5000';
        // In production, connect to same origin (nginx proxies /socket.io/ to backend)
        const socketUrl = backendMode === 'live' ? window.location.origin : localBackend;

        console.log(`🔌 Socket connecting to: ${socketUrl}`);

        const socketInstance = io(socketUrl, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });

        socketInstance.on('connect', () => {
            console.log('Socket connected:', socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

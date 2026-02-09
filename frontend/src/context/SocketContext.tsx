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
        // Get backend mode and construct socket URL
        const backendMode = import.meta.env.VITE_BACKEND_MODE || 'local';
        const localBackend = import.meta.env.VITE_LOCAL_BACKEND_URL?.replace('/api', '') || 'http://localhost:5000';
        const liveBackend = import.meta.env.VITE_LIVE_BACKEND_URL?.replace('/api', '') || 'http://49.13.223.175:5000';
        const socketUrl = backendMode === 'live' ? liveBackend : localBackend;

        console.log(`🔌 Socket connecting to: ${socketUrl}`);

        const socketInstance = io(socketUrl, {
            withCredentials: true,
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

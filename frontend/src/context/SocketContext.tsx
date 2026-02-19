import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

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
        // Determine backend based on VITE_BACKEND_MODE (respects .env configuration)
        const backendMode = import.meta.env.VITE_BACKEND_MODE || 'local';
        const isLocalMode = backendMode === 'local';

        // Get backend URLs from environment variables
        const localBackend = import.meta.env.VITE_LOCAL_BACKEND_URL?.replace('/api', '') || 'http://localhost:5000';
        const liveBackend = import.meta.env.VITE_LIVE_BACKEND_URL?.replace('/api', '') || 'http://49.13.223.175:5000';

        // Use the appropriate backend based on mode
        const socketUrl = isLocalMode ? localBackend : liveBackend;

        console.log(`🔌 Socket connecting to: ${socketUrl} (${backendMode.toUpperCase()} mode)`);

        const socketInstance = io(socketUrl, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
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

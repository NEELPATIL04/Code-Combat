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

        // Detect if page is loaded over HTTPS
        const isHttps = window.location.protocol === 'https:';

        // Get backend URLs
        let socketUrl: string;

        if (isLocalMode) {
            // Local development mode - connect to localhost:5000
            socketUrl = import.meta.env.VITE_LOCAL_BACKEND_URL?.replace('/api', '') || 'http://localhost:5000';
        } else if (isHttps) {
            // Production HTTPS - use same origin (nginx will proxy /socket.io/)
            socketUrl = window.location.origin;
        } else {
            // Production HTTP - connect directly to port 5000
            socketUrl = import.meta.env.VITE_LIVE_BACKEND_URL?.replace('/api', '') || 'http://49.13.223.175:5000';
        }

        console.log(`🔌 Socket connecting to: ${socketUrl} (${backendMode.toUpperCase()} mode, HTTPS: ${isHttps})`);

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

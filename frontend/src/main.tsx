import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <SocketProvider>
            <App />
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#18181b',
                        color: '#fafafa',
                        border: '1px solid #27272a',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        zIndex: 999999,
                    },
                    success: {
                        iconTheme: { primary: '#10b981', secondary: '#fff' },
                    },
                    error: {
                        iconTheme: { primary: '#ef4444', secondary: '#fff' },
                        duration: 5000,
                    },
                }}
                containerStyle={{
                    zIndex: 999999,
                }}
            />
        </SocketProvider>
    </React.StrictMode>,
)

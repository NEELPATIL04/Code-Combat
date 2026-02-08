import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export type ToastType = 'error' | 'success' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
    message,
    type = 'info',
    duration = 4000,
    onClose,
}) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const getConfig = () => {
        switch (type) {
            case 'error':
                return {
                    icon: AlertCircle,
                    bgColor: 'rgba(239, 68, 68, 0.15)',
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    textColor: '#fca5a5',
                    iconColor: '#ef4444',
                };
            case 'success':
                return {
                    icon: CheckCircle,
                    bgColor: 'rgba(34, 197, 94, 0.15)',
                    borderColor: 'rgba(34, 197, 94, 0.4)',
                    textColor: '#86efac',
                    iconColor: '#22c55e',
                };
            case 'warning':
                return {
                    icon: AlertCircle,
                    bgColor: 'rgba(251, 191, 36, 0.15)',
                    borderColor: 'rgba(251, 191, 36, 0.4)',
                    textColor: '#fcd34d',
                    iconColor: '#fbbf24',
                };
            case 'info':
            default:
                return {
                    icon: Info,
                    bgColor: 'rgba(59, 130, 246, 0.15)',
                    borderColor: 'rgba(59, 130, 246, 0.4)',
                    textColor: '#bfdbfe',
                    iconColor: '#3b82f6',
                };
        }
    };

    const config = getConfig();
    const IconComponent = config.icon;

    return (
        <div
            style={{
                position: 'fixed',
                top: 20,
                right: 20,
                maxWidth: 400,
                background: config.bgColor,
                border: `1px solid ${config.borderColor}`,
                borderRadius: 8,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                zIndex: 11000,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                animation: 'slideInRight 0.3s ease-out',
                backdropFilter: 'blur(2px)',
            }}
        >
            <style>{`
                @keyframes slideInRight {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                }
            `}</style>

            <IconComponent size={20} color={config.iconColor} style={{ flexShrink: 0, marginTop: 2 }} />

            <div style={{ flex: 1 }}>
                <p style={{
                    margin: 0,
                    color: config.textColor,
                    fontSize: 14,
                    fontWeight: 500,
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                }}>
                    {message}
                </p>
            </div>

            <button
                onClick={onClose}
                style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: config.textColor,
                    padding: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.opacity = '0.7';
                }}
                onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.opacity = '1';
                }}
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;

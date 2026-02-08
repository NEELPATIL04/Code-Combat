import React, { useState, useEffect } from 'react';
import { Monitor as MonitorIcon } from 'lucide-react';
import { useSocket } from '../../../../context/SocketContext';
import VideoFeed from '../../../../components/VideoFeed';

interface MonitorProps {
    contestId: number;
}

const Monitor: React.FC<MonitorProps> = ({ contestId }) => {
    const { socket } = useSocket();
    const [activeParticipants, setActiveParticipants] = useState<{ socketId: string, userId: string }[]>([]);

    useEffect(() => {
        if (!socket) return;
        socket.emit('join-monitor', { contestId });

        const handleActiveParticipants = (participants: { socketId: string, userId: string }[]) => {
            setActiveParticipants(participants);
        };

        const handleParticipantJoined = ({ userId, socketId }: { userId: string, socketId: string }) => {
            setActiveParticipants(prev => {
                if (prev.find(p => p.socketId === socketId)) return prev;
                return [...prev, { userId, socketId }];
            });
        };

        const handleParticipantLeft = ({ socketId }: { socketId: string }) => {
            setActiveParticipants(prev => prev.filter(p => p.socketId !== socketId));
        };

        socket.on('active-participants', handleActiveParticipants);
        socket.on('participant-joined', handleParticipantJoined);
        socket.on('participant-left', handleParticipantLeft);

        return () => {
            socket.off('active-participants', handleActiveParticipants);
            socket.off('participant-joined', handleParticipantJoined);
            socket.off('participant-left', handleParticipantLeft);
        };
    }, [socket, contestId]);

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: '#fafafa',
                    margin: '0 0 8px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <MonitorIcon size={24} /> Live Monitor
                </h2>
                <p style={{ color: '#a1a1aa', margin: 0, fontSize: '0.875rem' }}>
                    View live camera and screen shares from active participants
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '16px',
                background: '#09090b',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #27272a',
                minHeight: '400px'
            }}>
                {activeParticipants.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: '#71717a' }}>
                        <MonitorIcon size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                        <p style={{ margin: 0 }}>No active participants connected.</p>
                    </div>
                ) : (
                    activeParticipants.map(p => (
                        <VideoFeed
                            key={p.socketId}
                            socket={socket!}
                            targetSocketId={p.socketId}
                            userId={p.userId}
                            isLarge={false}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default Monitor;

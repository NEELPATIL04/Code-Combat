import React, { useState, useEffect } from 'react';
import { Monitor as MonitorIcon } from 'lucide-react';
import { useSocket } from '../../../../context/SocketContext';
import VideoFeed from '../../../../components/VideoFeed';
import VideoFeedModal from '../../../../components/VideoFeedModal';
import { contestAPI } from '../../../../utils/api';

interface MonitorProps {
    contestId: number;
}

interface SelectedParticipant {
    socketId: string;
    userId: string;
}

const Monitor: React.FC<MonitorProps> = ({ contestId }) => {
    const { socket } = useSocket();
    const [activeParticipants, setActiveParticipants] = useState<{ socketId: string, userId: string }[]>([]);
    const [selectedParticipant, setSelectedParticipant] = useState<SelectedParticipant | null>(null);

    const handleParticipantSelect = (participant: SelectedParticipant) => {
        console.log('✅ Participant selected:', participant);
        setSelectedParticipant(participant);
        // Log activity when admin opens detailed monitoring view
        contestAPI.logActivity(contestId, 'MONITOR_PARTICIPANT_OPENED', {
            targetUserId: participant.userId,
            targetSocketId: participant.socketId,
            timestamp: new Date().toISOString()
        }).catch(err => console.error('Failed to log monitor activity:', err));
    };

    useEffect(() => {
        console.log('🔍 Monitor - Selected participant changed:', selectedParticipant);
    }, [selectedParticipant]);

    useEffect(() => {
        if (!socket) return;
        socket.emit('join-monitor', { contestId });

        const handleActiveParticipants = (participants: { socketId: string, userId: string }[]) => {
            setActiveParticipants(participants);
        };

        const handleParticipantJoined = ({ userId, socketId }: { userId: string, socketId: string }) => {
            setActiveParticipants(prev => {
                // Remove any existing entry for this userId (handles reconnects/multi-tab)
                const filtered = prev.filter(p => p.userId !== userId && p.socketId !== socketId);
                return [...filtered, { userId, socketId }];
            });
        };

        const handleParticipantLeft = ({ socketId }: { socketId: string }) => {
            setActiveParticipants(prev => prev.filter(p => p.socketId !== socketId));
        };

        // When a participant reconnects, update the selected participant's socketId if it's the same user
        const handleParticipantReconnected = ({ userId, socketId }: { userId: string, socketId: string }) => {
            setSelectedParticipant(prev => {
                if (prev && prev.userId === userId && prev.socketId !== socketId) {
                    console.log(`🔄 Selected participant ${userId} reconnected with new socket ${socketId}`);
                    return { ...prev, socketId };
                }
                return prev;
            });
        };

        socket.on('active-participants', handleActiveParticipants);
        socket.on('participant-joined', (data: { userId: string, socketId: string }) => {
            handleParticipantJoined(data);
            handleParticipantReconnected(data);
        });
        socket.on('participant-left', handleParticipantLeft);

        return () => {
            socket.off('active-participants', handleActiveParticipants);
            socket.off('participant-joined');
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
                        <div
                            key={p.socketId}
                            onClick={() => {
                                console.log('🖱️ Clicked on user:', p.userId);
                                handleParticipantSelect(p);
                            }}
                            style={{
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 0 20px rgba(34, 197, 94, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{ height: '100%', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1c1c1c', borderRadius: '8px' }}>
                                {selectedParticipant?.socketId === p.socketId ? (
                                    <div style={{ color: '#a1a1aa', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                        <MonitorIcon size={24} />
                                        <span>Viewing in Modal...</span>
                                    </div>
                                ) : (
                                    <VideoFeed
                                        socket={socket!}
                                        targetSocketId={p.socketId}
                                        userId={p.userId}
                                        isLarge={false}
                                    />
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal for detailed view */}
            {selectedParticipant && (
                <VideoFeedModal
                    socket={socket!}
                    targetSocketId={selectedParticipant.socketId}
                    userId={selectedParticipant.userId}
                    contestId={contestId}
                    onClose={() => {
                        // Log activity when admin closes monitoring view
                        contestAPI.logActivity(contestId, 'MONITOR_PARTICIPANT_CLOSED', {
                            targetUserId: selectedParticipant.userId,
                            targetSocketId: selectedParticipant.socketId,
                            timestamp: new Date().toISOString()
                        }).catch(err => console.error('Failed to log monitor close activity:', err));
                        setSelectedParticipant(null);
                    }}
                />
            )}
        </div>
    );
};

export default Monitor;

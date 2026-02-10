import React, { useEffect, useRef, useState } from 'react';
import { X, User, Monitor, Volume2, VolumeX } from 'lucide-react';
import { Socket } from 'socket.io-client';
import { contestAPI } from '../utils/api';

interface VideoFeedModalProps {
    socket: Socket;
    targetSocketId: string;
    userId: string;
    contestId?: number;
    onClose: () => void;
}

const VideoFeedModal: React.FC<VideoFeedModalProps> = ({ socket, targetSocketId, userId, contestId, onClose }) => {
    console.log('🎬 VideoFeedModal component rendered!', { targetSocketId, userId });

    const cameraVideoRef = useRef<HTMLVideoElement>(null);
    const screenVideoRef = useRef<HTMLVideoElement>(null);
    const cameraAudioRef = useRef<HTMLAudioElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const videoStreamCount = useRef<number>(0);
    const [connectionState, setConnectionState] = useState<string>('connecting');
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [hasCamera, setHasCamera] = useState<boolean>(false);
    const [hasScreen, setHasScreen] = useState<boolean>(false);
    const [hasAudio, setHasAudio] = useState<boolean>(false);

    // Workaround for React's muted attribute bug — set imperatively via ref callback
    const setCameraVideoRef = (el: HTMLVideoElement | null) => {
        (cameraVideoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
        if (el) el.muted = true; // Camera video always muted (audio via separate element)
    };
    const setScreenVideoRef = (el: HTMLVideoElement | null) => {
        (screenVideoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
        if (el) el.muted = true;
    };

    // Helper to force-play a media element
    const forcePlay = (el: HTMLVideoElement | HTMLAudioElement, label: string) => {
        if (el instanceof HTMLVideoElement) el.muted = true;
        const playPromise = el.play();
        if (playPromise) {
            playPromise.catch(err => console.warn(`⚠️ ${label} play() blocked:`, err.message));
        }
    };

    const handleMuteToggle = (newMutedState: boolean) => {
        setIsMuted(newMutedState);
        // Log mute/unmute actions
        if (contestId) {
            contestAPI.logActivity(contestId, newMutedState ? 'MONITOR_AUDIO_MUTED' : 'MONITOR_AUDIO_UNMUTED', {
                targetUserId: userId,
                targetSocketId: targetSocketId,
                timestamp: new Date().toISOString()
            }).catch(err => console.error('Failed to log mute activity:', err));
        }
    };

    useEffect(() => {
        // Prevent re-running if peer connection already exists
        if (peerConnection.current) {
            console.log('⏩ VideoFeedModal: Peer connection already exists, skipping setup');
            return;
        }

        console.log(`🔌 VideoFeedModal: Setting up connection for participant ${userId} (socket: ${targetSocketId})`);
        console.log(`🔌 Socket connected:`, socket.connected);
        console.log(`🔌 Socket ID:`, socket.id);

        const setupConnection = async () => {
            console.log('🆕 VideoFeedModal: Creating new RTCPeerConnection for', targetSocketId);
            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });
            peerConnection.current = pc;

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log('🧊 VideoFeedModal: Sending ICE candidate to', targetSocketId);
                    socket.emit('ice-candidate', { target: targetSocketId, candidate: event.candidate });
                } else {
                    console.log('✅ VideoFeedModal: ICE gathering complete');
                }
            };

            pc.ontrack = (event) => {
                const track = event.track;
                const stream = event.streams[0] || new MediaStream([track]);
                const transceiver = event.transceiver;

                console.log('📹 VideoFeedModal received track:', {
                    kind: track.kind,
                    label: track.label,
                    readyState: track.readyState,
                    muted: track.muted,
                    streamId: stream?.id,
                    streamVideoTracks: stream?.getVideoTracks().length,
                    transceiverMid: transceiver?.mid,
                    transceiverDirection: transceiver?.direction
                });

                if (track.kind === 'video') {
                    videoStreamCount.current += 1;
                    const streamIndex = videoStreamCount.current;

                    console.log(`🎬 Video stream #${streamIndex} received in Modal (transceiver mid: ${transceiver?.mid})`);

                    if (streamIndex === 1) {
                        console.log('📷 Stream #1 → Setting to CAMERA (left panel)');
                        if (cameraVideoRef.current) {
                            cameraVideoRef.current.srcObject = stream;
                            forcePlay(cameraVideoRef.current, 'Modal Camera');
                        }
                        setHasCamera(true);
                        track.onunmute = () => {
                            console.log('📷 Modal camera track unmuted, forcing play');
                            if (cameraVideoRef.current) forcePlay(cameraVideoRef.current, 'Modal Camera');
                        };
                    } else if (streamIndex === 2) {
                        console.log('🖥️ Stream #2 → Setting to SCREEN SHARE (right panel)');
                        if (screenVideoRef.current) {
                            screenVideoRef.current.srcObject = stream;
                            forcePlay(screenVideoRef.current, 'Modal Screen');
                        }
                        setHasScreen(true);
                        track.onunmute = () => {
                            console.log('🖥️ Modal screen track unmuted, forcing play');
                            if (screenVideoRef.current) forcePlay(screenVideoRef.current, 'Modal Screen');
                        };
                    }
                } else if (track.kind === 'audio') {
                    console.log('🎤 Setting audio track in Modal');
                    if (cameraAudioRef.current) {
                        cameraAudioRef.current.srcObject = stream;
                        cameraAudioRef.current.muted = isMuted;
                        forcePlay(cameraAudioRef.current, 'Modal Audio');
                    }
                    setHasAudio(true);
                    track.onunmute = () => {
                        console.log('🎤 Modal audio track unmuted, forcing play');
                        if (cameraAudioRef.current) forcePlay(cameraAudioRef.current, 'Modal Audio');
                    };
                }
            };

            pc.onconnectionstatechange = () => {
                console.log('Connection state:', pc.connectionState);
                setConnectionState(pc.connectionState);
            };

            // Fallback: some browsers only fire ICE state changes
            pc.oniceconnectionstatechange = () => {
                console.log('ICE connection state:', pc.iceConnectionState);
                if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
                    setConnectionState('connected');
                } else if (pc.iceConnectionState === 'failed') {
                    setConnectionState('failed');
                } else if (pc.iceConnectionState === 'disconnected') {
                    setConnectionState('reconnecting');
                }
            };

            // Add transceivers for receiving media
            console.log('➕ VideoFeedModal: Adding transceivers (audio + 2 video)');
            pc.addTransceiver('audio', { direction: 'recvonly' }); // For microphone
            pc.addTransceiver('video', { direction: 'recvonly' }); // For camera
            pc.addTransceiver('video', { direction: 'recvonly' }); // For screen share

            console.log('📝 VideoFeedModal: Creating offer...');
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            console.log('📤 VideoFeedModal: Sending WebRTC offer to participant', {
                targetSocketId,
                userId,
                offerType: offer.type,
                socketConnected: socket.connected
            });
            socket.emit('offer', { target: targetSocketId, payload: offer });
            console.log('✅ VideoFeedModal: Offer sent successfully');
        };

        setupConnection();

        const handleAnswer = async ({ sender, payload }: { sender: string, payload: RTCSessionDescriptionInit }) => {
            if (sender === targetSocketId && peerConnection.current) {
                try {
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(payload));
                    console.log('✅ Remote description set');
                } catch (err) {
                    console.error('❌ Error setting remote description:', err);
                }
            }
        };

        const handleIceCandidate = async ({ sender, candidate }: { sender: string, candidate: RTCIceCandidateInit }) => {
            if (sender === targetSocketId && peerConnection.current) {
                try {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                    console.error('❌ Error adding ICE candidate:', err);
                }
            }
        };

        socket.on('answer', handleAnswer);
        socket.on('ice-candidate', handleIceCandidate);

        return () => {
            socket.off('answer', handleAnswer);
            socket.off('ice-candidate', handleIceCandidate);
            if (peerConnection.current) {
                peerConnection.current.close();
            }
        };
    }, [socket, targetSocketId]);

    // Handle mute/unmute
    useEffect(() => {
        if (cameraAudioRef.current) {
            cameraAudioRef.current.muted = isMuted;
        }
    }, [isMuted]);

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.85)',
                    zIndex: 9998,
                    backdropFilter: 'blur(4px)'
                }}
            />

            {/* Modal */}
            <div
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90vw',
                    maxWidth: '1400px',
                    height: '85vh',
                    background: '#09090b',
                    borderRadius: '16px',
                    border: '1px solid #27272a',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 24px',
                    borderBottom: '1px solid #27272a',
                    background: '#18181b'
                }}>
                    <div>
                        <h2 style={{
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            color: '#fafafa',
                            margin: '0 0 4px 0'
                        }}>
                            Participant Monitor - User {userId}
                        </h2>
                        <p style={{
                            fontSize: '0.875rem',
                            color: '#a1a1aa',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{
                                display: 'inline-block',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: connectionState === 'connected' ? '#22c55e' :
                                           connectionState === 'connecting' ? '#eab308' : '#ef4444'
                            }} />
                            {connectionState === 'connected' ? 'Connected' :
                             connectionState === 'connecting' ? 'Connecting...' : 'Disconnected'}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {/* Mute/Unmute Button */}
                        <button
                            onClick={() => handleMuteToggle(!isMuted)}
                            disabled={!hasAudio}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                background: isMuted ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                border: isMuted ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)',
                                borderRadius: '8px',
                                color: isMuted ? '#ef4444' : '#22c55e',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                cursor: hasAudio ? 'pointer' : 'not-allowed',
                                opacity: hasAudio ? 1 : 0.5,
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                if (hasAudio) {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                            {isMuted ? 'Unmute' : 'Mute'}
                        </button>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '36px',
                                height: '36px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid #27272a',
                                borderRadius: '8px',
                                color: '#fafafa',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                e.currentTarget.style.borderColor = '#ef4444';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.borderColor = '#27272a';
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Split View: Camera/Mic on Left, Screen Share on Right */}
                <div style={{
                    flex: 1,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1px',
                    background: '#000',
                    overflow: 'hidden'
                }}>
                    {/* Left Half: Camera + Audio */}
                    <div style={{
                        background: '#18181b',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative'
                    }}>
                        <div style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid #27272a',
                            background: '#09090b'
                        }}>
                            <h3 style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: '#fafafa',
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <User size={16} />
                                Camera & Microphone Feed
                            </h3>
                        </div>

                        <div style={{ flex: 1, position: 'relative', background: '#000' }}>
                            <video
                                ref={setCameraVideoRef}
                                autoPlay
                                playsInline
                                muted
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    background: '#000'
                                }}
                            />
                            {!hasCamera && (
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center',
                                    color: '#71717a'
                                }}>
                                    <User size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                                    <p style={{ margin: 0, fontSize: '0.875rem' }}>No camera feed</p>
                                </div>
                            )}

                            {/* Audio Element (hidden) */}
                            <audio ref={cameraAudioRef} autoPlay style={{ display: 'none' }} />

                            {/* Audio Indicator */}
                            <div style={{
                                position: 'absolute',
                                bottom: '16px',
                                left: '16px',
                                background: 'rgba(0, 0, 0, 0.7)',
                                backdropFilter: 'blur(8px)',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                {isMuted ? <VolumeX size={16} color="#ef4444" /> : <Volume2 size={16} color="#22c55e" />}
                                <span style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    color: '#fafafa'
                                }}>
                                    {hasAudio ? (isMuted ? 'Audio Muted' : 'Audio Active') : 'No Audio'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Half: Screen Share */}
                    <div style={{
                        background: '#18181b',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative'
                    }}>
                        <div style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid #27272a',
                            background: '#09090b'
                        }}>
                            <h3 style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: '#fafafa',
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Monitor size={16} />
                                Screen Share Feed
                            </h3>
                        </div>

                        <div style={{ flex: 1, position: 'relative', background: '#000' }}>
                            <video
                                ref={setScreenVideoRef}
                                autoPlay
                                playsInline
                                muted
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    background: '#000'
                                }}
                            />
                            {!hasScreen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center',
                                    color: '#71717a'
                                }}>
                                    <Monitor size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                                    <p style={{ margin: 0, fontSize: '0.875rem' }}>No screen share</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div style={{
                    padding: '12px 24px',
                    borderTop: '1px solid #27272a',
                    background: '#18181b',
                    fontSize: '0.75rem',
                    color: '#71717a',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span>Press ESC to close</span>
                    <span>
                        Camera: {hasCamera ? '✓' : '✗'} |
                        Audio: {hasAudio ? '✓' : '✗'} |
                        Screen: {hasScreen ? '✓' : '✗'}
                    </span>
                </div>
            </div>
        </>
    );
};

export default React.memo(VideoFeedModal, (prevProps, nextProps) => {
    // Only re-render if these specific props change
    return (
        prevProps.targetSocketId === nextProps.targetSocketId &&
        prevProps.userId === nextProps.userId &&
        prevProps.contestId === nextProps.contestId
    );
});

import React, { useEffect, useRef, useState } from 'react';
import { User, Monitor, Maximize2 } from 'lucide-react';
import { Socket } from 'socket.io-client';

interface VideoFeedProps {
    socket: Socket;
    targetSocketId: string;
    userId: string;
    isLarge?: boolean;
}

const ICE_SERVERS: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
];

const VideoFeed: React.FC<VideoFeedProps> = ({ socket, targetSocketId, userId, isLarge = false }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const screenRef = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const videoStreamCount = useRef<number>(0);
    const [connectionState, setConnectionState] = useState<string>('connecting');
    const [isHovered, setIsHovered] = useState(false);
    const retryCount = useRef<number>(0);
    const maxRetries = 3;
    const isMounted = useRef(true);

    // Workaround for React's muted attribute bug — set it imperatively via ref callback
    const setVideoRef = (el: HTMLVideoElement | null) => {
        (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
        if (el) el.muted = true;
    };
    const setScreenRef = (el: HTMLVideoElement | null) => {
        (screenRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
        if (el) el.muted = true;
    };

    // Helper to force-play a video element
    const forcePlay = (video: HTMLVideoElement, label: string) => {
        video.muted = true; // Ensure muted for autoplay policy
        const playPromise = video.play();
        if (playPromise) {
            playPromise.catch(err => console.warn(`⚠️ ${label} play() blocked:`, err.message));
        }
    };

    useEffect(() => {
        isMounted.current = true;

        const setupConnection = async () => {
            try {
                // Close previous connection if exists
                if (peerConnection.current) {
                    peerConnection.current.close();
                    peerConnection.current = null;
                }
                videoStreamCount.current = 0;

                const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
                peerConnection.current = pc;

                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        console.log('🧊 Sending ICE candidate to', targetSocketId);
                        socket.emit('ice-candidate', { target: targetSocketId, candidate: event.candidate });
                    }
                };

                pc.ontrack = (event) => {
                    const track = event.track;
                    const stream = event.streams[0] || new MediaStream([track]);

                    console.log('📹 Received track:', {
                        kind: track.kind,
                        label: track.label,
                        readyState: track.readyState,
                        muted: track.muted,
                        streamId: stream?.id
                    });

                    if (track.kind === 'video') {
                        videoStreamCount.current += 1;
                        const streamIndex = videoStreamCount.current;

                        console.log(`🎬 Video stream #${streamIndex} received in VideoFeed`);

                        if (streamIndex === 1 && videoRef.current) {
                            console.log('📷 Stream #1 → Setting to CAMERA');
                            videoRef.current.srcObject = stream;
                            forcePlay(videoRef.current, 'Camera');
                            // Also play when track becomes unmuted (media starts flowing)
                            track.onunmute = () => {
                                console.log('📷 Camera track unmuted, forcing play');
                                if (videoRef.current) forcePlay(videoRef.current, 'Camera');
                            };
                        } else if (streamIndex === 2 && screenRef.current) {
                            console.log('🖥️ Stream #2 → Setting to SCREEN SHARE');
                            screenRef.current.srcObject = stream;
                            forcePlay(screenRef.current, 'Screen');
                            track.onunmute = () => {
                                console.log('🖥️ Screen track unmuted, forcing play');
                                if (screenRef.current) forcePlay(screenRef.current, 'Screen');
                            };
                        }
                    }
                };

                // Track both connection state and ICE connection state
                pc.onconnectionstatechange = () => {
                    console.log(`🔗 Connection state for ${userId}: ${pc.connectionState}`);
                    if (isMounted.current) {
                        setConnectionState(pc.connectionState);
                    }
                    // Retry on failure
                    if (pc.connectionState === 'failed' && retryCount.current < maxRetries) {
                        retryCount.current++;
                        console.log(`🔄 Retrying connection (${retryCount.current}/${maxRetries})...`);
                        setTimeout(() => {
                            if (isMounted.current) setupConnection();
                        }, 2000);
                    }
                };

                pc.oniceconnectionstatechange = () => {
                    console.log(`🧊 ICE state for ${userId}: ${pc.iceConnectionState}`);
                    // Use ICE connection state as fallback indicator
                    if (isMounted.current) {
                        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
                            setConnectionState('connected');
                            retryCount.current = 0; // Reset retries on success
                        } else if (pc.iceConnectionState === 'failed') {
                            setConnectionState('failed');
                            if (retryCount.current < maxRetries) {
                                retryCount.current++;
                                console.log(`🔄 ICE failed, retrying (${retryCount.current}/${maxRetries})...`);
                                setTimeout(() => {
                                    if (isMounted.current) setupConnection();
                                }, 2000);
                            }
                        } else if (pc.iceConnectionState === 'disconnected') {
                            setConnectionState('reconnecting');
                        }
                    }
                };

                // Add transceivers for receiving media (audio + 2 video to match participant tracks)
                pc.addTransceiver('audio', { direction: 'recvonly' }); // For microphone audio
                pc.addTransceiver('video', { direction: 'recvonly' }); // For camera
                pc.addTransceiver('video', { direction: 'recvonly' }); // For screen

                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                console.log('📤 Sending offer to', targetSocketId);
                socket.emit('offer', { target: targetSocketId, payload: offer });
            } catch (err) {
                console.error('Error setting up WebRTC connection:', err);
                if (isMounted.current) setConnectionState('failed');
            }
        };

        setupConnection();

        const handleAnswer = async ({ sender, payload }: { sender: string, payload: RTCSessionDescriptionInit }) => {
            if (sender === targetSocketId && peerConnection.current) {
                try {
                    console.log('📥 Received answer from', sender);
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(payload));
                } catch (err) {
                    console.error("Error setting remote description:", err);
                }
            }
        };

        const handleIceCandidate = async ({ sender, candidate }: { sender: string, candidate: RTCIceCandidateInit }) => {
            if (sender === targetSocketId && peerConnection.current) {
                try {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                    console.error("Error adding ice candidate:", err);
                }
            }
        };

        socket.on('answer', handleAnswer);
        socket.on('ice-candidate', handleIceCandidate);

        return () => {
            isMounted.current = false;
            socket.off('answer', handleAnswer);
            socket.off('ice-candidate', handleIceCandidate);
            if (peerConnection.current) {
                peerConnection.current.close();
                peerConnection.current = null;
            }
        };
    }, [socket, targetSocketId]);

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                background: '#18181b',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #27272a',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
            }}>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#fafafa' }}>User: {userId}</span>
                <span style={{ fontSize: '0.75rem', color: connectionState === 'connected' ? '#22c55e' : '#eab308' }}>
                    {connectionState}
                </span>
            </div>

            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: isLarge ? '1fr 1fr' : '1fr 1fr', gap: '1px', background: '#000', position: 'relative' }}>
                <div style={{ position: 'relative', aspectRatio: '16/9' }}>
                    <video ref={setVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={10} /> Camera
                    </div>
                </div>
                <div style={{ position: 'relative', aspectRatio: '16/9' }}>
                    <video ref={setScreenRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Monitor size={10} /> Screen
                    </div>
                </div>
            </div>

            {/* Click to expand indicator */}
            <div
                style={{
                    position: 'absolute',
                    top: '44px',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: isHovered ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.2s, background 0.2s',
                    pointerEvents: 'none',
                    zIndex: 10
                }}
            >
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px',
                    background: 'rgba(0, 0, 0, 0.8)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(4px)'
                }}>
                    <Maximize2 size={24} color="#22c55e" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#fafafa' }}>Click to expand</span>
                </div>
            </div>
        </div>
    );
};

export default VideoFeed;

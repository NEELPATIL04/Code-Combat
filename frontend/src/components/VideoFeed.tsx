import React, { useEffect, useRef, useState } from 'react';
import { User, Monitor, Maximize2 } from 'lucide-react';
import { Socket } from 'socket.io-client';

interface VideoFeedProps {
    socket: Socket;
    targetSocketId: string;
    userId: string;
    isLarge?: boolean;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ socket, targetSocketId, userId, isLarge = false }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const screenRef = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const videoStreamCount = useRef<number>(0);
    const [connectionState, setConnectionState] = useState<string>('connecting');
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const setupConnection = async () => {
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });
            peerConnection.current = pc;

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('ice-candidate', { target: targetSocketId, candidate: event.candidate });
                }
            };

            pc.ontrack = (event) => {
                const track = event.track;
                const stream = event.streams[0];

                console.log('📹 Received track:', {
                    kind: track.kind,
                    label: track.label,
                    streamId: stream?.id
                });

                if (track.kind === 'video' && stream) {
                    // Track which video stream this is
                    // First video stream = Camera, Second video stream = Screen share
                    videoStreamCount.current += 1;
                    const streamIndex = videoStreamCount.current;

                    console.log(`🎬 Video stream #${streamIndex} received in VideoFeed`);

                    if (streamIndex === 1) {
                        // First video stream is camera
                        console.log('📷 Stream #1 → Setting to CAMERA');
                        videoRef.current!.srcObject = stream;
                    } else if (streamIndex === 2) {
                        // Second video stream is screen share
                        console.log('🖥️ Stream #2 → Setting to SCREEN SHARE');
                        screenRef.current!.srcObject = stream;
                    }
                }
            };

            pc.onconnectionstatechange = () => {
                setConnectionState(pc.connectionState);
            };

            // Create Offer (Admin initiates)
            // Actually, usually we add a transceiver to receive video?
            pc.addTransceiver('video', { direction: 'recvonly' });
            pc.addTransceiver('video', { direction: 'recvonly' }); // For screen

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('offer', { target: targetSocketId, payload: offer });
        };

        setupConnection();

        const handleAnswer = async ({ sender, payload }: { sender: string, payload: RTCSessionDescriptionInit }) => {
            if (sender === targetSocketId && peerConnection.current) {
                try {
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
            socket.off('answer', handleAnswer);
            socket.off('ice-candidate', handleIceCandidate);
            if (peerConnection.current) {
                peerConnection.current.close();
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

            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: isLarge ? '1fr 1fr' : '1fr', gap: '1px', background: '#000', position: 'relative' }}>
                <div style={{ position: 'relative', aspectRatio: '16/9' }}>
                    <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={10} /> Camera
                    </div>
                </div>
                {isLarge && (
                    <div style={{ position: 'relative', aspectRatio: '16/9' }}>
                        <video ref={screenRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Monitor size={10} /> Screen
                        </div>
                    </div>
                )}
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

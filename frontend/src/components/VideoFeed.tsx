import React, { useEffect, useRef, useState } from 'react';
import { User, Monitor } from 'lucide-react';
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
    const [connectionState, setConnectionState] = useState<string>('connecting');

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
                // Determine if track is camera or screen based on kind or order?
                // Usually we can't easily distinguish without metadata. 
                // However, usually first track is video (camera), second might be screen if both video.
                // Or we can assume input stream order.
                // Let's just assign to video elements as they come.

                // Hack: If we receive a track, we check if videoRef is empty, else screenRef.
                // This assumes order or separate streams. 
                // Actually, Task.tsx adds camera first, then screen.

                if (videoRef.current && (!videoRef.current.srcObject || (videoRef.current.srcObject as MediaStream).getTracks().length === 0)) {
                    videoRef.current.srcObject = new MediaStream([event.track]);
                } else if (screenRef.current) {
                    screenRef.current.srcObject = new MediaStream([event.track]);
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
        <div style={{
            background: '#18181b',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #27272a',
            position: 'relative'
        }}>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#fafafa' }}>User: {userId}</span>
                <span style={{ fontSize: '0.75rem', color: connectionState === 'connected' ? '#22c55e' : '#eab308' }}>
                    {connectionState}
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isLarge ? '1fr 1fr' : '1fr', gap: '1px', background: '#000' }}>
                <div style={{ position: 'relative', aspectRatio: '16/9' }}>
                    <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={10} /> Camera
                    </div>
                </div>
                {(isLarge || screenRef.current?.srcObject) && (
                    <div style={{ position: 'relative', aspectRatio: '16/9', display: isLarge ? 'block' : 'none' }}>
                        {/* Only show screen in grid if we want, but user said "small small block of everything" */}
                        {/* Maybe just show camera in small grid, and both in large? */}
                        {/* User said "mic feedback then camera feedback ,screen share feedback at realtime" */}
                        {/* I'll hide screen in small view to save space/bandwidth if feasible, but actually stream is already requested */}
                        {/* I'll execute what I wrote: grid view. */}
                        <video ref={screenRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Monitor size={10} /> Screen
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoFeed;

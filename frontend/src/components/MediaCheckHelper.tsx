import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, Monitor, CheckCircle, Info } from 'lucide-react';

interface MediaCheckHelperProps {
    onPermissionsGranted: (streams: { camera: MediaStream | null, screen: MediaStream | null }) => void;
    requiredPermissions?: {
        camera: boolean;
        microphone: boolean;
        screen: boolean;
    };
}

const MediaCheckHelper: React.FC<MediaCheckHelperProps> = ({
    onPermissionsGranted,
    requiredPermissions = { camera: true, microphone: true, screen: true }
}) => {
    const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
    const [micPermission, setMicPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
    const [screenPermission, setScreenPermission] = useState<'pending' | 'granted' | 'denied'>('pending');

    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const screenRef = useRef<HTMLVideoElement>(null);

    const requestCameraAndMic = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setCameraPermission('granted');
            setMicPermission('granted');
            setCameraStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera/mic:", err);
            setCameraPermission('denied');
            setMicPermission('denied');
        }
    };

    const requestScreenShare = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
            setScreenPermission('granted');
            setScreenStream(stream);
            if (screenRef.current) {
                screenRef.current.srcObject = stream;
            }

            // Handle user stopping share via browser UI
            stream.getVideoTracks()[0].onended = () => {
                setScreenPermission('denied');
                setScreenStream(null);
            };
        } catch (err) {
            console.error("Error accessing screen:", err);
            setScreenPermission('denied');
        }
    };

    useEffect(() => {
        const cameraOk = !requiredPermissions.camera || (cameraPermission === 'granted' && !!cameraStream);
        const micOk = !requiredPermissions.microphone || micPermission === 'granted';
        const screenOk = !requiredPermissions.screen || (screenPermission === 'granted' && !!screenStream);

        if (cameraOk && micOk && screenOk) {
            onPermissionsGranted({ camera: cameraStream, screen: screenStream });
        }
    }, [cameraPermission, micPermission, screenPermission, cameraStream, screenStream, onPermissionsGranted, requiredPermissions]);

    return (
        <div style={{ padding: '24px', background: '#09090b', borderRadius: '12px', border: '1px solid #27272a', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ color: '#fafafa', marginBottom: '8px' }}>System Check</h2>
            <p style={{ color: '#a1a1aa', marginBottom: '24px' }}>
                To create a fair contest environment, we require access to your Camera, Microphone, and Screen.
                This data is live-streamed to the proctor and is <strong>not recorded</strong>.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                {/* Camera Preview */}
                <div style={{
                    background: '#000',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    aspectRatio: '16/9',
                    position: 'relative',
                    border: cameraPermission === 'granted' ? '2px solid #22c55e' : '1px solid #27272a'
                }}>
                    <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', gap: '8px' }}>
                        <span style={{
                            background: 'rgba(0,0,0,0.6)',
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <Camera size={12} /> {cameraPermission === 'granted' ? 'Camera On' : 'Camera Off'}
                        </span>
                        <span style={{
                            background: 'rgba(0,0,0,0.6)',
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <Mic size={12} /> {micPermission === 'granted' ? 'Mic On' : 'Mic Off'}
                        </span>
                    </div>
                </div>

                {/* Screen Preview */}
                <div style={{
                    background: '#000',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    aspectRatio: '16/9',
                    position: 'relative',
                    border: screenPermission === 'granted' ? '2px solid #22c55e' : '1px solid #27272a'
                }}>
                    <video ref={screenRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: '12px', left: '12px' }}>
                        <span style={{
                            background: 'rgba(0,0,0,0.6)',
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <Monitor size={12} /> {screenPermission === 'granted' ? 'Screen Shared' : 'Screen Off'}
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                    onClick={requestCameraAndMic}
                    disabled={cameraPermission === 'granted'}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '6px',
                        background: cameraPermission === 'granted' ? '#27272a' : '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        cursor: cameraPermission === 'granted' ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: cameraPermission === 'granted' ? 0.7 : 1
                    }}
                >
                    {cameraPermission === 'granted' ? <CheckCircle size={16} /> : <Camera size={16} />}
                    {cameraPermission === 'granted' ? 'Camera & Mic Enabled' : 'Enable Camera & Mic'}
                </button>

                <button
                    onClick={requestScreenShare}
                    disabled={screenPermission === 'granted'}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '6px',
                        background: screenPermission === 'granted' ? '#27272a' : '#8b5cf6',
                        color: '#fff',
                        border: 'none',
                        cursor: screenPermission === 'granted' ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: screenPermission === 'granted' ? 0.7 : 1
                    }}
                >
                    {screenPermission === 'granted' ? <CheckCircle size={16} /> : <Monitor size={16} />}
                    {screenPermission === 'granted' ? 'Screen Share Enabled' : 'Share Screen'}
                </button>
            </div>

            {/* Verification Status */}
            <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#3b82f6', fontSize: '0.875rem', textAlign: 'center' }}>
                <Info size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />
                Please ensure you share your <strong>Entire Screen</strong> for valid monitoring.
            </div>
        </div>
    );
};

export default MediaCheckHelper;

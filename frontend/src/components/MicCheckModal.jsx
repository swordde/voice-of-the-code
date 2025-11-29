import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, ProgressBar } from 'react-bootstrap';

const MicCheckModal = ({ show, onHide, onStart }) => {
    const [volume, setVolume] = useState(0);
    const [stream, setStream] = useState(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (show) {
            startMicCheck();
        } else {
            stopMicCheck();
        }
        return () => stopMicCheck();
    }, [show]);

    const startMicCheck = async () => {
        try {
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setStream(audioStream);

            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            sourceRef.current = audioContextRef.current.createMediaStreamSource(audioStream);
            
            sourceRef.current.connect(analyserRef.current);
            analyserRef.current.fftSize = 256;
            
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateVolume = () => {
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;
                // Scale up a bit for visibility, cap at 100
                setVolume(Math.min(100, average * 2)); 
                animationRef.current = requestAnimationFrame(updateVolume);
            };

            updateVolume();
        } catch (err) {
            console.error("Error accessing microphone:", err);
        }
    };

    const stopMicCheck = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        setVolume(0);
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>🎤 Mic Check</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
                <p>Speak to test your microphone.</p>
                <div className="mb-3">
                    <ProgressBar 
                        now={volume} 
                        variant={volume > 10 ? "success" : "warning"} 
                        style={{ height: '20px' }} 
                    />
                </div>
                <p className="text-muted small">
                    {volume > 10 ? "Microphone is working! ✅" : "Waiting for audio..."}
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={onStart} disabled={volume < 5}>
                    Start Interview
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default MicCheckModal;

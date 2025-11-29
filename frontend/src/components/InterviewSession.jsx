import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useWebSocket } from '../hooks/useWebSocket';
import AudioVisualizer from './AudioVisualizer';
import { endpoints } from '../config';

const InterviewSession = ({ type, onEndSession }) => {
    const [messages, setMessages] = useState([]);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    
    // Refs for real-time logic
    const transcriptRef = useRef('');
    const silenceTimer = useRef(null);
    const stopListeningRef = useRef(null);
    const messagesEndRef = useRef(null);
    
    // Use a random client ID for now, persisted across renders
    const [clientId] = useState(Math.floor(Math.random() * 1000));
    const { isConnected, lastMessage, sendMessage } = useWebSocket(endpoints.wsInterview(clientId, type));
    
    // Browser Speech Recognition
    const recognitionRef = useRef(null);

    // Keep the stop function ref updated
    useEffect(() => {
        stopListeningRef.current = handleStopListening;
    });

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isProcessing, transcript, interimTranscript]);

    useEffect(() => {
        // Initialize Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                // Reset silence timer on any speech
                if (silenceTimer.current) clearTimeout(silenceTimer.current);

                let finalChunk = '';
                let interimChunk = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalChunk += event.results[i][0].transcript + ' ';
                    } else {
                        interimChunk += event.results[i][0].transcript;
                    }
                }

                if (finalChunk) {
                    setTranscript(prev => {
                        const newVal = prev + finalChunk;
                        transcriptRef.current = newVal; // Sync ref
                        return newVal;
                    });
                }
                
                setInterimTranscript(interimChunk);

                // Set timer to stop listening after 3 seconds of silence (increased from 2s)
                silenceTimer.current = setTimeout(() => {
                    if (stopListeningRef.current) {
                        stopListeningRef.current();
                    }
                }, 3000);
            };

            recognitionRef.current.onerror = (event) => {
                if (event.error === 'no-speech') {
                    // Ignore no-speech error, just stop listening
                    setIsListening(false);
                    return;
                }
                if (event.error === 'aborted') {
                    // Ignore aborted error
                    return;
                }
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };
            
            recognitionRef.current.onend = () => {
                // If needed, we could restart here for true continuous, 
                // but we rely on silence timer to stop.
                setIsListening(false);
            };
        } else {
            alert("Browser does not support Speech Recognition. Please use Chrome.");
        }
    }, []);

    useEffect(() => {
        if (lastMessage) {
            try {
                const data = JSON.parse(lastMessage);
                if (data.type === 'transcript') {
                    // Server-side transcript (ignored in browser mode usually, but kept for compatibility)
                    setMessages((prev) => [...prev, { sender: 'User (Live)', text: data.text, role: 'user' }]);
                } else if (data.type === 'ai_response') {
                    setIsProcessing(false);
                    setMessages((prev) => [...prev, { sender: 'AI', text: data.text, role: 'ai' }]);
                    speakText(data.text);
                } else if (data.type === 'audio') {
                    setIsProcessing(false);
                    // Server-side audio (ElevenLabs)
                    playAudio(data.data);
                } else if (data.type === 'system') {
                     setMessages((prev) => [...prev, { sender: 'System', text: data.text, role: 'system' }]);
                }
            } catch (e) {
                setMessages((prev) => [...prev, { sender: 'System', text: lastMessage, role: 'system' }]);
            }
        }
    }, [lastMessage]);

    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            setIsAiSpeaking(true);
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => {
                setIsAiSpeaking(false);
                handleStartListening(); // Auto-start listening when AI stops
            };
            window.speechSynthesis.speak(utterance);
        }
    };

    const playAudio = (base64Data) => {
        try {
            const audio = new Audio(`data:audio/mp3;base64,${base64Data}`);
            setIsAiSpeaking(true);
            audio.onended = () => {
                setIsAiSpeaking(false);
                handleStartListening(); // Auto-start listening when AI stops
            };
            audio.play();
        } catch (e) {
            console.error("Error playing audio:", e);
            setIsAiSpeaking(false);
        }
    };

    const handleStartListening = () => {
        if (isListening) return; // Prevent double start
        try {
            // Abort any previous instance just in case
            recognitionRef.current?.abort();
            
            // Small delay to ensure abort completes
            setTimeout(() => {
                try {
                    recognitionRef.current?.start();
                    setTranscript('');
                    setInterimTranscript('');
                    transcriptRef.current = '';
                    setIsListening(true);
                } catch (e) {
                    console.error("Error starting speech recognition:", e);
                    // If it fails, try to force reset
                    if (e.name === 'InvalidStateError') {
                         setIsListening(true); // Assume it's running
                    }
                }
            }, 100);
        } catch (e) {
            console.error("Error preparing speech recognition:", e);
        }
    };

    const handleStopListening = () => {
        if (silenceTimer.current) clearTimeout(silenceTimer.current);
        setIsListening(false);
        try {
            recognitionRef.current?.stop();
        } catch (e) {
            // Ignore stop errors
        }
        
        // Combine final transcript with any pending interim transcript if needed
        // Usually stop() forces final result event, but just in case
        const textToSend = transcriptRef.current;
        
        if (textToSend && textToSend.trim()) {
            setIsProcessing(true);
            setMessages(prev => [...prev, { sender: 'User', text: textToSend, role: 'user' }]);
            sendMessage(JSON.stringify({ type: "submit_answer", text: textToSend }));
            // Clear for next turn
            setTranscript('');
            setInterimTranscript('');
            transcriptRef.current = '';
        }
    };

    const handleEndInterview = async () => {
        // 1. Filter messages to get history
        const history = messages
            .filter(m => m.role === 'ai' || m.role === 'user')
            .map(m => ({
                role: m.role === 'ai' ? 'assistant' : 'user',
                content: m.text
            }));

        // 2. Call backend to grade
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(endpoints.grade, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ history, type })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const report = await response.json();
            onEndSession(report);
        } catch (e) {
            console.error("Error grading interview:", e);
            alert("Failed to generate report. Check console.");
        }
    };

    return (
        <Container fluid className="h-100 d-flex flex-column py-3" style={{ maxHeight: 'calc(100vh - 70px)' }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3 px-3">
                <div>
                    <h4 className="mb-0 fw-bold text-primary">
                        {type === 'behavioral' ? 'Behavioral Interview' : 'Technical Interview'}
                    </h4>
                    <small className="text-muted">
                        <span className={`badge ${isConnected ? 'bg-success' : 'bg-danger'} me-2`}>
                            {isConnected ? 'Live' : 'Offline'}
                        </span>
                        Session ID: #{clientId}
                    </small>
                </div>
                <Button variant="outline-danger" size="sm" onClick={handleEndInterview} className="rounded-pill px-3">
                    End Session
                </Button>
            </div>

            {/* Chat Area */}
            <div className="flex-grow-1 overflow-auto mb-3 px-3" style={{ scrollBehavior: 'smooth' }}>
                {messages.length === 0 && (
                    <div className="text-center text-muted mt-5">
                        <div className="display-1 mb-3">👋</div>
                        <p className="lead">Say "Hello" to start your interview!</p>
                    </div>
                )}
                
                {messages.map((msg, idx) => (
                    <div key={idx} className={`d-flex mb-3 ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                        {msg.role !== 'user' && (
                            <div className="me-2 d-flex align-items-end pb-1">
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px', fontSize: '0.8rem'}}>AI</div>
                            </div>
                        )}
                        <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                            {msg.text}
                        </div>
                        {msg.role === 'user' && (
                            <div className="ms-2 d-flex align-items-end pb-1">
                                <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px', fontSize: '0.8rem'}}>Me</div>
                            </div>
                        )}
                    </div>
                ))}
                
                {/* Typing Indicator */}
                {isProcessing && (
                    <div className="d-flex mb-3 justify-content-start">
                        <div className="me-2 d-flex align-items-end pb-1">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px', fontSize: '0.8rem'}}>AI</div>
                        </div>
                        <div className="chat-bubble chat-bubble-ai text-muted fst-italic">
                            Thinking...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Controls Area */}
            <Card className="border-0 shadow-sm bg-light mx-3">
                <Card.Body className="d-flex align-items-center justify-content-between py-2">
                    <div className="d-flex align-items-center flex-grow-1">
                        <div className="me-3" style={{ width: '100px' }}>
                            <AudioVisualizer isActive={isAiSpeaking || isListening || isProcessing} />
                        </div>
                        <div className="text-muted small">
                            {isAiSpeaking ? "AI is speaking..." : isProcessing ? "AI is thinking..." : isListening ? "Listening..." : "Waiting..."}
                            {isListening && (
                                <div className="mt-1 p-2 bg-white border rounded text-secondary" style={{minHeight: '40px'}}>
                                    <span className="fw-bold">{transcript}</span>
                                    <span className="text-muted fst-italic">{interimTranscript}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="d-flex gap-2 ms-3">
                        {!isListening ? (
                            <Button 
                                variant="primary"
                                onClick={handleStartListening}
                                disabled={isProcessing || !isConnected}
                                className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                                style={{ width: '50px', height: '50px' }}
                                title="Start Speaking"
                            >
                                🎙️
                            </Button>
                        ) : (
                            <Button 
                                variant="danger"
                                onClick={handleStopListening}
                                className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                                style={{ width: '50px', height: '50px' }}
                                title="Stop & Send"
                            >
                                ⏹️
                            </Button>
                        )}
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default InterviewSession;

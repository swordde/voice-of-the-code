import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import Editor from '@monaco-editor/react';
import { useWebSocket } from '../hooks/useWebSocket';
import AudioVisualizer from './AudioVisualizer';
import { endpoints } from '../config';

const InterviewSession = ({ type, difficulty, topic, onEndSession }) => {
    const [messages, setMessages] = useState([]);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [textInput, setTextInput] = useState('');
    const [code, setCode] = useState('// Write your code here...');
    const [showEditor, setShowEditor] = useState(type === 'technical' || type === 'dsa_practice');
    
    // Refs for real-time logic
    const transcriptRef = useRef('');
    const silenceTimer = useRef(null);
    const stopListeningRef = useRef(null);
    const messagesEndRef = useRef(null);
    
    // Use a random client ID for now, persisted across renders
    const [clientId] = useState(Math.floor(Math.random() * 1000));
    const { isConnected, lastMessage, sendMessage } = useWebSocket(endpoints.wsInterview(clientId, type, difficulty, topic));
    
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

                // Reconstruct the transcript from scratch to avoid duplication issues
                let fullTranscript = '';
                let currentInterim = '';

                for (let i = 0; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        fullTranscript += event.results[i][0].transcript;
                    } else {
                        currentInterim += event.results[i][0].transcript;
                    }
                }

                setTranscript(fullTranscript);
                transcriptRef.current = fullTranscript; // Sync ref
                setInterimTranscript(currentInterim);

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
                    // Update the last message if it's a live user transcript to prevent stacking
                    setMessages((prev) => {
                        const lastMsg = prev[prev.length - 1];
                        if (lastMsg && lastMsg.sender === 'User (Live)') {
                            const newMessages = [...prev];
                            newMessages[newMessages.length - 1] = { ...lastMsg, text: data.text };
                            return newMessages;
                        }
                        return [...prev, { sender: 'User (Live)', text: data.text, role: 'user' }];
                    });
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

    const handleTextSubmit = (e) => {
        e.preventDefault();
        if (!textInput.trim()) return;

        setIsProcessing(true);
        setMessages(prev => [...prev, { sender: 'User', text: textInput, role: 'user' }]);
        sendMessage(JSON.stringify({ type: "submit_answer", text: textInput }));
        setTextInput('');
    };

    const handleCodeSubmit = () => {
        if (!code.trim() || code === '// Write your code here...') return;

        setIsProcessing(true);
        const codeMessage = `I have submitted the following code:\n\`\`\`javascript\n${code}\n\`\`\``;
        setMessages(prev => [...prev, { sender: 'User', text: codeMessage, role: 'user' }]);
        sendMessage(JSON.stringify({ type: "submit_code", text: code, language: "javascript" }));
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
            <div className="d-flex justify-content-between align-items-center mb-4 px-4">
                <div>
                    <h4 className="mb-1 fw-bold text-gradient">
                        {type === 'dsa_practice' ? 'DSA Practice Mode' : 
                         type === 'hr' ? 'HR Interview' : 
                         type === 'managerial' ? 'Managerial Round' : 
                         type === 'system_design' ? 'System Design' : 
                         'Technical Interview'}
                    </h4>
                    <div className="d-flex align-items-center gap-2">
                        <span className={`badge rounded-pill ${isConnected ? 'bg-success' : 'bg-danger'} bg-opacity-25 text-${isConnected ? 'success' : 'danger'} border border-${isConnected ? 'success' : 'danger'}`}>
                            {isConnected ? '● Live' : '○ Offline'}
                        </span>
                        <small className="text-muted">Session #{clientId}</small>
                    </div>
                </div>
                <Button variant="outline-danger" size="sm" onClick={handleEndInterview} className="rounded-pill px-4 py-2 fw-bold border-2">
                    {type === 'dsa_practice' ? 'End Practice' : 'End Session'}
                </Button>
            </div>

            <Row className="flex-grow-1 overflow-hidden px-4 mb-4">
                {/* Chat Area */}
                <Col md={showEditor ? 5 : 12} className="h-100 d-flex flex-column">
                    <div className="flex-grow-1 overflow-auto mb-3" style={{ scrollBehavior: 'smooth' }}>
                        {messages.length === 0 && (
                            <div className="text-center text-muted mt-5">
                                {type === 'dsa_practice' ? (
                                    <>
                                        <div className="display-1 mb-4 opacity-50">🧩</div>
                                        <h3 className="fw-bold text-primary mb-2">Generating Problem...</h3>
                                        <p className="lead text-secondary">Your coding challenge is being prepared.</p>
                                        <div className="spinner-border text-primary mt-3" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="display-1 mb-4 opacity-50">👋</div>
                                        <h3 className="fw-bold text-primary mb-2">Ready to start?</h3>
                                        <p className="lead text-secondary">Say "Hello" to begin your interview session.</p>
                                    </>
                                )}
                            </div>
                        )}
                        
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`d-flex mb-4 ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                                {msg.role !== 'user' && (
                                    <div className="me-3 d-flex align-items-end pb-2">
                                        <div className="bg-primary bg-gradient text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{width: '36px', height: '36px', fontSize: '0.9rem'}}>AI</div>
                                    </div>
                                )}
                                <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`} style={{whiteSpace: 'pre-wrap'}}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        
                        {/* Typing Indicator */}
                        {isProcessing && (
                            <div className="d-flex mb-4 justify-content-start">
                                <div className="me-3 d-flex align-items-end pb-2">
                                    <div className="bg-primary bg-gradient text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{width: '36px', height: '36px', fontSize: '0.9rem'}}>AI</div>
                                </div>
                                <div className="chat-bubble chat-bubble-ai text-muted fst-italic d-flex align-items-center gap-2">
                                    <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                                    Thinking...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </Col>

                {/* Code Editor Area */}
                {showEditor && (
                    <Col md={7} className="h-100 d-flex flex-column">
                        <div className="glass-panel rounded-4 h-100 d-flex flex-column overflow-hidden border border-secondary border-opacity-25">
                            <div className="p-2 bg-dark bg-opacity-50 border-bottom border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
                                <span className="small fw-bold text-muted ms-2">JavaScript Editor</span>
                                <Button size="sm" variant="success" onClick={handleCodeSubmit} disabled={isProcessing}>
                                    Run & Submit Code ▶
                                </Button>
                            </div>
                            <div className="flex-grow-1">
                                <Editor
                                    height="100%"
                                    defaultLanguage="javascript"
                                    theme="vs-dark"
                                    value={code}
                                    onChange={(value) => setCode(value)}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        padding: { top: 16 },
                                    }}
                                />
                            </div>
                        </div>
                    </Col>
                )}
            </Row>

            {/* Controls Area */}
            <div className="px-4 pb-2">
                <div className="glass-panel rounded-4 p-3">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="d-flex align-items-center flex-grow-1 gap-4">
                            <div style={{ width: '120px' }}>
                                <AudioVisualizer isActive={isAiSpeaking || isListening || isProcessing} />
                            </div>
                            <div className="text-muted small flex-grow-1">
                                <div className="fw-bold text-uppercase mb-1" style={{fontSize: '0.7rem', letterSpacing: '1px'}}>
                                    {isAiSpeaking ? "AI Speaking" : isProcessing ? "Processing" : isListening ? "Listening" : "Standby"}
                                </div>
                                {isListening ? (
                                    <div className="text-primary fw-medium">
                                        {transcript || <span className="opacity-50">Listening...</span>}
                                        <span className="text-muted opacity-50 ms-1">{interimTranscript}</span>
                                    </div>
                                ) : (
                                    <div className="opacity-50">Waiting for input...</div>
                                )}
                            </div>
                        </div>
                        
                        <div className="d-flex gap-3 ms-3">
                            {!isListening ? (
                                <Button 
                                    variant="primary"
                                    onClick={handleStartListening}
                                    disabled={isProcessing || !isConnected}
                                    className="rounded-circle d-flex align-items-center justify-content-center shadow-lg hover-scale"
                                    style={{ width: '50px', height: '50px', fontSize: '1.2rem' }}
                                    title="Start Speaking"
                                >
                                    🎙️
                                </Button>
                            ) : (
                                <Button 
                                    variant="danger"
                                    onClick={handleStopListening}
                                    className="rounded-circle d-flex align-items-center justify-content-center shadow-lg hover-scale"
                                    style={{ width: '50px', height: '50px', fontSize: '1.2rem' }}
                                    title="Stop & Send"
                                >
                                    ⏹️
                                </Button>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleTextSubmit} className="d-flex gap-2">
                        <input
                            type="text"
                            className="form-control bg-dark text-light border-secondary"
                            placeholder="Type your answer here..."
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            disabled={isListening || isProcessing}
                        />
                        <Button 
                            type="submit" 
                            variant="outline-primary" 
                            disabled={!textInput.trim() || isListening || isProcessing}
                        >
                            Send
                        </Button>
                    </form>
                </div>
            </div>
        </Container>
    );
};

export default InterviewSession;

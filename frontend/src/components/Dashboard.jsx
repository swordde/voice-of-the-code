import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import MicCheckModal from './MicCheckModal';
import { API_URL } from '../config';

const interviewTypes = [
    {
        id: 'technical',
        title: 'Technical / Coding',
        desc: 'Data Structures, Algorithms, and Language specifics.',
        icon: '💻',
        color: 'primary'
    },
    {
        id: 'hr',
        title: 'HR & Behavioral',
        desc: 'Soft skills, strengths/weaknesses, and cultural fit.',
        icon: '🤝',
        color: 'success'
    },
    {
        id: 'system_design',
        title: 'System Design',
        desc: 'Architecture, scalability, and database design.',
        icon: '🏗️',
        color: 'warning'
    },
    {
        id: 'managerial',
        title: 'Managerial Round',
        desc: 'Leadership style, conflict resolution, and team management.',
        icon: '📊',
        color: 'info'
    }
];

const Dashboard = ({ onStartInterview }) => {
    const [user, setUser] = useState(null);
    const [showMicCheck, setShowMicCheck] = useState(false);
    const [selectedType, setSelectedType] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const response = await fetch(`${API_URL}/users/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                } else if (response.status === 401) {
                    // Token expired or invalid
                    localStorage.removeItem('token');
                    window.location.reload();
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };
        fetchUser();
    }, []);

    const handleCardClick = (type) => {
        setSelectedType(type);
        setShowMicCheck(true);
    };

    const handleConfirmStart = () => {
        setShowMicCheck(false);
        if (selectedType) {
            onStartInterview(selectedType);
        }
    };

    return (
        <Container className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold text-white mb-1">Welcome back, <span className="text-gradient">{user ? user.username : 'Candidate'}</span>! 👋</h2>
                    <p className="text-muted lead">Ready to ace your next interview?</p>
                </div>
                {user && (
                    <div className="glass-panel px-4 py-3 rounded-4 d-flex align-items-center gap-3">
                        <div className="display-6">🔥</div>
                        <div>
                            <h3 className="mb-0 fw-bold text-white">{user.streak || 0}</h3>
                            <small className="text-muted fw-bold text-uppercase" style={{fontSize: '0.7rem', letterSpacing: '1px'}}>Day Streak</small>
                        </div>
                    </div>
                )}
            </div>
            
            <h5 className="mb-4 text-white fw-bold text-uppercase opacity-75" style={{letterSpacing: '1px'}}>Select Interview Type</h5>
            <Row>
                {interviewTypes.map((type) => (
                    <Col md={6} lg={3} key={type.id} className="mb-4">
                        <div 
                            className="glass-panel h-100 p-4 rounded-4 hover-scale cursor-pointer d-flex flex-column"
                            onClick={() => handleCardClick(type.id)}
                            style={{cursor: 'pointer', transition: 'all 0.3s ease'}}
                        >
                            <div className={`mb-4 p-3 rounded-circle bg-${type.color} bg-opacity-10 d-inline-flex align-items-center justify-content-center mx-auto`} style={{width: '80px', height: '80px'}}>
                                <span className="display-5">{type.icon}</span>
                            </div>
                            <div className="text-center flex-grow-1">
                                <h5 className="fw-bold text-white mb-2">{type.title}</h5>
                                <p className="text-muted small mb-4">
                                    {type.desc}
                                </p>
                            </div>
                            <Button 
                                variant={`outline-${type.color}`} 
                                className="w-100 mt-auto rounded-pill fw-bold border-2"
                            >
                                Start Session
                            </Button>
                        </div>
                    </Col>
                ))}
            </Row>

            <MicCheckModal 
                show={showMicCheck} 
                onHide={() => setShowMicCheck(false)} 
                onStart={handleConfirmStart} 
            />
        </Container>
    );
};

export default Dashboard;

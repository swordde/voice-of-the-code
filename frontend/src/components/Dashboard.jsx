import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import MicCheckModal from './MicCheckModal';

const interviewTypes = [
    {
        id: 'technical',
        title: 'Technical / Coding',
        desc: 'Data Structures, Algorithms, and Language specifics.',
        icon: '💻'
    },
    {
        id: 'hr',
        title: 'HR & Behavioral',
        desc: 'Soft skills, strengths/weaknesses, and cultural fit.',
        icon: '🤝'
    },
    {
        id: 'system_design',
        title: 'System Design',
        desc: 'Architecture, scalability, and database design.',
        icon: '🏗️'
    },
    {
        id: 'managerial',
        title: 'Managerial Round',
        desc: 'Leadership style, conflict resolution, and team management.',
        icon: '📊'
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
                const response = await fetch('http://127.0.0.1:8000/users/me', {
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
                    <h2 className="fw-bold text-primary">Welcome back, {user ? user.username : 'Candidate'}! 👋</h2>
                    <p className="text-muted lead">Ready to ace your next interview?</p>
                </div>
                {user && (
                    <Card className="border-0 shadow-sm bg-white">
                        <Card.Body className="text-center py-2 px-4">
                            <h3 className="mb-0 text-warning">🔥 {user.streak}</h3>
                            <small className="text-muted fw-bold text-uppercase" style={{fontSize: '0.7rem'}}>Day Streak</small>
                        </Card.Body>
                    </Card>
                )}
            </div>
            
            <h4 className="mb-4 text-secondary fw-bold">Select Interview Type</h4>
            <Row>
                {interviewTypes.map((type) => (
                    <Col md={6} lg={3} key={type.id} className="mb-4">
                        <Card 
                            className="h-100 shadow-sm hover-effect border-0" 
                            onClick={() => handleCardClick(type.id)}
                        >
                            <Card.Body className="text-center d-flex flex-column">
                                <div className="display-4 mb-3 p-3 rounded-circle bg-light mx-auto" style={{width: '100px', height: '100px', lineHeight: '1.5'}}>{type.icon}</div>
                                <Card.Title className="fw-bold mb-2">{type.title}</Card.Title>
                                <Card.Text className="text-muted small mb-4 flex-grow-1">
                                    {type.desc}
                                </Card.Text>
                                <Button 
                                    variant="outline-primary" 
                                    className="w-100 mt-auto rounded-pill"
                                >
                                    Start Session
                                </Button>
                            </Card.Body>
                        </Card>
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

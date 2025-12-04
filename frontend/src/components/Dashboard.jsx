import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import MicCheckModal from './MicCheckModal';
import { API_URL, endpoints } from '../config';

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
    },
    {
        id: 'dsa_practice',
        title: 'DSA Practice',
        desc: 'Focus purely on Data Structures & Algorithms problems.',
        icon: '🧩',
        color: 'danger'
    }
];

const Dashboard = ({ onStartInterview }) => {
    const [user, setUser] = useState(null);
    const [reports, setReports] = useState([]);
    const [showMicCheck, setShowMicCheck] = useState(false);
    const [selectedType, setSelectedType] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                // Fetch User
                const userRes = await fetch(`${API_URL}/users/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser(userData);
                } else if (userRes.status === 401) {
                    localStorage.removeItem('token');
                    window.location.reload();
                    return;
                }

                // Fetch Reports
                const reportsRes = await fetch(endpoints.reports, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (reportsRes.ok) {
                    const reportsData = await reportsRes.json();
                    // Process reports for chart
                    const processed = reportsData.map((r, i) => ({
                        name: `Session ${i + 1}`,
                        date: new Date(r.timestamp).toLocaleDateString(),
                        score: Math.round((r.scores.technical + r.scores.communication + r.scores.confidence) / 3),
                        technical: r.scores.technical,
                        communication: r.scores.communication,
                        confidence: r.scores.confidence
                    })).reverse(); // Show oldest to newest
                    setReports(processed);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const handleCardClick = (type) => {
        setSelectedType(type);
        setShowMicCheck(true);
    };

    const handleConfirmStart = (difficulty) => {
        setShowMicCheck(false);
        if (selectedType) {
            onStartInterview(selectedType, difficulty);
        }
    };

    return (
        <Container className="mt-5 pb-5">
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
            <Row className="mb-5">
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

            {/* Analytics Section */}
            {reports.length > 0 && (
                <>
                    <h5 className="mb-4 text-white fw-bold text-uppercase opacity-75" style={{letterSpacing: '1px'}}>Performance Analytics</h5>
                    <Row>
                        <Col lg={8} className="mb-4">
                            <div className="glass-panel p-4 rounded-4 h-100">
                                <h6 className="text-white fw-bold mb-4">Score Progression</h6>
                                <div style={{ height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={reports}>
                                            <defs>
                                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                            <XAxis 
                                                dataKey="name" 
                                                stroke="rgba(255,255,255,0.5)" 
                                                tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis 
                                                stroke="rgba(255,255,255,0.5)" 
                                                tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}}
                                                tickLine={false}
                                                axisLine={false}
                                                domain={[0, 100]}
                                            />
                                            <Tooltip 
                                                contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff'}}
                                                itemStyle={{color: '#fff'}}
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="score" 
                                                stroke="#6366f1" 
                                                strokeWidth={3}
                                                fillOpacity={1} 
                                                fill="url(#colorScore)" 
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </Col>
                        <Col lg={4} className="mb-4">
                            <div className="glass-panel p-4 rounded-4 h-100">
                                <h6 className="text-white fw-bold mb-4">Recent Feedback</h6>
                                <div className="d-flex flex-column gap-3">
                                    {reports.slice().reverse().slice(0, 3).map((report, idx) => (
                                        <div key={idx} className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25">
                                                    {report.date}
                                                </span>
                                                <span className={`fw-bold ${report.score >= 80 ? 'text-success' : report.score >= 60 ? 'text-warning' : 'text-danger'}`}>
                                                    {report.score}%
                                                </span>
                                            </div>
                                            <div className="d-flex justify-content-between small text-muted">
                                                <span>Tech: {report.technical}</span>
                                                <span>Comm: {report.communication}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </>
            )}

            <MicCheckModal 
                show={showMicCheck} 
                onHide={() => setShowMicCheck(false)} 
                onStart={handleConfirmStart} 
            />
        </Container>
    );
};

export default Dashboard;

import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const practiceTopics = [
    { id: 'python_dsa', title: 'Python DSA', desc: 'Arrays, Lists, Trees in Python', icon: '🐍' },
    { id: 'js_basics', title: 'JavaScript Logic', desc: 'Async/Await, Closures, ES6', icon: '📜' },
    { id: 'sql_practice', title: 'SQL Queries', desc: 'Joins, Aggregations, Normalization', icon: '🗄️' },
    { id: 'java_oop', title: 'Java OOP', desc: 'Classes, Inheritance, Polymorphism', icon: '☕' },
];

const PracticeHub = ({ onStartPractice }) => {
    return (
        <Container className="py-4">
            <div className="mb-5">
                <h2 className="text-white fw-bold mb-2">Coding Practice Arena ⚔️</h2>
                <p className="text-muted lead">Sharpen your coding skills with focused, AI-guided practice sessions.</p>
            </div>
            <Row>
                {practiceTopics.map(topic => (
                    <Col md={6} lg={3} key={topic.id} className="mb-4">
                        <div 
                            className="glass-panel h-100 rounded-4 p-4 text-center hover-effect cursor-pointer d-flex flex-column align-items-center justify-content-center"
                            onClick={() => onStartPractice(topic.id)}
                            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                        >
                            <div className="display-4 mb-3">{topic.icon}</div>
                            <h4 className="fw-bold text-white mb-2">{topic.title}</h4>
                            <p className="text-muted small mb-4">{topic.desc}</p>
                            <Button variant="primary" className="rounded-pill px-4 w-100 fw-bold">
                                Start
                            </Button>
                        </div>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default PracticeHub;

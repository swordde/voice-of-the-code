import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Form, InputGroup } from 'react-bootstrap';

const resources = [
    {
        id: 1,
        title: "System Design Primer",
        category: "System Design",
        type: "Article",
        url: "https://github.com/donnemartin/system-design-primer",
        desc: "The ultimate guide to scalable system design."
    },
    {
        id: 2,
        title: "Behavioral Interview Questions (STAR Method)",
        category: "Behavioral",
        type: "Video",
        url: "https://www.youtube.com/watch?v=t4O1h29-g80",
        desc: "How to answer 'Tell me about a time you failed' using STAR."
    },
    {
        id: 3,
        title: "Blind 75 LeetCode Questions",
        category: "Technical",
        type: "Practice",
        url: "https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions",
        desc: "The most common coding interview questions."
    },
    {
        id: 4,
        title: "Grokking the System Design Interview",
        category: "System Design",
        type: "Course",
        url: "https://www.educative.io/courses/grokking-the-system-design-interview",
        desc: "A paid but highly recommended course for design interviews."
    },
    {
        id: 5,
        title: "Python Data Structures",
        category: "Technical",
        type: "Article",
        url: "https://realpython.com/python-data-structures/",
        desc: "Deep dive into lists, dictionaries, sets, and tuples."
    },
    {
        id: 6,
        title: "Negotiating Your Salary",
        category: "Career",
        type: "Article",
        url: "https://www.kalzumeus.com/2012/01/23/salary-negotiation/",
        desc: "Don't leave money on the table. Learn to negotiate."
    }
];

const LearningSpace = ({ onBack }) => {
    const [filter, setFilter] = useState('');
    const [category, setCategory] = useState('All');

    const filteredResources = resources.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(filter.toLowerCase());
        const matchesCategory = category === 'All' || r.category === category;
        return matchesSearch && matchesCategory;
    });

    const categories = ['All', ...new Set(resources.map(r => r.category))];

    return (
        <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Learning Space 📚</h2>
                <button className="btn btn-outline-secondary" onClick={onBack}>Back to Dashboard</button>
            </div>

            <Row className="mb-4">
                <Col md={8}>
                    <InputGroup>
                        <InputGroup.Text>🔍</InputGroup.Text>
                        <Form.Control 
                            placeholder="Search resources..." 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col md={4}>
                    <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </Form.Select>
                </Col>
            </Row>

            <Row className="g-4">
                {filteredResources.map(resource => (
                    <Col md={6} lg={4} key={resource.id}>
                        <Card className="h-100 shadow-sm">
                            <Card.Body>
                                <div className="d-flex justify-content-between mb-2">
                                    <Badge bg="info">{resource.category}</Badge>
                                    <Badge bg="secondary">{resource.type}</Badge>
                                </div>
                                <Card.Title>{resource.title}</Card.Title>
                                <Card.Text className="text-muted small">
                                    {resource.desc}
                                </Card.Text>
                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm w-100 mt-2">
                                    View Resource ↗
                                </a>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default LearningSpace;

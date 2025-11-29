import React from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Badge } from 'react-bootstrap';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const ReportView = ({ report, onBack }) => {
    if (!report) return <div>Loading report...</div>;

    const data = [
        { subject: 'Technical', A: report.technical_score, fullMark: 100 },
        { subject: 'Communication', A: report.communication_score, fullMark: 100 },
        { subject: 'Confidence', A: report.confidence_score, fullMark: 100 },
    ];

    return (
        <Container className="mt-5 pb-5">
            <div className="d-flex align-items-center mb-4">
                <Button variant="link" className="text-decoration-none p-0 me-3 text-secondary" onClick={onBack}>
                    <span className="h4 mb-0">&larr;</span>
                </Button>
                <h2 className="mb-0 fw-bold text-primary">Interview Performance Report</h2>
            </div>
            
            <Row className="g-4">
                <Col md={6}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
                            <h5 className="fw-bold text-secondary mb-0">Score Analysis</h5>
                        </Card.Header>
                        <Card.Body style={{ height: '350px' }} className="px-4 pb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar 
                                        name="User" 
                                        dataKey="A" 
                                        stroke="#4F46E5" 
                                        fill="#4F46E5" 
                                        fillOpacity={0.3} 
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
                
                <Col md={6}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
                            <h5 className="fw-bold text-secondary mb-0">AI Feedback</h5>
                        </Card.Header>
                        <Card.Body className="px-4 pb-4">
                            <div className="p-3 bg-light rounded mb-4 border-start border-4 border-primary">
                                <Card.Text className="fst-italic mb-0 text-dark">"{report.feedback}"</Card.Text>
                            </div>
                            
                            <div className="d-flex align-items-center justify-content-between mb-4 p-3 border rounded">
                                <div>
                                    <strong className="text-secondary">Filler Words Detected</strong>
                                    {report.filler_word_count > 0 && (
                                        <div className="small text-muted mt-1">
                                            Most used: {Object.entries(report.filler_details || {})
                                                .sort(([,a], [,b]) => b - a)
                                                .slice(0, 3)
                                                .map(([word, count]) => `${word} (${count})`)
                                                .join(", ")}
                                        </div>
                                    )}
                                </div>
                                <span className={`h2 mb-0 fw-bold ${report.filler_word_count > 5 ? "text-danger" : "text-success"}`}>
                                    {report.filler_word_count}
                                </span>
                            </div>

                            <Row>
                                <Col sm={6}>
                                    <h6 className="fw-bold text-success mb-3">Strengths 💪</h6>
                                    <ListGroup variant="flush" className="mb-3">
                                        {report.strengths?.map((item, idx) => (
                                            <ListGroup.Item key={idx} className="border-0 px-0 py-1 d-flex align-items-start">
                                                <span className="text-success me-2">✓</span>
                                                <span className="small">{item}</span>
                                            </ListGroup.Item>
                                        )) || <span className="text-muted small">No strengths listed.</span>}
                                    </ListGroup>
                                </Col>
                                <Col sm={6}>
                                    <h6 className="fw-bold text-warning mb-3">Improvements 📈</h6>
                                    <ListGroup variant="flush">
                                        {report.improvements?.map((item, idx) => (
                                            <ListGroup.Item key={idx} className="border-0 px-0 py-1 d-flex align-items-start">
                                                <span className="text-warning me-2">⚠</span>
                                                <span className="small">{item}</span>
                                            </ListGroup.Item>
                                        )) || <span className="text-muted small">No improvements listed.</span>}
                                    </ListGroup>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
                            <h5 className="fw-bold text-secondary mb-0">Keyword Analysis 🔑</h5>
                        </Card.Header>
                        <Card.Body className="px-4 pb-4">
                            <Row>
                                <Col md={6} className="mb-3 mb-md-0">
                                    <h6 className="text-success fw-bold mb-3">Keywords Mentioned</h6>
                                    <div>
                                        {report.keywords_mentioned && report.keywords_mentioned.length > 0 ? (
                                            report.keywords_mentioned.map((kw, idx) => (
                                                <Badge bg="success" className="me-2 mb-2 py-2 px-3 rounded-pill fw-normal" key={idx}>{kw}</Badge>
                                            ))
                                        ) : (
                                            <span className="text-muted small">No specific keywords detected.</span>
                                        )}
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <h6 className="text-secondary fw-bold mb-3">Keywords Missed</h6>
                                    <div>
                                        {report.keywords_missed && report.keywords_missed.length > 0 ? (
                                            report.keywords_missed.map((kw, idx) => (
                                                <Badge bg="light" text="dark" className="me-2 mb-2 py-2 px-3 rounded-pill fw-normal border" key={idx}>{kw}</Badge>
                                            ))
                                        ) : (
                                            <span className="text-muted small">Great job! You covered key concepts.</span>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ReportView;

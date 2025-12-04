import React from 'react';
import { Container, Row, Col, ListGroup, Badge, Button } from 'react-bootstrap';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const ReportView = ({ report, onBack }) => {
    if (!report) return <div className="text-white">Loading report...</div>;

    const getScore = (key) => {
        // Handle both flat (from grading service) and nested (from DB) formats
        if (report.scores && report.scores[key] !== undefined) {
            return report.scores[key];
        }
        return report[`${key}_score`] || 0;
    };

    const data = [
        { subject: 'Technical', A: getScore('technical'), fullMark: 100 },
        { subject: 'Communication', A: getScore('communication'), fullMark: 100 },
        { subject: 'Confidence', A: getScore('confidence'), fullMark: 100 },
    ];

    return (
        <Container className="mt-5 pb-5">
            <div className="d-flex align-items-center mb-4">
                <Button variant="link" className="text-decoration-none p-0 me-3 text-white" onClick={onBack}>
                    <span className="h4 mb-0">&larr;</span>
                </Button>
                <h2 className="mb-0 fw-bold text-white">Interview Performance Report</h2>
            </div>
            
            <Row className="g-4">
                <Col md={6}>
                    <div className="glass-panel h-100 rounded-4">
                        <div className="p-4 border-bottom border-secondary border-opacity-25">
                            <h5 className="fw-bold text-white mb-0">Score Analysis</h5>
                        </div>
                        <div style={{ height: '350px' }} className="p-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                                    <PolarGrid stroke="#4b5563" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar 
                                        name="User" 
                                        dataKey="A" 
                                        stroke="#6366f1" 
                                        fill="#6366f1" 
                                        fillOpacity={0.5} 
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Col>
                
                <Col md={6}>
                    <div className="glass-panel h-100 rounded-4">
                        <div className="p-4 border-bottom border-secondary border-opacity-25">
                            <h5 className="fw-bold text-white mb-0">AI Feedback</h5>
                        </div>
                        <div className="p-4">
                            <div className="p-3 bg-white bg-opacity-10 rounded mb-4 border-start border-4 border-primary">
                                <p className="fst-italic mb-0 text-white">"{report.feedback}"</p>
                            </div>
                            
                            <div className="d-flex align-items-center justify-content-between mb-4 p-3 border border-secondary border-opacity-25 rounded bg-dark bg-opacity-25">
                                <div>
                                    <strong className="text-white">Filler Words Detected</strong>
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
                                            <ListGroup.Item key={idx} className="bg-transparent border-0 px-0 py-1 d-flex align-items-start text-white">
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
                                            <ListGroup.Item key={idx} className="bg-transparent border-0 px-0 py-1 d-flex align-items-start text-white">
                                                <span className="text-warning me-2">⚠</span>
                                                <span className="small">{item}</span>
                                            </ListGroup.Item>
                                        )) || <span className="text-muted small">No improvements listed.</span>}
                                    </ListGroup>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col>
                    <div className="glass-panel rounded-4">
                        <div className="p-4 border-bottom border-secondary border-opacity-25">
                            <h5 className="fw-bold text-white mb-0">Keyword Analysis 🔑</h5>
                        </div>
                        <div className="p-4">
                            <Row>
                                <Col md={6} className="mb-3 mb-md-0">
                                    <h6 className="text-success fw-bold mb-3">Keywords Mentioned</h6>
                                    <div>
                                        {report.keywords_mentioned && report.keywords_mentioned.length > 0 ? (
                                            report.keywords_mentioned.map((kw, idx) => (
                                                <Badge bg="success" className="me-2 mb-2 py-2 px-3 rounded-pill fw-normal bg-opacity-75" key={idx}>{kw}</Badge>
                                            ))
                                        ) : (
                                            <span className="text-muted small">No specific keywords detected.</span>
                                        )}
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <h6 className="text-white fw-bold mb-3">Keywords Missed</h6>
                                    <div>
                                        {report.keywords_missed && report.keywords_missed.length > 0 ? (
                                            report.keywords_missed.map((kw, idx) => (
                                                <Badge bg="secondary" className="me-2 mb-2 py-2 px-3 rounded-pill fw-normal bg-opacity-50 border border-secondary" key={idx}>{kw}</Badge>
                                            ))
                                        ) : (
                                            <span className="text-muted small">Great job! You covered key concepts.</span>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default ReportView;

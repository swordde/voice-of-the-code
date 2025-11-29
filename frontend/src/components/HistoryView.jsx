import React, { useEffect, useState } from 'react';
import { Card, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { endpoints } from '../config';

const HistoryView = ({ onBack }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(endpoints.reports, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch reports');
            }
            const data = await response.json();
            setReports(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleDateString() + ' ' + new Date(isoString).toLocaleTimeString();
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'success';
        if (score >= 60) return 'warning';
        return 'danger';
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger">
                Error loading history: {error}
            </Alert>
        );
    }

    return (
        <div className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <Button variant="link" className="text-decoration-none p-0 me-3 text-secondary" onClick={onBack}>
                        <span className="h4 mb-0">&larr;</span>
                    </Button>
                    <h2 className="mb-0 fw-bold text-primary">Interview History</h2>
                </div>
            </div>

            {reports.length === 0 ? (
                <div className="text-center py-5 bg-light rounded">
                    <div className="display-1 mb-3">📜</div>
                    <h4 className="text-muted">No interviews yet</h4>
                    <p className="text-secondary">Start practicing to build your history!</p>
                </div>
            ) : (
                <Card className="shadow-sm border-0 overflow-hidden">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="py-3 ps-4 border-0 text-secondary text-uppercase small fw-bold">Date</th>
                                <th className="py-3 border-0 text-secondary text-uppercase small fw-bold">Type</th>
                                <th className="py-3 border-0 text-secondary text-uppercase small fw-bold">Technical</th>
                                <th className="py-3 border-0 text-secondary text-uppercase small fw-bold">Communication</th>
                                <th className="py-3 border-0 text-secondary text-uppercase small fw-bold">Confidence</th>
                                <th className="py-3 pe-4 border-0 text-secondary text-uppercase small fw-bold">Fillers</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report) => (
                                <tr key={report._id} className="border-bottom">
                                    <td className="ps-4 py-3 text-muted fw-medium">{formatDate(report.timestamp)}</td>
                                    <td className="py-3">
                                        <Badge bg="light" text="primary" className="text-capitalize border border-primary fw-normal px-3 py-2 rounded-pill">
                                            {report.type}
                                        </Badge>
                                    </td>
                                    <td className="py-3">
                                        <div className="d-flex align-items-center">
                                            <div className={`rounded-circle me-2 bg-${getScoreColor(report.scores.technical)}`} style={{width: '8px', height: '8px'}}></div>
                                            <span className="fw-bold">{report.scores.technical}%</span>
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <div className="d-flex align-items-center">
                                            <div className={`rounded-circle me-2 bg-${getScoreColor(report.scores.communication)}`} style={{width: '8px', height: '8px'}}></div>
                                            <span className="fw-bold">{report.scores.communication}%</span>
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <div className="d-flex align-items-center">
                                            <div className={`rounded-circle me-2 bg-${getScoreColor(report.scores.confidence)}`} style={{width: '8px', height: '8px'}}></div>
                                            <span className="fw-bold">{report.scores.confidence}%</span>
                                        </div>
                                    </td>
                                    <td className="pe-4 py-3 text-muted">{report.filler_word_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>
            )}
        </div>
    );
};

export default HistoryView;

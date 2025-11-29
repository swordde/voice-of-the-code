import React, { useState } from 'react';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';
import { endpoints } from '../config';

const Login = ({ onLogin, onSwitchToSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(endpoints.login, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Login failed');
            }

            onLogin(data.access_token);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <Card style={{ width: '400px' }} className="shadow-lg border-0 rounded-3">
                <Card.Body className="p-5">
                    <div className="text-center mb-4">
                        <div className="display-4 mb-2">👋</div>
                        <h2 className="fw-bold text-primary">Welcome Back</h2>
                        <p className="text-muted">Please enter your details to sign in.</p>
                    </div>
                    
                    {error && <Alert variant="danger" className="small">{error}</Alert>}
                    
                    <Form onSubmit={handleSubmit}>
                        <Form.Group id="email" className="mb-3">
                            <Form.Label className="small fw-bold text-secondary">Email Address</Form.Label>
                            <Form.Control 
                                type="email" 
                                required 
                                value={email}
                                autoComplete="username"
                                onChange={(e) => setEmail(e.target.value)}
                                className="py-2"
                                placeholder="name@example.com"
                            />
                        </Form.Group>
                        <Form.Group id="password" className="mb-4">
                            <Form.Label className="small fw-bold text-secondary">Password</Form.Label>
                            <Form.Control 
                                type="password" 
                                required 
                                value={password}
                                autoComplete="current-password"
                                onChange={(e) => setPassword(e.target.value)}
                                className="py-2"
                                placeholder="••••••••"
                            />
                        </Form.Group>
                        <Button disabled={loading} className="w-100 py-2 fw-bold rounded-pill" type="submit" variant="primary">
                            {loading ? 'Logging in...' : 'Sign In'}
                        </Button>
                    </Form>
                    <div className="w-100 text-center mt-4 text-muted small">
                        Don't have an account? <span onClick={onSwitchToSignup} className="text-primary fw-bold" style={{cursor: 'pointer'}}>Sign Up</span>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Login;

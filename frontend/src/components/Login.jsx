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
            <div style={{ width: '400px' }} className="glass-panel p-5 rounded-4">
                <div className="text-center mb-4">
                    <div className="display-4 mb-2">👋</div>
                    <h2 className="fw-bold text-white">Welcome Back</h2>
                    <p className="text-muted">Please enter your details to sign in.</p>
                </div>
                
                {error && <Alert variant="danger" className="small bg-danger bg-opacity-10 text-danger border-danger border-opacity-25">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                    <Form.Group id="email" className="mb-3">
                        <Form.Label className="small fw-bold text-muted text-uppercase" style={{fontSize: '0.7rem', letterSpacing: '1px'}}>Email Address</Form.Label>
                        <Form.Control 
                            type="email" 
                            required 
                            value={email}
                            autoComplete="username"
                            onChange={(e) => setEmail(e.target.value)}
                            className="py-2 bg-dark bg-opacity-50 border-secondary border-opacity-25 text-white"
                            placeholder="name@example.com"
                            style={{backdropFilter: 'blur(5px)'}}
                        />
                    </Form.Group>
                    <Form.Group id="password" className="mb-4">
                        <Form.Label className="small fw-bold text-muted text-uppercase" style={{fontSize: '0.7rem', letterSpacing: '1px'}}>Password</Form.Label>
                        <Form.Control 
                            type="password" 
                            required 
                            value={password}
                            autoComplete="current-password"
                            onChange={(e) => setPassword(e.target.value)}
                            className="py-2 bg-dark bg-opacity-50 border-secondary border-opacity-25 text-white"
                            placeholder="••••••••"
                            style={{backdropFilter: 'blur(5px)'}}
                        />
                    </Form.Group>
                    <Button disabled={loading} className="w-100 py-2 fw-bold rounded-pill shadow-lg" type="submit" variant="primary">
                        {loading ? 'Logging in...' : 'Sign In'}
                    </Button>
                </Form>
                <div className="w-100 text-center mt-4 text-muted small">
                    Don't have an account? <span onClick={onSwitchToSignup} className="text-primary fw-bold hover-scale d-inline-block" style={{cursor: 'pointer'}}>Sign Up</span>
                </div>
            </div>
        </Container>
    );
};

export default Login;

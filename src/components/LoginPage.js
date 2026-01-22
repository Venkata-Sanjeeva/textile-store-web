import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavbarComponent from './NavbarComponent';

const BACKEND_API_URL = process.env.REACT_APP_API_URL;

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Placeholder for navigation logic

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (token) {
            sessionStorage.removeItem('token');
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${BACKEND_API_URL}/auth/login`, credentials);
            // Save the token so the browser remembers the admin
            sessionStorage.setItem('token', JSON.stringify({
                role: "ADMIN",
                isAuthenticated: true,
                ...response.data
            }));
            navigate('/admin/dashboard'); // Send admin to the dashboard
        } catch (err) {
            setError('Invalid Username or Password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <NavbarComponent />
            <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
                <Card style={{ width: '400px' }} className="shadow p-4">
                    <Card.Body>
                        <h3 className="text-center mb-4">Admin Login</h3>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form onSubmit={handleLogin}>
                            <Form.Group className="mb-3">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                    required
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit" className="w-100">
                                {loading ? <>
                                    <Spinner animation="border" size="sm" /> &nbsp;
                                    Logging in...
                                </> : 'Login'}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </>
    );
};

export default LoginPage;
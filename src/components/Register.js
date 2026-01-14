import { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavbarComponent from './NavbarComponent';

const BACKEND_API_URL = process.env.REACT_APP_API_URL;

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        const body = {
            username: formData.email,
            password: formData.password,
        };

        try {
            const response = await axios.post(`${BACKEND_API_URL}/user/register`, body);
            
            // Save the token so the browser remembers the admin
            sessionStorage.setItem('token', JSON.stringify({
                role: "ADMIN",
                isAuthenticated: true,
                ...response.data
            }));

            alert("Admin Account Created! Redirecting to Dashboard...");
            navigate('/admin/dashboard');
        } catch (err) {
            console.error("API Error:", err);
            setError("Failed to register admin. Please try again.");
        }
    };

    return (
        <>
            <NavbarComponent />
            <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
                <Card style={{ width: '450px' }} className="shadow p-4">
                    <Card.Body>
                        <h3 className="text-center mb-4">Admin Registration</h3>
                        
                        {error && <Alert variant="danger">{error}</Alert>}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="fullName"
                                    placeholder="e.g. Alex Rivera"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Business Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    placeholder="admin@clothingstore.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>

                            <Button variant="primary" type="submit" className="w-100 mb-3">
                                Register Admin
                            </Button>

                            <div className="text-center">
                                <small>
                                    Already have an admin account? <a href="/login" style={{textDecoration: 'none'}}>Login</a>
                                </small>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </>
    );
};

export default Register;
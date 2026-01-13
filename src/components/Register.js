import React, { useState } from 'react';
import '../styles/Register.css';
import NavbarComponent from './NavbarComponent';
import axios from 'axios';

const BACKEND_API_URL = process.env.REACT_APP_API_URL;

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
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
            "username": formData.email,
            "password": formData.password,
        }

        axios.post(`${BACKEND_API_URL}/user/register`, body)
            .then(response => {
                // Simulating API call
                setTimeout(() => {
                    alert("Admin Account Created! Redirecting to Dashboard...");
                    sessionStorage.setItem('token', JSON.stringify({
                        role: "ADMIN",
                        isAuthenticated: true,
                        ...response.data
                    }));
                    window.location.href = "/admin/dashboard";
                }, 1000);
                console.log("API Response:", response.data);
            })
            .catch(error => {
                console.error("API Error:", error);
                setError("Failed to register admin. Please try again.");
            });
    };

    return (
        <>
            <NavbarComponent />
            <div className="register-container">
                <div className="register-card">

                    <form onSubmit={handleSubmit} className="register-form">

                        <div className="register-header">
                            <h2>Admin Registration</h2>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <div className="input-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="e.g. Alex Rivera"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Business Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="admin@clothingstore.com"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type="submit" className="register-btn">Register Admin</button>
                    </form>

                    <div className="register-footer">
                        <p>Already have an admin account? <a href="/login">Login</a></p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;
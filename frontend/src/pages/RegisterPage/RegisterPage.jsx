import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegisterPage.css';

const RegisterPage = () => {
    const [ten_hien_thi, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [mat_khau, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();
    const isLocalhost = window.location.hostname === "localhost";
    const API_BASE = isLocalhost
        ? process.env.REACT_APP_API_URL
        : process.env.REACT_APP_API_URL_LAN;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (mat_khau !== confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        try {
            const response = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ten_hien_thi, email, mat_khau }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Registration successful! Please log in.');
                navigate('/login');
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration.');
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h1 className="register-title">Create new account</h1>
                <form onSubmit={handleSubmit}>
                    
                    <input
                        id="ten_hien_thi"
                        type="text"
                        placeholder="Tên đăng nhập"
                        value={ten_hien_thi}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    
                    <input
                        id="email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                   
                    <input
                        id="mat_khau"
                        type="password"
                        placeholder="Mật khẩu"
                        value={mat_khau}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    
                    <input
                        id="confirmPassword"
                        type="password"
                        placeholder="Xác nhận mật khẩu"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="register-button">Register</button>
                </form>
                <div className="register-links">
                    <Link to="/login">Đã có tài khoản?</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
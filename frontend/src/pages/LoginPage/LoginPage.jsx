import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
    const [identifier, setIdentifier] = useState('');
    const [mat_khau, setPassword] = useState('');
    const navigate = useNavigate();
    const isLocalhost = window.location.hostname === "localhost";
    const API_BASE = isLocalhost
        ? process.env.REACT_APP_API_URL
        : process.env.REACT_APP_API_URL_LAN;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ identifier, mat_khau }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                navigate('/newsfeed')
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert(`An error occurred during login.${API_BASE}`);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="login-logo">ConnectF</h1>
                <form onSubmit={handleSubmit}>
                    
                    <input
                        type="text"
                        placeholder="Nhập email hoặc tên đăng nhập"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                    />

                    <input
                        id='mat_khau'
                        type="password"
                        placeholder="Mật khẩu"
                        value={mat_khau}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="login-button">Đăng nhập</button>
                </form>
                <div className="login-links">
                    <Link to="/forgot-password">Quên mật khẩu?</Link>
                    <Link to="/register">Chưa có tài khoản</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
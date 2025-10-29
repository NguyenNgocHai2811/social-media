import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

const LoginPage = () => {
    const [identifier, setIdentifier] = useState('');
    const [mat_khau, setPassword] = useState('');
    const navigate = useNavigate();
    
    // Re-add the logic to determine the correct API base URL
    const isLocalhost = window.location.hostname === "localhost";
    const API_BASE = isLocalhost
        ? process.env.REACT_APP_API_URL
        : process.env.REACT_APP_API_URL_LAN;
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Use the correct API_BASE for the axios call
            const response = await axios.post(`${API_BASE}/api/auth/login`, {
                identifier,
                mat_khau
            });

            if (response.data && response.data.token) {
                const { user, token } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('userId', user.ma_nguoi_dung); 
                navigate('/newsfeed');
            } else {
                alert(response.data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response ? error.response.data.message : `An error occurred during login. Check if the API server is running at ${API_BASE}.`;
            alert(errorMessage);
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

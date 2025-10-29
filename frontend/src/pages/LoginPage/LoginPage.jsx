import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';
import './LoginPage.css';

const LoginPage = () => {
    const [identifier, setIdentifier] = useState('');
    const [mat_khau, setPassword] = useState('');
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await authApi.login({ identifier, mat_khau });

            if (response && response.token) {
                const { user, token } = response;
                localStorage.setItem('token', token);
                localStorage.setItem('userId', user.ma_nguoi_dung); 
                navigate('/newsfeed');
            } else {
                alert(response.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response ? error.response.data.message : `An error occurred during login.`;
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

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

        // Validate Ten Dang Nhap
        if (!ten_hien_thi) {
            alert("Vui lòng nhập tên đăng nhập");
            return;
        }

        // Validate Email
        if (!email) {
            alert("Vui lòng nhập Email");
            return;
        }
        
        // Simple regex for email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Email không đúng định dạng");
            return;
        }

        // Validate Password
        if (!mat_khau) {
            alert("Vui lòng nhập Mật khẩu");
            return;
        }

        if (mat_khau.length < 6) {
            alert("Mật khẩu quá ngắn");
            return;
        }

        // Validate Confirm Password
        if (!confirmPassword) {
            alert("Vui lòng nhập lại mật khẩu");
            return;
        }

        if (mat_khau !== confirmPassword) {
            alert("Mật khẩu không khớp");
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
                alert('Tạo tài khoản thành công');
                navigate('/login');
            } else {
                // Check for duplicate user error
                if (data.message && (data.message.includes('already exists') || data.message.includes('tồn tại'))) {
                     alert('Email và Tên đăng nhập đã tồn tại');
                } else {
                    alert(data.message || 'Đăng ký thất bại');
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Đăng ký thất bại');
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h1 className="register-title">Create new account</h1>
                <form onSubmit={handleSubmit} noValidate>
                    
                    <input
                        id="ten_hien_thi"
                        type="text"
                        placeholder="Tên đăng nhập"
                        value={ten_hien_thi}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    
                    <input
                        id="email"
                        type="email" // Keeping type email helps mobile keyboards, but validation is manual now
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                   
                    <input
                        id="mat_khau"
                        type="password"
                        placeholder="Mật khẩu"
                        value={mat_khau}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    
                    <input
                        id="confirmPassword"
                        type="password"
                        placeholder="Xác nhận mật khẩu"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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

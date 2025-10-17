import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Header.css'; // Import the CSS file

const Header = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No token found');
                return;
            }

            try {
                const res = await axios.get('http://localhost:3001/api/users/me', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUser(res.data);
            } catch (err) {
                setError('Failed to fetch user data');
                console.error(err);
            }
        };

        fetchUser();
    }, []);

    if (error) {
        return <header className="header"><div>Error: {error}</div></header>;
    }

    if (!user) {
        return <header className="header"><div>Loading...</div></header>;
    }

    return (
        <header className="header">
            <div className="header-logo">
                ConnectF
            </div>
            <div className="header-search">
                <input type="text" placeholder="Search" />
            </div>
            <nav className="header-nav">
                {/* Placeholder for navigation icons */}
                <span className="nav-icon">⌂</span> {/* Home */}
                <span className="nav-icon">👥</span> {/* Friends */}
                <span className="nav-icon">🔔</span> {/* Notifications */}
                <div className="user-profile">
                    <img src={user.anh_dai_dien || 'default-avatar.png'} alt="avatar" className="user-avatar" />
                    <span>{user.ten_hien_thi}</span>
                </div>
            </nav>
        </header>
    );
};

export default Header;
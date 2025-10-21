import React, { useState, useEffect } from 'react';
import axios from 'axios';
import searchIcon from '../../assets/images/search.svg'
import './Header.css';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                // To allow for viewing the design without being logged in
                setUser({ ten_hien_thi: 'Guest', anh_dai_dien: 'https://via.placeholder.com/40' });
                return;
            }

            try {
                const res = await axios.get('http://localhost:3001/api/users/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(res.data);
            } catch (err) {
                setError('Failed to fetch user data');
                console.error(err);
                // Fallback user for UI design purposes
                setUser({ ten_hien_thi: 'Guest', anh_dai_dien: 'https://via.placeholder.com/40' });
            }
        };

        fetchUser();
    }, []);

    if (!user) {
        return <header className="header"><div>Loading...</div></header>;
    }

    return (
        <header className="header">
            <div className="header-left">
                <div className="header-logo">
                    ConnectF
                </div>
                <div className="header-search">
                    <img src={searchIcon} alt="Search Icon" className="search-icon" />
                    <input type="text" placeholder="Search" />
                </div>
            </div>
            
            <div className="header-right">
                <div className="header-nav">
                    <div className="nav-icon" title="Profile">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
                    </div>
                    <div className="nav-icon" title="Messages">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path></svg>
                    </div>
                    <div className="nav-icon" title="Notifications">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"></path></svg>
                    </div>
                </div>
                <div className="user-profile">
                    <img 
                        src={user.anh_dai_dien || 'https://via.placeholder.com/40'} 
                        alt="avatar" 
                        className="user-avatar" 
                    />
                    
                </div>
                 <div className="nav-icon" title="Logout" onClick={handleLogout}>
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"></path></svg>
                </div>
            </div>
        </header>
    );
};

export default Header;
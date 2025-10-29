import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import userApi from '../../api/userApi';
import searchIcon from '../../assets/images/search.svg';
import './Header.css';

// Icons
import notification from '../../assets/images/notification.svg';
import iconChat from '../../assets/images/comment.svg';
import userIcon from '../../assets/images/Vector.svg';
import defaultAvatar from '../../assets/images/default-avatar.jpg';

const Header = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const userData = await userApi.getMe();
                setUser(userData);
            } catch (err) {
                console.error('Failed to fetch user data:', err);
                // If the token is invalid or the API fails, log out the user
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                navigate('/login');
            }
        };

        fetchUser();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    if (!user) {
        return <header className="header"><div>Loading user...</div></header>;
    }

    return (
        <header className="header">
            <div className="header-left">
                <Link to="/newsfeed" className="header-logo">
                    ConnectF
                </Link>
                <div className="header-search">
                    <img src={searchIcon} alt="Search Icon" className="search-icon" />
                    <input type="text" placeholder="Search ConnectF" />
                </div>
            </div>

            <div className="header-right">
                <div className="header-nav">
                    <div className="nav-icon" title="Profile">
                        <img src={userIcon} alt="user" />
                    </div>
                    <div className="nav-icon" title="Messages">
                        <img src={iconChat} alt="chat" />
                    </div>
                    <div className="nav-icon" title="Notifications">
                        <img src={notification} alt="notification" />
                    </div>
                    <div className="nav-icon" title="Logout" onClick={handleLogout}>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"></path></svg>
                    </div>
                </div>
                <Link to={`/profile/${user.ma_nguoi_dung}`} className="user-profile">
                    <img
                        src={user.anh_dai_dien || defaultAvatar}
                        alt="avatar"
                        className="user-avatar"
                    />
                    <span className="user-name">{user.ten_hien_thi}</span>
                </Link>
            </div>
        </header>
    );
};

export default Header;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import searchIcon from '../../assets/images/search.svg';
import './Header.css';
import { useNavigate } from 'react-router-dom';
import EditProfileModal from '../EditProfileModal/EditProfileModal';

// icon for page
import notification from '../../assets/images/notification.svg'
import iconChat from '../../assets/images/comment.svg'
import userIcon from '../../assets/images/Vector.svg'



const Header = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleProfileUpdate = (updatedUser) => {
        setUser(updatedUser);
    };

    const showSuccessMessage = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000); // Hide after 3 seconds
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
        <>
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
                           <img src={userIcon} alt="user" />
                        </div>
                        <div className="nav-icon" title="Messages">
                            <img src={iconChat} alt="chat" />
                        </div>
                        <div className="nav-icon" title="Notifications">
                            <img src={notification} alt="notificatioh" />
                        </div>
                         <div className="nav-icon" title="Logout" onClick={handleLogout}>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"></path></svg>
                    </div>
                    </div>
                    <div className="user-profile" onClick={() => setIsEditModalOpen(true)}>
                        <img 
                            src={user.anh_dai_dien || 'https://via.placeholder.com/40'} 
                            alt="avatar" 
                            className="user-avatar" 
                        />
                        
                    </div>
                   
                </div>
            </header>
            {successMessage && <div className="success-notification">{successMessage}</div>}
            {isEditModalOpen && (
                <EditProfileModal 
                    user={user} 
                    onClose={() => setIsEditModalOpen(false)} 
                    onProfileUpdate={handleProfileUpdate}
                    onSuccess={showSuccessMessage}
                />
            )}
        </>
    );
};

export default Header;
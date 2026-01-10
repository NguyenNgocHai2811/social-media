import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Notification from '../Notification/Notification';

// Import Icons
import searchIcon from '../../assets/images/search.svg';
import notification from '../../assets/images/notification.svg'; // Icon cái chuông
import iconChat from '../../assets/images/comment.svg';
import userIcon from '../../assets/images/Vector.svg'; // Icon hình người (Friend request hoặc Profile)
import defaultAvatar from '../../assets/images/default-avatar.jpg';

const Header = ({showSearch = true, showAction = true}) => {
    const [user, setUser] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadChatCount, setUnreadChatCount] = useState(0); 
    const [showDropdown, setShowDropdown] = useState(false);
    const [latestNotification, setLatestNotification] = useState(null);
    
    const dropdownRef = useRef(null);
    const socketRef = useRef(null);
    const navigate = useNavigate();

    const isLocalhost = window.location.hostname === "localhost";
    const API_BASE = isLocalhost
        ? process.env.REACT_APP_API_URL
        : process.env.REACT_APP_API_URL_LAN;

    // --- 1. Fetch User Info, Notifications & Chat Count ---
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            const storedUserId = localStorage.getItem('userId');

            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const res = await axios.get(`${API_BASE}/api/users/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { ma_nguoi_dung: storedUserId }
                });
                setUser(res.data);
            } catch (err) {
                console.error('Failed to fetch user data:', err);
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                navigate('/login');
            }
        };

        const fetchNotifications = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await axios.get(`${API_BASE}/api/notifications`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // We only need the count here, list is fetched in Notification component
                const count = res.data.filter(n => !n.da_doc).length;
                setUnreadCount(count);
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
            }
        };
        
        const fetchUnreadChat = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await axios.get(`${API_BASE}/api/chat/unread-count`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUnreadChatCount(res.data.count);
            } catch (err) {
                console.error('Failed to fetch unread chat count:', err);
            }
        };

        fetchUser();
        fetchNotifications();
        fetchUnreadChat();
    }, [navigate, API_BASE]);

    // --- 2. Socket.IO Setup ---
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (token && userId && !socketRef.current) {
            socketRef.current = io(API_BASE, {
                query: { userId },
                transports: ['websocket']
            });

            socketRef.current.on('newNotification', (newNotif) => {
                setUnreadCount(prev => prev + 1);
                setLatestNotification(newNotif);
            });
            
            socketRef.current.on('newChatMessage', (message) => {
                if (message.sender.ma_nguoi_dung !== userId) {
                     setUnreadChatCount(prev => prev + 1);
                }
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [API_BASE]);

    // --- 3. Click Outside Logic ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // --- Handlers ---
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    const handleSearch = (e) => {
        const isEnterKey = e.type === 'keydown' && e.key === 'Enter';
        const isClick = e.type === 'click';

        if ((isEnterKey || isClick) && keyword.trim()) {
            navigate(`/search?q=${encodeURIComponent(keyword.trim())}`);
        }
    };
    
    const handleChatClick = () => {
        navigate('/chat');
    };

    // Render loading state nếu chưa có user
    if (!user) {
        return <header className="bg-white px-5 h-[60px] flex items-center shadow-sm"><div>Loading...</div></header>;
    }

    return (
        <header className="bg-white px-2.5 sm:px-5 h-[60px] flex items-center justify-between border-b border-gray-200 sticky top-0 z-[1000] shadow-sm">
            {/* --- LEFT SIDE: LOGO & SEARCH --- */}
            <div className="flex items-center">
                <Link to="/newsfeed" className="text-2xl md:text-3xl font-bold text-blue-600 mr-4 no-underline">
                    ConnectF
                </Link>
                
                { showSearch && (
                    <div className="relative hidden md:block group">
                        <img 
                            src={searchIcon} 
                            alt="Search Icon" 
                            onClick={handleSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 cursor-pointer opacity-60 group-hover:opacity-100 transition-opacity" 
                        />
                        <input 
                            type="text" 
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={handleSearch}
                            placeholder="Search ConnectF" 
                            className="bg-gray-100 border-none rounded-full py-2 pr-10 pl-4 w-60 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" 
                        />
                    </div>
                )}
            </div>

            {/* --- RIGHT SIDE: ICONS & PROFILE --- */}
            <div className="flex items-center gap-1 sm:gap-2">
                <div className="flex items-center gap-1">
                    { showAction && (
                        <>
                            {/* Icon Friend / Profile */}
                            <div 
                                className="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer hover:bg-gray-100 transition-colors" 
                                title="Profile"
                                onClick={() => navigate(`/profile/${user.ma_nguoi_dung}`)}
                            >
                                <img src={userIcon} alt="user" className="w-6 h-6" />
                            </div>

                            {/* Icon Chat */}
                            <div 
                                className="relative flex items-center justify-center w-10 h-10 rounded-full cursor-pointer hover:bg-gray-100 transition-colors" 
                                title="Messages"
                                onClick={handleChatClick}
                            >
                                <img src={iconChat} alt="chat" className="w-6 h-6" />
                                {unreadChatCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white">
                                        {unreadChatCount > 9 ? '9+' : unreadChatCount}
                                    </span>
                                )}
                            </div>

                            {/* Icon Notification (with Dropdown) */}
                            <div 
                                className="relative flex items-center justify-center w-10 h-10 rounded-full cursor-pointer hover:bg-gray-100 transition-colors" 
                                title="Notifications"
                                ref={dropdownRef}
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                <img src={notification} alt="notification" className="w-6 h-6" />
                                
                                {/* Badge thông báo */}
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}

                                {/* --- NOTIFICATION DROPDOWN --- */}
                                {showDropdown && (
                                    <Notification 
                                        newNotification={latestNotification}
                                        onUnreadCountChange={setUnreadCount}
                                        onClose={() => setShowDropdown(false)}
                                    />
                                )}
                            </div>
                        </>
                    )}
                    
                    {/* Logout Button */}
                    <div 
                        className="flex items-center justify-center w-10 h-10 rounded-full text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors hover:text-red-500" 
                        title="Logout" 
                        onClick={handleLogout}
                    >
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"></path></svg>
                    </div>
                </div>

                {/* Profile Link (Avatar + Name) */}
                <Link to={`/profile/${user.ma_nguoi_dung}`} className="flex items-center cursor-pointer no-underline text-gray-800 p-1 pl-2 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                    <img
                        src={user.anh_dai_dien || defaultAvatar}
                        alt="avatar"
                        className="w-8 h-8 rounded-full object-cover border border-gray-300"
                    />
                    <span className="ml-2 font-medium hidden sm:inline text-sm mr-2">{user.ten_hien_thi}</span>
                </Link>
            </div>
        </header>
    );
};

export default Header;

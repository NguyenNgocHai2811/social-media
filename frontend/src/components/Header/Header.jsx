import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

// Import Icons
import searchIcon from '../../assets/images/search.svg';
import notification from '../../assets/images/notification.svg';
import notificationIcon from '../../assets/images/notification.svg';
import iconChat from '../../assets/images/comment.svg';
import userIcon from '../../assets/images/Vector.svg';
import defaultAvatar from '../../assets/images/default-avatar.jpg';

const Header = ({showSearch = true, showAction = true}) => {
    const [user, setUser] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadChatCount, setUnreadChatCount] = useState(0); // New state for chat
    const [showDropdown, setShowDropdown] = useState(false);
    
    const dropdownRef = useRef(null);
    const socketRef = useRef(null);
    const navigate = useNavigate();

    const isLocalhost = window.location.hostname === "localhost";
    const API_BASE = isLocalhost
        ? process.env.REACT_APP_API_URL
        : process.env.REACT_APP_API_URL_LAN;

    // 1. Fetch User Info, Notifications & Chat Count
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
                setNotifications(res.data);
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

    // 2. Socket.IO Setup
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (token && userId && !socketRef.current) {
            socketRef.current = io(API_BASE, {
                query: { userId },
                transports: ['websocket']
            });

            // Listen for General Notifications
            socketRef.current.on('newNotification', (newNotif) => {
                setNotifications(prev => [newNotif, ...prev]);
                setUnreadCount(prev => prev + 1);
            });
            
            // Listen for New Chat Messages
            socketRef.current.on('newChatMessage', (message) => {
                // If the message is incoming (not from me), increment unread count
                // Assuming message.sender.ma_nguoi_dung is available and distinct
                // We don't have detailed check here if we are already on chat page for that user
                // Ideally, ChatPage clears it. But global header should show it if we are elsewhere.
                // Or if we are on chat page, we might want to not increment? 
                // For simplicity, always increment, and let ChatPage actions (fetch/read) clear it.
                // But since we can't easily sync state between Header and ChatPage without Context/Redux,
                // We'll accept a small desync until refresh or navigation.
                // However, if we are the sender, we shouldn't increment.
                
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

    // 3. Click Outside Logic
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

    const handleMarkAllRead = async () => {
        if (unreadCount === 0) return;

        try {
            const token = localStorage.getItem('token');
            // Optimistically update UI
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, da_doc: true })));

            await axios.put(`${API_BASE}/api/notifications/mark-all-read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error('Failed to mark all notifications as read:', err);
        }
    };

    const handleNotificationClick = (notif) => {
        setShowDropdown(false);
        // Could navigate to post here
    };

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
    
    // Handler for Chat Icon Click
    const handleChatClick = () => {
        navigate('/chat');
        // Optionally clear unread count here if we assume opening chat clears all?
        // Usually it doesn't until we open specific threads.
        // But for better UX if count is huge? No, keep it per logic.
    };

    if (!user) {
        return <header className="bg-white px-5 h-[60px] flex items-center shadow-sm"><div>Loading...</div></header>;
    }

    return (
        <header className="bg-white px-2.5 sm:px-5 h-[60px] flex items-center justify-between border-b border-gray-200 sticky top-0 z-[1000] shadow-sm">
            <div className="flex items-center">
                {/* LOGO */}
                <Link to="/newsfeed" className="text-2xl md:text-3xl font-bold text-blue-600 mr-4 no-underline">
                    ConnectF
                </Link>
            { showSearch && (
                <div className="relative hidden md:block">
                    <img src={searchIcon} alt="Search Icon" className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5" />
                    <input type="text" placeholder="Search ConnectF" className="bg-gray-100 border-none rounded-full py-2 pr-10 pl-4 w-60 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
            )}
            </div>

            {/* ICONS BÊN PHẢI */}
            <div className="flex items-center gap-1 sm:gap-2">
                <div className="flex items-center">
                    { showAction && (
                        <>
                            <div className="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer hover:bg-gray-200" title="Profile">
                                <img src={userIcon} alt="user" className="w-6 h-6" />
                            </div>
                            <div className="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer hover:bg-gray-200" title="Messages">
                                <img src={iconChat} alt="chat" className="w-6 h-6" />
                            </div>
                            <div className="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer hover:bg-gray-200" title="Notifications">
                                <img src={notification} alt="notification" className="w-6 h-6" />
                            </div>
                        </>
                    )}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full text-gray-600 cursor-pointer hover:bg-gray-200" title="Logout" onClick={handleLogout}>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"></path></svg>
                    </div>
                </div>

                {/* Profile Link */}
                <Link to={`/profile/${user.ma_nguoi_dung}`} className="flex items-center cursor-pointer no-underline text-gray-800 p-1 rounded-md hover:bg-gray-100 transition-colors">
                    <img
                        src={user.anh_dai_dien || defaultAvatar}
                        alt="avatar"
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                    <span className="ml-2 font-medium hidden sm:inline text-sm">{user.ten_hien_thi}</span>
                </Link>
            </div>
        </header>
    );
};

export default Header;

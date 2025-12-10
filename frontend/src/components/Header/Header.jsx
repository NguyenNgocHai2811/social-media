import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import searchIcon from '../../assets/images/search.svg';
// Icons
import notificationIcon from '../../assets/images/notification.svg';
import iconChat from '../../assets/images/comment.svg';
import userIcon from '../../assets/images/Vector.svg';
import defaultAvatar from '../../assets/images/default-avatar.jpg';

const Header = () => {
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const socketRef = useRef(null);
    const navigate = useNavigate();

    // Add the logic to determine the correct API base URL
    const isLocalhost = window.location.hostname === "localhost";
    const API_BASE = isLocalhost
        ? process.env.REACT_APP_API_URL
        : process.env.REACT_APP_API_URL_LAN;

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            const ma_duong_dung = localStorage.getItem('userId');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // Use the correct API_BASE for the axios call
                const res = await axios.get(`${API_BASE}/api/users/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { ma_nguoi_dung: ma_duong_dung} 
                });
                setUser(res.data);
            } catch (err) {
                console.error('Failed to fetch user data:', err);
                // If the token is invalid or the API fails, log out the user
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

        fetchUser();
        fetchNotifications();
    }, [navigate, API_BASE]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (token && userId && !socketRef.current) {
            socketRef.current = io(API_BASE, {
                query: { userId },
                transports: ['websocket']
            });

            socketRef.current.on('newNotification', (newNotif) => {
                setNotifications(prev => [newNotif, ...prev]);
                setUnreadCount(prev => prev + 1);
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [API_BASE]);

    // Close dropdown when clicking outside
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

    const handleNotificationClick = async (notif) => {
        if (!notif.da_doc) {
            try {
                const token = localStorage.getItem('token');
                await axios.put(`${API_BASE}/api/notifications/${notif.id}/read`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Update local state
                setNotifications(prev => prev.map(n => 
                    n.id === notif.id ? { ...n, da_doc: true } : n
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (err) {
                console.error('Failed to mark notification as read:', err);
            }
        }
        // Navigate or action? Currently just mark as read. 
        // Could navigate to post if related_id exists.
        setShowDropdown(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    if (!user) {
        return <header className="bg-white px-5 h-[60px] flex items-center"><div>Loading user...</div></header>;
    }

    return (
        <header className="bg-white px-2.5 sm:px-5 h-[60px] flex items-center justify-between border-b border-gray-200 sticky top-0 z-[1000] shadow-sm">
            <div className="flex items-center">
                <Link to="/newsfeed" className="text-2xl md:text-3xl font-bold text-blue-600 mr-4 no-underline">
                    ConnectF
                </Link>
                <div className="relative hidden md:block">
                    <img src={searchIcon} alt="Search Icon" className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5" />
                    <input type="text" placeholder="Search ConnectF" className="bg-gray-100 border-none rounded-full py-2 pr-10 pl-4 w-60 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
                <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer hover:bg-gray-200" title="Profile">
                        <img src={userIcon} alt="user" className="w-6 h-6" />
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer hover:bg-gray-200" title="Messages">
                        <img src={iconChat} alt="chat" className="w-6 h-6" />
                    </div>
                    <div className="relative" ref={dropdownRef}>
                        <div 
                            className="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer hover:bg-gray-200 relative" 
                            title="Notifications"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <img src={notificationIcon} alt="notification" className="w-6 h-6" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transform translate-x-1/4 -translate-y-1/4">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 max-h-96 overflow-y-auto border border-gray-200">
                                <div className="px-4 py-2 border-b border-gray-100 font-semibold text-gray-700">
                                    Notifications
                                </div>
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-3 text-gray-500 text-sm text-center">
                                        No notifications
                                    </div>
                                ) : (
                                    notifications.map(notif => (
                                        <div 
                                            key={notif.id}
                                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-start gap-3 ${!notif.da_doc ? 'bg-blue-50' : ''}`}
                                            onClick={() => handleNotificationClick(notif)}
                                        >
                                            <img 
                                                src={notif.sender?.anh_dai_dien || defaultAvatar} 
                                                alt="avatar" 
                                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-800 line-clamp-2">
                                                    {notif.noi_dung}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(notif.tao_luc).toLocaleString()}
                                                </p>
                                            </div>
                                            {!notif.da_doc && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full text-gray-600 cursor-pointer hover:bg-gray-200" title="Logout" onClick={handleLogout}>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"></path></svg>
                    </div>
                </div>
                <Link to={`/profile/${user.ma_nguoi_dung}`} className="flex items-center cursor-pointer no-underline text-gray-800 p-1 rounded-md hover:bg-gray-200">
                    <img
                        src={user.anh_dai_dien || defaultAvatar}
                        alt="avatar"
                        className="w-8 h-8 rounded-full"
                    />
                    <span className="ml-2 font-medium hidden sm:inline">{user.ten_hien_thi}</span>
                </Link>
            </div>
        </header>
    );
};

export default Header;

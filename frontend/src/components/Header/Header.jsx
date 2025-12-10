import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

// Import Icons
import searchIcon from '../../assets/images/search.svg';
import notification from '../../assets/images/notification.svg';
import { io } from 'socket.io-client';
import searchIcon from '../../assets/images/search.svg';
// Icons
import notificationIcon from '../../assets/images/notification.svg';
import iconChat from '../../assets/images/comment.svg';
import userIcon from '../../assets/images/Vector.svg';
import defaultAvatar from '../../assets/images/default-avatar.jpg';

const Header = () => {
    const [user, setUser] = useState(null);
    const [keyword, setKeyword] = useState(''); // State lưu từ khóa tìm kiếm
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const socketRef = useRef(null);
    const navigate = useNavigate();

    const isLocalhost = window.location.hostname === "localhost";
    const API_BASE = isLocalhost
        ? process.env.REACT_APP_API_URL
        : process.env.REACT_APP_API_URL_LAN;

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            const storedUserId = localStorage.getItem('userId'); // Sửa tên biến cho rõ nghĩa

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
            // Revert on failure could be added here if needed, but for now log error is sufficient
        }
    };

    const handleNotificationClick = async (notif) => {
        // Since we mark all as read when opening dropdown, this might not be strictly necessary 
        // for the "unread" status logic, but it's good to keep it or just handle navigation.
        // If the user wants specific behavior when clicking a single notification (like navigation),
        // we can implement it here. For now, since "all are read" when the list opens, 
        // we mainly focus on closing the dropdown.
        setShowDropdown(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    // --- HÀM XỬ LÝ TÌM KIẾM ---
    const handleSearch = (e) => {
        // Kiểm tra: Nếu là sự kiện phím thì phải là Enter, nếu là click thì luôn chấp nhận
        const isEnterKey = e.type === 'keydown' && e.key === 'Enter';
        const isClick = e.type === 'click';

        if ((isEnterKey || isClick) && keyword.trim()) {
            // Chuyển hướng sang trang Search kèm query param đã được mã hóa
            navigate(`/search?q=${encodeURIComponent(keyword.trim())}`);
            // Tùy chọn: Xóa ô tìm kiếm sau khi enter
            // setKeyword(''); 
        }
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

                {/* THANH TÌM KIẾM */}
                <div className="relative hidden md:block group">
                    <img
                        src={searchIcon}
                        alt="Search Icon"
                        onClick={handleSearch} // Sự kiện click
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 cursor-pointer hover:opacity-70 z-10"
                    />

                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)} // Cập nhật state
                        onKeyDown={handleSearch} // Sự kiện phím Enter
                        placeholder="Search ConnectF"
                        className="bg-gray-100 border-none rounded-full py-2 pr-10 pl-4 w-60 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all duration-200"
                    />
                </div>
            </div>

            {/* ICONS BÊN PHẢI */}
            <div className="flex items-center gap-1 sm:gap-2">
                <div className="flex items-center">
                    {/* Icon User (Menu) */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer hover:bg-gray-200 transition-colors" title="Menu">
                        <img src={userIcon} alt="menu" className="w-6 h-6" />
                    </div>
                    {/* Icon Chat */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer hover:bg-gray-200 transition-colors" title="Messages">
                        <img src={iconChat} alt="chat" className="w-6 h-6" />
                    </div>
                    {/* Icon Notification */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer hover:bg-gray-200 transition-colors" title="Notifications">
                        <img src={notification} alt="notification" className="w-6 h-6" />
                    <div className="relative" ref={dropdownRef}>
                        <div 
                            className="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer hover:bg-gray-200 relative" 
                            title="Notifications"
                            onClick={() => {
                                if (!showDropdown) {
                                    handleMarkAllRead();
                                }
                                setShowDropdown(!showDropdown);
                            }}
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
                    {/* Icon Logout */}
                    <div
                        className="flex items-center justify-center w-10 h-10 rounded-full text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors"
                        title="Logout"
                        onClick={handleLogout}
                    >
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
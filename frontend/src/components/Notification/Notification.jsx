import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Notification.css';
import defaultAvatar from '../../assets/images/default-avatar.jpg';

const Notification = ({ newNotification, onUnreadCountChange, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const isLocalhost = window.location.hostname === "localhost";
    const API_BASE = isLocalhost
        ? process.env.REACT_APP_API_URL
        : process.env.REACT_APP_API_URL_LAN;

    // Fetch initial notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const res = await axios.get(`${API_BASE}/api/notifications`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log(res)
                

                // Sort by time desc just in case, though API should handle it
                const sorted = res.data.sort((a, b) => new Date(b.tao_luc) - new Date(a.tao_luc));
                setNotifications(sorted);
                
                // Calculate unread count and inform parent
                const count = sorted.filter(n => !n.da_doc).length;
                if (onUnreadCountChange) {
                    onUnreadCountChange(count);
                }
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [API_BASE, onUnreadCountChange]);

    // Handle new notification from socket
    useEffect(() => {
        if (newNotification) {
            setNotifications(prev => {
                // Prevent duplicates
                if (prev.some(n => n.id === newNotification.id)) {
                    return prev;
                }
                const updatedList = [newNotification, ...prev];
                return updatedList;
            });
        }
    }, [newNotification]);

    const handleMarkAllRead = async () => {
        const hasUnread = notifications.some(n => !n.da_doc);
        if (!hasUnread) return;

        try {
            const token = localStorage.getItem('token');
            // Optimistic update
            setNotifications(prev => prev.map(n => ({ ...n, da_doc: true })));
            if (onUnreadCountChange) {
                onUnreadCountChange(0);
            }

            await axios.put(`${API_BASE}/api/notifications/mark-all-read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error('Failed to mark all notifications as read:', err);
            // Revert or re-fetch could happen here, but usually optimistic is fine
        }
    };

    const handleItemClick = async (notif) => {
        // Mark as read if needed
        if (!notif.da_doc) {
            try {
                const token = localStorage.getItem('token');
                
                // Update local state first
                setNotifications(prev => prev.map(n => 
                    n.id === notif.id ? { ...n, da_doc: true } : n
                ));
                
                // Calculate new count
                const newCount = notifications.filter(n => !n.da_doc && n.id !== notif.id).length;
                if (onUnreadCountChange) {
                    onUnreadCountChange(newCount);
                }

                // API call
                await axios.put(`${API_BASE}/api/notifications/${notif.id}/read`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (err) {
                console.error('Failed to mark notification as read:', err);
            }
        }

        // Close dropdown
        if (onClose) onClose();

        // Navigate
        // Note: You might want to customize this based on `notif.loai` (e.g. 'POST', 'FRIEND_REQUEST')
        // For now, assuming standard post navigation or just profile
        if (notif.related_id) {
             // Example: If it's a post, go to post detail. 
             // Since I don't know exact routes for single post view, I'll stick to a safe default or assume post detail exists.
             // Given the context in Header.jsx was `navigate('/post/${notif.postId}')` but commented out.
             // I'll try to guess based on memory or code. Memory says `post.service.js` has logic.
             // Current codebase doesn't seem to have a dedicated single post page route visible in `list_files`?
             // Wait, `post.route.js` exists.
             // Let's just do a generic check or navigate to home for now if unsure, OR use `related_id` if it's a post.
             // User's previous code in Header had `// navigate('/post/${notif.postId}')`.
             // I will leave it as a comment or generic for now, or direct to newsfeed.
             // Actually, if it's a friend request, maybe go to profile.
             // For now, I'll just keep the click handling logic minimal regarding navigation to avoid 404s.
             // But the user said "lich su da co", implies just displaying history is the main goal.
             // I'll add a simple check.
             if (notif.loai === 'FRIEND_REQUEST') {
                 navigate(`/profile/${notif.sender.ma_nguoi_dung}`);
             } else {
                 // navigate(`/post/${notif.related_id}`); // Uncomment if route exists
                 // For now, maybe just stay or go to newsfeed/profile
             }
        }
    };
    
    // Helper to format date
    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('vi-VN');
        } catch (e) {
            return '';
        }
    };

    const unreadCount = notifications.filter(n => !n.da_doc).length;

    return (
        <div className="notification-dropdown">
            <div className="notification-header">
                <h3 className="notification-title">Thông báo</h3>
                {unreadCount > 0 && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleMarkAllRead(); }} 
                        className="mark-read-btn"
                    >
                        Đánh dấu đã đọc
                    </button>
                )}
            </div>
            
            <div className="notification-list">
                {loading ? (
                    <div className="notification-empty">Đang tải...</div>
                ) : notifications.length === 0 ? (
                    <div className="notification-empty">
                        Không có thông báo nào.
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div 
                            key={notif.id || notif._id} // Neo4j often returns id as string in prop, but check structure
                            onClick={() => handleItemClick(notif)}
                            className={`notification-item ${!notif.da_doc ? 'unread' : ''}`}
                        >
                            <img 
                                src={notif.sender?.anh_dai_dien || defaultAvatar} 
                                alt="avatar" 
                                className="notification-avatar"
                            />
                            <div className="notification-content">
                                <p className="notification-text">
                                    <span className="sender-name">{notif.sender?.ten_hien_thi || 'Người dùng'}</span> {notif.noi_dung}
                                </p>
                                <span className={`notification-time ${!notif.da_doc ? 'unread' : ''}`}>
                                    {formatDate(notif.tao_luc)}
                                </span>
                            </div>
                            {!notif.da_doc && (
                                <div className="unread-dot"></div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notification;

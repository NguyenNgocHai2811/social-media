import React, { useEffect, useState } from 'react';
import './RightSidebar.css';
import { io } from 'socket.io-client';
import defaultAvatar from '../../assets/images/default-avatar.jpg';

const RightSidebar = () => {
    const [onlineFriends, setOnlineFriends] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        
        // Use environment variable for API URL or default to localhost
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

        if (userId && token) {
            // Initialize socket connection
            const newSocket = io(API_URL, {
                query: { userId }
            });

            setSocket(newSocket);

            // Listen for initial list of online friends
            newSocket.on('onlineFriends', (friends) => {
                setOnlineFriends(friends);
            });

            // Listen for a new friend coming online
            newSocket.on('friendOnline', (friend) => {
                setOnlineFriends(prevFriends => {
                    // Avoid duplicates
                    if (!prevFriends.find(f => f.ma_nguoi_dung === friend.ma_nguoi_dung)) {
                        return [...prevFriends, friend];
                    }
                    return prevFriends;
                });
            });

            // Listen for a friend going offline
            newSocket.on('friendOffline', (friendId) => {
                setOnlineFriends(prevFriends => prevFriends.filter(f => f.ma_nguoi_dung !== friendId));
            });

            return () => {
                newSocket.disconnect();
            };
        }
    }, []);

    return (
        <div className="right-sidebar-container">
            <h3 className="sidebar-title">Bạn bè</h3>
            <ul className="friend-list">
                {onlineFriends.length > 0 ? (
                    onlineFriends.map((friend) => (
                        <li key={friend.ma_nguoi_dung} className="friend-item">
                            <div className="friend-avatar-container">
                                <img 
                                    src={friend.anh_dai_dien || defaultAvatar} 
                                    alt={friend.ten_hien_thi} 
                                    className="friend-avatar" 
                                />
                                <span className="online-indicator"></span>
                            </div>
                            <span className="friend-name">{friend.ten_hien_thi}</span>
                        </li>
                    ))
                ) : (
                    <p style={{ padding: '0 10px', color: '#65676b', fontSize: '14px' }}>
                        Không có bạn bè nào đang online.
                    </p>
                )}
            </ul>
        </div>
    );
};

export default RightSidebar;

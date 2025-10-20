import React from 'react';
import './RightSidebar.css';

const RightSidebar = () => {
    // Mock data for friends list
    const friends = [
        { name: 'Nguyen Ngoc Hai', avatar: 'https://via.placeholder.com/40' },
        { name: 'Tran Van An', avatar: 'https://via.placeholder.com/40' },
        { name: 'Le Thi Binh', avatar: 'https://via.placeholder.com/40' },
        { name: 'Pham Minh Chien', avatar: 'https://via.placeholder.com/40' },
        { name: 'Vo Thi Dao', avatar: 'https://via.placeholder.com/40' },
        { name: 'Do Xuan E', avatar: 'https://via.placeholder.com/40' },
        { name: 'Ngo Van F', avatar: 'https://via.placeholder.com/40' },
    ];

    return (
        <div className="right-sidebar-container">
            <h3 className="sidebar-title">Bạn bè</h3>
            <ul className="friend-list">
                {friends.map((friend, index) => (
                    <li key={index} className="friend-item">
                        <div className="friend-avatar-container">
                            <img src={friend.avatar} alt={`${friend.name}'s avatar`} className="friend-avatar" />
                            <span className="online-indicator"></span>
                        </div>
                        <span className="friend-name">{friend.name}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RightSidebar;
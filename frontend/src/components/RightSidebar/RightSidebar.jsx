import React from 'react';
import './RightSidebar.css';

const RightSidebar = () => {
    // Mock data for friends list
    const friends = [
        { name: 'Nguyen Ngoc Hai'},
        { name: 'Tran Van An' },
        { name: 'Le Thi Binh'  },
        { name: 'Pham Minh Chien' },
        { name: 'Vo Thi Dao' },
        { name: 'Do Xuan E' },
        { name: 'Ngo Van F' },
    ];

    return (
        <div className="right-sidebar-container">
            <h3 className="sidebar-title">Bạn bè</h3>
            <ul className="friend-list">
                {friends.map((friend, index) => (
                    <li key={index} className="friend-item">
                        <div className="friend-avatar-container">
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
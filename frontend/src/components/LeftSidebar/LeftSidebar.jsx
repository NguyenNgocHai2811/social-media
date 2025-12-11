import React from 'react';
import './LeftSidebar.css';
import { NavLink } from 'react-router-dom'; // Dùng NavLink để biết trang nào đang active
import { FaUserFriends } from 'react-icons/fa';

const LeftSidebar = ({ onPostClick, variant = 'default' }) => {
    
    // --- MENU MẶC ĐỊNH (NewsFeed) ---
    const defaultMenuItems = [
        { to: "/newsfeed", icon: <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"></path></svg>, text: 'Bảng tin' },
        { to: "/friends", icon: <FaUserFriends size={24} />, text: 'Bạn bè' },
        { to: "/friend-requests", icon: <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"></path></svg>, text: 'Lời mời kết bạn' },
        // Các item không có link (chỉ có action hoặc hiển thị)
        { icon: <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"></path></svg>, text: 'Sự kiện' },
        { icon: <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z"></path></svg>, text: 'Post', action: onPostClick }
    ];

    // --- MENU DASHBOARD (Admin) ---
    // Lưu ý: Đường dẫn phải khớp với Route đã khai báo trong App.js
    const dashboardMenuItems = [
        { 
            to: "/admin/dashboard", 
            icon: <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"></path></svg>, 
            text: 'Thống kê' 
        },
        { 
            to: "/admin/users", 
            icon: <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"></path></svg>, 
            text: 'Quản lý người dùng' 
        },
        { 
            to: "/admin/posts", // Giả sử bạn sẽ có trang này
            icon: <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z"></path></svg>, 
            text: 'Quản lý bài đăng' 
        },
        // Dòng kẻ phân cách
        { isDivider: true }, 
        { 
            to: "/newsfeed", 
            icon: <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"></path></svg>, 
            text: 'Về trang chính' 
        }
    ];

    const menuItems = variant === 'dashboard' ? dashboardMenuItems : defaultMenuItems;

    return (
        <div className="left-sidebar-container">
            <nav className="sidebar-nav">
                <ul>
                    {menuItems.map((item, index) => {
                        // Xử lý nếu là dòng kẻ phân cách
                        if (item.isDivider) {
                            return <hr key={index} className="sidebar-divider" />;
                        }

                        return (
                            <li key={index} className="nav-item" onClick={item.action}>
                                {item.to ? (
                                    // Sử dụng NavLink để tự động thêm class 'active' khi URL trùng khớp
                                    <NavLink 
                                        to={item.to} 
                                        className={({ isActive }) => 
                                            `nav-link flex ${isActive ? 'active' : ''}`
                                        }
                                        end={item.to === '/newsfeed' || item.to === '/admin/dashboard'} // 'end' để tránh active nhầm khi route lồng nhau
                                    >
                                        <span className="nav-icon">{item.icon}</span>
                                        <span className="nav-text">{item.text}</span>
                                    </NavLink>
                                ) : (
                                    // Các item không phải link (như nút Post hoặc Sự kiện)
                                    <div className="nav-link flex cursor-pointer">
                                        <span className="nav-icon">{item.icon}</span>
                                        <span className="nav-text">{item.text}</span>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
};

export default LeftSidebar;
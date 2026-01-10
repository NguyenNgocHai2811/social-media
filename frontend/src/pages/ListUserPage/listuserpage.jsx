import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import './listuserpage.css'; 

const ListUser = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const isLocalhost = window.location.hostname === "localhost";
    const API_BASE = isLocalhost 
        ? process.env.REACT_APP_API_URL 
        : process.env.REACT_APP_API_URL_LAN;

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const keyword = searchTerm.trim();
            
            let url = `${API_BASE}/api/admin/users`;
            let params = {};

            if (keyword) {
                url = `${API_BASE}/api/admin/users/search`;
                params = { keyword: keyword };
            }

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                params: params
            });

            let dataArr = [];
            if (response.data.data && Array.isArray(response.data.data)) {
                dataArr = response.data.data;
            } else if (Array.isArray(response.data)) {
                dataArr = response.data;
            }

            setUsers(dataArr);

        } catch (err) {
            console.error("Lỗi API:", err);
            if (err.response && (err.response.status === 404 || err.response.status === 400)) {
                setUsers([]);
            } else {
                alert("Có lỗi khi tải dữ liệu.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            fetchUsers();
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '---';
        try { return new Date(dateString).toLocaleDateString('vi-VN'); } 
        catch { return dateString; }
    };

    // Hàm trả về tên class CSS tương ứng với trạng thái
 const getStatusClass = (status) => {
    const s = status ? String(status).toLowerCase() : '';
    
    // Thêm 'hoat_dong' vào điều kiện này
    if (s === 'hoat_dong') {
        return 'status-active'; // Trả về class màu xanh
    }
    
    if (s === 'dang_khoa') {
        return 'status-locked'; // Trả về class màu đỏ
    }
    
    return 'khong_hoat_dong'; // Màu xám
};

    return (
        <div className="list-user-container">
            {/* Header */}
            <div className="list-header">
                <h2 className="page-title">Danh sách người dùng</h2>
                
                <div className="search-area">
                    <div className="search-input-wrapper">
                        <input
                            type="text"
                            placeholder="Nhập tên, email..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        {/* Icon search svg */}
                        <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    
                    <button onClick={fetchUsers} className="btn-search">
                        Tìm kiếm
                    </button>
                </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className="table-wrapper">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Thông tin</th>
                            <th>Vai trò</th>
                            <th>Ngày tham gia</th>
                            <th>Trạng thái</th>
                            <th style={{ textAlign: 'right' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : users.length > 0 ? (
                            users.map((user, index) => {
                                const displayName = user.ho_ten || user.ten_hien_thi || "Chưa đặt tên";
                                console.log("Dữ liệu user thứ " + index + ":", user);
                                return (
                                    <tr key={user.ma_nguoi_dung || index}>
                                        <td>
                                            <div className="user-info-cell">
                                                <img 
                                                    className="user-avatar" 
                                                    src={user.anh_dai_dien || "https://via.placeholder.com/150"} 
                                                    alt="avatar" 
                                                />
                                                <div className="user-details">
                                                    <div className="user-name">{displayName}</div>
                                                    <div className="user-email">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="role-badge">
                                                {user.role || 'user'}
                                            </span>
                                        </td>
                                        <td className="date-text">
                                            {formatDate(user.ngay_tao)}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(user.trang_thai)}`}>
                                                {user.trang_thai || 'Unknown'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <Link to={`/admin/users/edit/${user.ma_nguoi_dung}`} className="action-link">
                                                Sửa
                                            </Link>
                                            <button className="action-btn-danger">
                                                Khóa
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                                    Không tìm thấy người dùng nào phù hợp.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="pagination-container">
                <p className="pagination-text">
                    Hiển thị <strong>{users.length}</strong> kết quả
                </p>
                <div>
                    <nav className="pagination-nav">
                        <button className="page-btn">Previous</button>
                        <button className="page-btn">1</button>
                        <button className="page-btn">2</button>
                        <button className="page-btn">Next</button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default ListUser;
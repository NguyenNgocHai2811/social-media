import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditUser.css'; // Import file CSS ở trên

const EditUser = () => {
    const {userId: id } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [userData, setUserData] = useState({
        ma_nguoi_dung: '',
        ten_hien_thi: '', 
        email: '',
        role: 'USER',
        trang_thai: 'hoat_dong',
        anh_dai_dien: ''
    });

    const isLocalhost = window.location.hostname === "localhost";
    const API_BASE = isLocalhost 
        ? process.env.REACT_APP_API_URL 
        : process.env.REACT_APP_API_URL_LAN;

    // --- 1. Fetch Dữ liệu ---
    useEffect(() => {
        const fetchUserDetail = async () => {
            try {
                if (!id) return;

                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_BASE}/api/admin/users/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

           

                // Kiểm tra điều kiện
                if (response.data && response.data.success) {
                    
                    let u = response.data.data;
                    if (Array.isArray(u)) u = u[0];

                    setUserData({
                        ma_nguoi_dung: u.ma_nguoi_dung,
                        ten_hien_thi: u.ten_hien_thi || u.ho_ten || '', 
                        email: u.email || '',
                        role: u.role || 'USER',
                        trang_thai: u.trang_thai || 'hoat_dong',
                        anh_dai_dien: u.anh_dai_dien || ''
                    });
                } else {
                    console.error("❌ API chạy ok nhưng success = FALSE hoặc thiếu data");
                }
            } catch (error) {
                console.error("Lỗi fetch user:", error);
                alert("Không thể tải thông tin người dùng này.");
                navigate('/admin/users');
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetail();
        return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
    }, [id, API_BASE, navigate]);

    // --- 2. Xử lý logic ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            let finalAvatarUrl = userData.anh_dai_dien;

            // TODO: Xử lý upload ảnh ở đây nếu có selectedFile
            if (selectedFile) {
                console.log("File chờ upload:", selectedFile.name);
                // Upload logic...
            }

            const payload = {
                ten_hien_thi: userData.ten_hien_thi,
                role: userData.role,
                trang_thai: userData.trang_thai,
                anh_dai_dien: finalAvatarUrl
            };

            await axios.put(`${API_BASE}/api/admin/users/${id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Cập nhật thành công!");
            navigate('/admin/users');

        } catch (error) {
            console.error("Lỗi update:", error);
            const msg = error.response?.data?.message || "Có lỗi xảy ra";
            alert(msg);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="text-gray-500 text-lg">Đang tải thông tin...</div>
        </div>
    );
    console.log("STATE TRƯỚC KHI RENDER:", userData);
    return (
        <div className="edit-user-container">
            <div className="edit-header">
                <h2 className="edit-title">Chỉnh sửa thông tin</h2>
            </div>

            <form onSubmit={handleSubmit} className="form-layout">
                {/* --- CỘT TRÁI: AVATAR --- */}
                <div className="avatar-section">
                    <div className="avatar-wrapper">
                        <input 
                            type="file" 
                            id="avatar-upload"
                            className="file-input-hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />

                        <label htmlFor="avatar-upload" title="Nhấn để đổi ảnh đại diện">
                            <img 
                                src={previewUrl || userData.anh_dai_dien || "https://via.placeholder.com/150"} 
                                alt="Avatar" 
                                className="avatar-preview"
                            />
                            <div className="camera-icon">add</div>
                        </label>
                    </div>

                    <div className="text-center mt-3">
                        <p className="user-email-text">{userData.email}</p>
                        <span className="user-id-text">ID: {userData.ma_nguoi_dung}</span>
                    </div>
                </div>

                <div className="inputs-section">
                    <div className="form-group">
                        <label className="form-label">Tên hiển thị</label>
                        <input 
                            type="text" 
                            name="ten_hien_thi" 
                            className="form-input" 
                            value={userData.ten_hien_thi} 
                            onChange={handleChange}
                            required
                            placeholder="Nhập tên hiển thị..."
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email (Không thể sửa)</label>
                        <input 
                            type="email" 
                            className="form-input" 
                            value={userData.email} 
                            disabled 
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Vai trò hệ thống</label>
                        <select 
                            name="role" 
                            className="form-select"
                            value={userData.role}
                            onChange={handleChange}
                        >
                            <option value="USER">user</option>
                            <option value="ADMIN">admin</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Trạng thái tài khoản</label>
                        <select 
                            name="trang_thai" 
                            className="form-select"
                            value={userData.trang_thai}
                            onChange={handleChange}
                        >
                            <option value="hoat_dong">Hoạt động</option>
                            <option value="bi_khoa">Bị khóa</option>
                            <option value="khong_hoat_dong">Không hoạt động</option>
                        </select>
                    </div>

                    <div className="btn-group">
                        <button 
                            type="button" 
                            className="btn-cancel"
                            onClick={() => navigate('/admin/users')}
                        >
                            Quay lại
                        </button>
                        <button type="submit" className="btn-save">
                            Lưu thay đổi
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditUser;
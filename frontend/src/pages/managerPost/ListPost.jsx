import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ListPost.css'; // Import file CSS

const ListPost = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Cấu hình API Base
    const isLocalhost = window.location.hostname === "localhost";
    const API_BASE = isLocalhost 
        ? process.env.REACT_APP_API_URL || 'http://localhost:3001'
        : process.env.REACT_APP_API_URL_LAN;

    // 1. Hàm gọi API lấy danh sách (hoặc tìm kiếm)
    const fetchPosts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = `${API_BASE}/api/admin/posts`;
            let params = {};

            // Nếu có từ khóa tìm kiếm -> Gọi API search
            if (searchTerm.trim()) {
                url = `${API_BASE}/api/admin/posts/search`;
                params = { keyword: searchTerm.trim() };
            }

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                params: params
            });

            if (response.data.success) {
                setPosts(response.data.data);
            }
        } catch (error) {
            console.error("Lỗi tải bài viết:", error);
            alert("Không thể tải danh sách bài viết");
        } finally {
            setLoading(false);
        }
    };

    // Gọi API lần đầu khi vào trang
    useEffect(() => {
        fetchPosts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2. Xử lý sự kiện tìm kiếm
    const handleSearch = (e) => {
        e.preventDefault(); // Chặn reload form
        fetchPosts();
    };

    // 3. Xử lý sự kiện XÓA
    const handleDelete = async (postId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác!")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_BASE}/api/admin/posts/${postId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                alert("Đã xóa bài viết thành công!");
                // Load lại danh sách sau khi xóa
                fetchPosts();
            } catch (error) {
                console.error("Lỗi xóa:", error);
                alert("Xóa thất bại! Có thể do lỗi server.");
            }
        }
    };

    // 4. Hàm Format nội dung (Xử lý \r\n và cắt ngắn)
    const formatContent = (content) => {
        if (!content) return "---";
        // Thay thế xuống dòng thành dấu cách
        const cleanText = content.replace(/(\r\n|\n|\r)/gm, " ");
        // Cắt ngắn nếu dài quá 60 ký tự
        if (cleanText.length > 60) {
            return cleanText.substring(0, 60) + "...";
        }
        return cleanText;
    };

    // 5. Hàm Format ngày tháng
    const formatDate = (dateString) => {
        if (!dateString) return "";
        try {
            return new Date(dateString).toLocaleString('vi-VN');
        } catch { return dateString; }
    };

    return (
        <div className="list-post-container">
            {/* --- HEADER & TÌM KIẾM --- */}
            <div className="page-header">
                <h2>Quản lý bài đăng ({posts.length})</h2>
                
                <form onSubmit={handleSearch} className="search-box">
                    <input 
                        type="text" 
                        placeholder="Tìm theo nội dung hoặc tên tác giả..." 
                        className="search-input-post"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="btn-search">Tìm kiếm</button>
                </form>
            </div>

            {/* --- BẢNG DỮ LIỆU --- */}
            {loading ? (
                <div style={{textAlign: 'center', padding: '20px'}}>Đang tải dữ liệu...</div>
            ) : (
               <table className="post-table">
    <thead>
        <tr>
            <th style={{width: '50px'}}>STT</th>
            {/* 1. THÊM CỘT HÌNH ẢNH */}
            <th style={{width: '100px'}}>Hình ảnh</th>
            
            <th style={{width: '150px'}}>Tác giả</th>
            <th>Nội dung</th>
            <th style={{width: '150px'}}>Ngày đăng</th>
            <th style={{width: '120px'}}>Tương tác</th>
            <th style={{width: '80px', textAlign: 'center'}}>Thao tác</th>
        </tr>
    </thead>
    <tbody>
        {posts.length > 0 ? (
            posts.map((post, index) => (
                <tr key={post.ma_bai_dang || index}>
                    <td>{index + 1}</td>

                    {/* 2. HIỂN THỊ HÌNH ẢNH */}
                    <td>
                        {post.duong_dan ? (
                            <img 
                                src={post.duong_dan} 
                                alt="Thumbnail" 
                                className="post-thumbnail"
                                // Click vào để mở ảnh to trong tab mới
                                onClick={() => window.open(post.duong_dan, '_blank')}
                                title="Nhấn để xem ảnh gốc"
                            />
                        ) : (
                            <span className="no-media">Không có</span>
                        )}
                    </td>

                    <td className="author-cell">{post.ten_hien_thi}</td>
                    
                    {/* Nội dung đã được xử lý \r\n */}
                    <td className="content-cell" title={post.noi_dung}>
                        {formatContent(post.noi_dung)}
                    </td>
                    
                    <td>{formatDate(post.thoi_gian)}</td>
                    
                    <td>
                        {/* Class stat-badge đã được CSS nowrap để không bị rớt dòng */}
                        <span className="stat-badge like-stat">
                            Like {post.like}
                        </span>
                        <br/> {/* Xuống dòng nhẹ giữa like và comment cho gọn */}
                        <span className="stat-badge comment-stat">
                            Comment {post.comment}
                        </span>
                    </td>
                    
                    <td style={{textAlign: 'center'}}>
                        <button 
                            className="btn-delete"
                            onClick={() => handleDelete(post.ma_bai_dang)}
                        >
                            Xóa
                        </button>
                    </td>
                </tr>
            ))
        ) : (
            <tr>
                {/* 3. SỬA COLSPAN TỪ 6 THÀNH 7 (Vì thêm 1 cột ảnh) */}
                <td colSpan="7" style={{textAlign: 'center', padding: '30px'}}>
                    Không tìm thấy bài viết nào.
                </td>
            </tr>
        )}
    </tbody>
</table>
            )}
        </div>
    );
};

export default ListPost;
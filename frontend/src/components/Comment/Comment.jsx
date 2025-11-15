import React from 'react';
import { Link } from 'react-router-dom';
import defaultAvatar from '../../assets/images/default-avatar.jpg';
import './Comment.css';

const Comment = ({ comment, onCommentDeleted, onCommentUpdated }) => {
    const userId = localStorage.getItem('userId');

    const handleDelete = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này không?')) {
            onCommentDeleted(comment.ma_binh_luan);
        }
    };

    // Chức năng cập nhật có thể được triển khai sau
    // const handleUpdate = () => { ... };

    return (
        <div className="comment">
            <Link to={`/profile/${comment.user.ma_nguoi_dung}`}>
                <img
                    src={comment.user.anh_dai_dien || defaultAvatar}
                    alt="avatar"
                    className="comment-avatar"
                />
            </Link>
            <div className="comment-content">
                <div className="comment-header">
                    <Link to={`/profile/${comment.user.ma_nguoi_dung}`} className="comment-username">
                        {comment.user.ten_hien_thi || 'Người dùng ẩn danh'}
                    </Link>
                    <span className="comment-timestamp">
                        {new Date(comment.thoi_gian_tao).toLocaleString('vi-VN')}
                    </span>
                </div>
                <p className="comment-body">{comment.noi_dung}</p>
            </div>
            {userId === comment.user.ma_nguoi_dung && (
                <div className="comment-actions">
                    <button onClick={handleDelete} className="comment-delete-btn">Xóa</button>
                    {/* <button onClick={handleUpdate} className="comment-edit-btn">Sửa</button> */}
                </div>
            )}
        </div>
    );
};

export default Comment;

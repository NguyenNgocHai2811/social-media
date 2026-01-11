import React  from "react";
import {Link} from 'react-router-dom';
import defaultAvatar from '../../assets/images/default-avatar.jpg';
import './Comment.css';

const Comment = ({comment , onCommentDeleted, onCommentUpdated, postAuthorId}) => {
    const userId = localStorage.getItem('userId');
    const isCommentOwner = userId === comment.user.ma_nguoi_dung;
    const isPostOwner = userId === postAuthorId;
    
    const handleDelete = async () => {
        if(window.confirm('Bạn có chắc chắn muốn xóa bình luận này không?')){
            onCommentDeleted(comment.ma_binh_luan);
        }

    };

    // tinh nang cap nhat trien khai sau

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
                        {comment.user.ten_hien_thi || 'Nguoi dung an danh'}
                    </Link>
                    <span className="comment-timestamp">
                        {new Date(comment.thoi_gian_tao).toLocaleString('vi-VN')}
                    </span>
                </div>
                <p className="comment-body"> {comment.noi_dung}</p>
                {(isCommentOwner || isPostOwner) && (
                    <div className="comment-action">
                        <button className="comment-delete-btn" onClick={handleDelete}>Xóa</button>
                    </div>
                )}
            </div>
        </div>
    );
};
export default Comment;
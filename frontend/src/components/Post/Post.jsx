import React from 'react';
import './Post.css';

const Post = ({ post }) => {
    const { user, noi_dung, media, ngay_tao, so_luot_thich, so_luot_binh_luan } = post;

    const renderMedia = () => {
        if (!media || !media.duong_dan) return null;
        // Assuming media.duong_dan is the relative path from the backend's upload folder
        const imageUrl = `http://localhost:3001${media.duong_dan}`;
        return <img src={imageUrl} alt="Post content" className="post-image" />;
    };

     // Check if media is a valid image before rendering
    const isImageMedia = media && media.loai === 'anh' && media.duong_dan;
    const userName = user ? user.ten_hien_thi : 'Nguoi dung an danh';
     const userAvatar = user && user.anh_dai_dien ? user.anh_dai_dien : 'default-avatar.png';

    return (
        <div className="post-card">
            {isImageMedia && (
                <div className="post-media">
                    {renderMedia()}
                </div>
            )}
            <div className="post-body">
                <div className="post-header">
                   <img src={userAvatar} alt="user avatar" className="user-avatar" />
                    <div className="user-info">
                       <span className="user-name">{userName}</span>
                        <span className="post-timestamp">{new Date(ngay_tao).toLocaleString()}</span>
                    </div>
                </div>
                <p className="post-content">{noi_dung}</p>
                <div className="post-stats">
                    <span>👍 {so_luot_thich || 0}</span>
                    <span>💬 {so_luot_binh_luan || 0}</span>
                    <span>🔗 0</span>
                </div>
                <div className="post-actions">
                    <button>Like</button>
                    <button>Comment</button>
                    <button>Share</button>
                </div>
                <div className="comment-input-container">
                    <input type="text" placeholder="Viết bình luận..." className="comment-input" />
                </div>
            </div>
        </div>
    );
};

export default Post;
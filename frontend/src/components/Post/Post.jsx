import React from 'react';
import './Post.css';

const Post = ({ post }) => {

    const { user, noi_dung, media, ngay_tao } = post;

    const renderMedia = () => {
        if (!media) return null;

        if (media.loai === 'anh') {
            return <img src={`http://localhost:3001${media.duong_dan}`} alt="Post content" className="post-image" />;
        }

        if (media.loai === 'mau_nen') {
            return <div className="post-background" style={{ backgroundColor: media.duong_dan }}></div>;
        }

        return null;
    };

    return (
        <div className="post-card">
            <div className="post-header">
                <img src={user.anh_dai_dien || 'default-avatar.png'} alt="user avatar" className="user-avatar" />
                <div className="user-info">
                    <span className="user-name">{user.ten_hien_thi}</span>
                    <span className="post-timestamp">{new Date(ngay_tao).toLocaleString()}</span>
                </div>
            </div>
            <p className="post-content">{noi_dung}</p>
            <div className="post-media">
                {renderMedia()}
            </div>
            <div className="post-actions">
                {/* Placeholder icons */}
                <span>👍 Like (0)</span>
                <span>💬 Comment (0)</span>
                <span>🔗 Share (0)</span>
            </div>
        </div>
    );
    
};

export default Post;
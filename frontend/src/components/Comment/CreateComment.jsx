import React, { useState } from 'react';
import axios from 'axios';
import './Comment.css';

const CreateComment = ({ postId, onCommentPosted }) => {
    const [noi_dung, setNoiDung] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!noi_dung.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${process.env.REACT_APP_API_URL}/posts/${postId}/comments`,
                { noi_dung },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            onCommentPosted(res.data);
            setNoiDung('');
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="create-comment-form">
            <input
                type="text"
                value={noi_dung}
                onChange={(e) => setNoiDung(e.target.value)}
                placeholder="Viết bình luận..."
                className="create-comment-input"
            />
            <button type="submit" className="create-comment-button">Gửi</button>
        </form>
    );
};

export default CreateComment;

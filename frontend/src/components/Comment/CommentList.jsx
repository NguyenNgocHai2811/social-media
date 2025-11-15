import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Comment from './Comment';
import CreateComment from './CreateComment';
import './Comment.css';

const CommentList = ({ postId }) => {
    const [comments, setComments] = useState([]);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(
                    `${process.env.REACT_APP_API_URL}/posts/${postId}/comments`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setComments(res.data);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        fetchComments();
    }, [postId]);

    const handleCommentPosted = (newComment) => {
        setComments([...comments, newComment]);
    };

    const handleCommentDeleted = async (commentId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${process.env.REACT_APP_API_URL}/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setComments(comments.filter(c => c.ma_binh_luan !== commentId));
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    // handleCommentUpdated có thể được triển khai sau

    return (
        <div className="comment-section">
            <CreateComment postId={postId} onCommentPosted={handleCommentPosted} />
            <div className="comment-list">
                {comments.map(comment => (
                    <Comment
                        key={comment.ma_binh_luan}
                        comment={comment}
                        onCommentDeleted={handleCommentDeleted}
                    />
                ))}
            </div>
        </div>
    );
};

export default CommentList;

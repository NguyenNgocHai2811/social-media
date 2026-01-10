import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Comment from './Comment';
import CreateComment from './CreateComment';
import './Comment.css';

const CommentList = ({ postId, onCommentCountChange, initialCommentCount, postAuthorId }) => {
    const [comments, setComments] = useState([]);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/posts/${postId}/comments`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setComments(res.data);
                if(onCommentCountChange) {
                    onCommentCountChange(res.data.length);
                    
                }
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        fetchComments();
    }, [postId, onCommentCountChange]);

    const handleCommentPosted = (newComment) => {
        const newComments = [...comments, newComment];
        setComments(newComments);
        if (onCommentCountChange) {
            onCommentCountChange(newComments.length);
        }
    };

    const handleCommentDeleted = async (commentId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/comments/${commentId}`, {
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
                        postAuthorId={postAuthorId}
                    />
                ))}
            </div>
        </div>
    );
};

export default CommentList;

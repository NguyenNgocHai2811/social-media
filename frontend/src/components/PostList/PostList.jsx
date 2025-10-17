import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Post from '../Post/Post';
import './PostList.css';

const PostList = ({ newPost }) => {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPosts = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get('http://localhost:3001/api/posts', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPosts(res.data);
            } catch (err) {
                setError('Failed to fetch posts.');
                console.error(err);
            }
        };

        fetchPosts();
    }, []);

    // Add new post to the top of the list when created
    useEffect(() => {
        if (newPost) {
            setPosts(prevPosts => [newPost, ...prevPosts]);
        }
    }, [newPost]);

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div className="post-list">
            {posts.map(post => (
                <Post key={post.ma_bai_dang} post={post} />
            ))}
        </div>
    );
};

export default PostList;
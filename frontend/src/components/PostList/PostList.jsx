import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Post from '../Post/Post';
import './PostList.css';
import './PostListTabs.css';

const PostList = ({ newPost }) => {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('Tất cả');
    
   

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

    const tabs = ['Tất cả', 'Bạn bè', 'Gần đây', 'Phổ biến'];

    return (
        <div className="post-list-container">
            <div className="post-list-header">
                <h3>Bài viết</h3>
                <div className="post-list-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
            <div className="post-list">
                {posts.map(post => (
                    <Post key={post.ma_bai_dang} post={post} />
                ))}
            </div>
        </div>
    );
};

export default PostList;
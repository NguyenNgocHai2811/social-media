import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Post from '../Post/Post';

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
        <div className="flex-grow flex flex-col">
            <div className="bg-white rounded-t-lg border-b border-gray-200 p-4">
                <div className="flex justify-between items-center">
                    <h3 className="m-0 text-lg font-bold">Bài viết</h3>
                    <div className="flex gap-5">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                className={`bg-transparent border-none py-2 px-1 text-base font-semibold cursor-pointer relative transition-colors duration-300 ${
                                    activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'
                                }`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <span className="absolute bottom-[-17px] left-0 right-0 h-1 bg-blue-600"></span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="overflow-y-auto flex-grow px-2">
                {posts.map(post => (
                    <Post key={post.ma_bai_dang} post={post} />
                ))}
            </div>
        </div>
    );
};

export default PostList;
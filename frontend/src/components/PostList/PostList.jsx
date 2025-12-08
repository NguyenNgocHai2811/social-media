import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Post from '../Post/Post';

const PostList = ({ userID, newPost, posts: postsFromProps }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('Tất cả');

    const isLocalhost = window.location.hostname === "localhost";
    const API_BASE = isLocalhost
        ? process.env.REACT_APP_API_URL
        : process.env.REACT_APP_API_URL_LAN;

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Authentication token not found.');
                    return;
                }

                let url;
                if (userID) {
                    // Nếu có userID -> Gọi API lấy bài của người đó (API này ĐÃ check like)
                    url = `${API_BASE}/api/posts/user/${userID}`;
                } else {
                    // Nếu không có userID -> Gọi API Newsfeed
                    url = `${API_BASE}/api/posts`;
                }

                const response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setPosts(response.data);
            } catch (err) {
                setError('Failed to fetch posts.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        // ƯU TIÊN 1: Nếu cha truyền bài viết trực tiếp (dùng cho trường hợp đặc biệt)
        if (postsFromProps && postsFromProps.length > 0) {
            setPosts(postsFromProps);
            setLoading(false);
        } else {
            // ƯU TIÊN 2: Tự gọi API để lấy dữ liệu chuẩn (có trạng thái Like)
            fetchPosts();
        }
    }, [userID, postsFromProps, API_BASE]);

    useEffect(() => {
        if (newPost) {
            setPosts(prevPosts => [newPost, ...prevPosts]);
        }
    }, [newPost]);

    if (loading) return <p className="text-center py-10">Loading posts...</p>;
    if (error) return <p className="text-red-600 p-4 text-center">{error}</p>;

    const tabs = ['Tất cả', 'Bạn bè', 'Gần đây', 'Phổ biến'];

    return (
        <div className="flex flex-col">
            <div className="bg-white rounded-t-lg border-b border-gray-200 p-4">
                <div className="flex justify-between items-center">
                    <h3 className="m-0 text-lg font-bold">Bài viết</h3>
                    <div className="flex gap-5">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                className={`bg-transparent border-none py-2 px-1 text-base font-semibold cursor-pointer relative transition-colors duration-300 ${activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'
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
            <div className="bg-white rounded-b-lg">
                {posts.length === 0 ? (
                    <p className="text-center py-10 text-gray-500">Chưa có bài viết nào</p>
                ) : (
                    posts.map(post => (
                        <Post key={post.ma_bai_dang} post={post} />
                    ))
                )}
            </div>
        </div>
    );
};

export default PostList;
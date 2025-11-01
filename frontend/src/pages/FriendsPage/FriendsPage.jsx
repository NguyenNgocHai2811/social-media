import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import defaultAvatar from '../../assets/images/default-avatar.jpg';
import Header from '../../components/Header/Header';
const FriendsPage = () => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE = window.location.hostname === "localhost" 
        ? process.env.REACT_APP_API_URL 
        : process.env.REACT_APP_API_URL_LAN;

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const response = await axios.get(`${API_BASE}/api/friends/friends`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setFriends(response.data);
            } catch (err) {
                setError('Failed to fetch friends.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchFriends();
    }, []);

    if (loading) {
        return <div className="text-center mt-8">Đang tải...</div>;
    }

    if (error) {
        return <div className="text-center mt-8 text-red-500">{error}</div>;
    }

    return (
        <>
        <Header></Header>
        <div className="container mx-auto p-4" style={{ maxWidth: '900px'}}>
             
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <h1 className="text-2xl font-bold mb-4">Tất cả bạn bè</h1>
                {friends.length === 0 ? (
                    <p>Chưa có bạn bè</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {friends.map(friend => (
                            <Link to={`/profile/${friend.ma_nguoi_dung}`} key={friend.ma_nguoi_dung} className="flex items-center p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                                <img
                                    src={friend.anh_dai_dien || defaultAvatar}
                                    alt={friend.ten_hien_thi}
                                    className="w-12 h-12 rounded-full object-cover mr-4"
                                />
                                <span className="font-semibold">{friend.ten_hien_thi}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
        </>
    );
    
};

export default FriendsPage;

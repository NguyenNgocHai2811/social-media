import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../components/Header/Header';
import { Link } from 'react-router-dom';
import defaultAvatar from '../../assets/images/default-avatar.jpg';

const FriendRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');
    const API_BASE = window.location.hostname === "localhost" 
        ? process.env.REACT_APP_API_URL 
        : process.env.REACT_APP_API_URL_LAN;

    useEffect(() => {
        const fetchFriendRequests = async () => {
            if (!token) {
                setError("Authentication required.");
                setIsLoading(false);
                return;
            }
            try {
                const response = await axios.get(`${API_BASE}/api/friends/requests`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRequests(response.data);
            } catch (err) {
                setError('Failed to fetch friend requests.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFriendRequests();
    }, [token, API_BASE]);

    const handleRequestAction = async (senderId, action) => {
        try {
            if (action === 'accept') {
                await axios.post(`${API_BASE}/api/friends/accept/${senderId}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else if (action === 'reject') {
                await axios.delete(`${API_BASE}/api/friends/reject/${senderId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setRequests(requests.filter(req => req.ma_nguoi_dung !== senderId));
        } catch (err) {
            console.error(`Failed to ${action} friend request`, err);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <Header />
            <div className="max-w-4xl mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold mb-6">Lời mời kết bạn</h1>
                {isLoading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className="text-red-600">{error}</p>
                ) : requests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {requests.map(request => (
                            <div key={request.ma_nguoi_dung} className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
                                <Link to={`/profile/${request.ma_nguoi_dung}`}>
                                    <img 
                                        src={request.anh_dai_dien || defaultAvatar} 
                                        alt={request.ten_hien_thi}
                                        className="w-24 h-24 rounded-full object-cover mb-4"
                                    />
                                </Link>
                                <Link to={`/profile/${request.ma_nguoi_dung}`} className="text-lg font-semibold hover:underline">
                                    {request.ten_hien_thi}
                                </Link>
                                <div className="mt-4 flex gap-x-2 w-full">
                                    <button 
                                        onClick={() => handleRequestAction(request.ma_nguoi_dung, 'accept')}
                                        className="flex-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
                                    >
                                        Chấp nhận
                                    </button>
                                    <button 
                                        onClick={() => handleRequestAction(request.ma_nguoi_dung, 'reject')}
                                        className="flex-1 bg-gray-300 text-black py-2 rounded-md hover:bg-gray-400 transition-colors"
                                    >
                                        Từ chối
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Bạn không có lời mời kết bạn nào.</p>
                )}
            </div>
        </div>
    );
};

export default FriendRequestsPage;

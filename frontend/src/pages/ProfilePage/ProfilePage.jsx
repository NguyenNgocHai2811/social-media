import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header/Header';
import PostList from '../../components/PostList/PostList';
import EditProfileModal from '../../components/EditProfileModal/EditProfileModal';
import Intro from '../../components/Intro/Intro';
import CreatePost from '../../components/CreatePost/CreatePost';
import defaultAvatar from '../../assets/images/default-avatar.jpg';
import defaultCover from '../../assets/images/default-avatar.jpg';
import { jwtDecode } from "jwt-decode";
import './ProfilePage.css';

const ProfilePage = () => {
    const { userId } = useParams();
    const [profileData, setProfileData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(''); // FIX: Đã thêm error state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [friendshipStatus, setFriendshipStatus] = useState(null);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const loggedInUserId = token ? jwtDecode(token).ma_nguoi_dung : null;

    const isLocalhost = window.location.hostname === "localhost";
    const API_BASE = isLocalhost
        ? process.env.REACT_APP_API_URL
        : process.env.REACT_APP_API_URL_LAN;

    const fetchProfileData = useCallback(async () => {
        if (!token) {
            setError("Authentication required.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const profileResponse = await axios.get(`${API_BASE}/api/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfileData(profileResponse.data);
            setPosts(profileResponse.data.posts || []);

            if (loggedInUserId !== userId) {
                const statusResponse = await axios.get(`${API_BASE}/api/friends/status/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFriendshipStatus(statusResponse.data.status);
            }
        } catch (err) {
            setError('Failed to fetch profile data.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [userId, token, API_BASE, loggedInUserId]);
   
    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const handleFriendAction = async (action) => {
        try {
            switch (action) {
                case 'add_friend':
                    await axios.post(`${API_BASE}/api/friends/request/${userId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
                    setFriendshipStatus('request_sent');
                    break;
                case 'cancel_request':
                    await axios.delete(`${API_BASE}/api/friends/request/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
                    setFriendshipStatus('not_friends');
                    break;
                case 'unfriend':
                    await axios.delete(`${API_BASE}/api/friends/unfriend/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
                    setFriendshipStatus('not_friends');
                    break;
                case 'respond_request':
                    navigate('/friend-requests');
                    break;
                default:
                    break;
            }
        } catch (err) {
            console.error("Friend action failed", err);
        }
    };

    const handleProfileUpdate = (updatedUser) => {
        setProfileData(prevData => ({
            ...prevData,
            user: { ...prevData.user, ...updatedUser }
        }));
    };



    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center min-h-screen text-red-600">{error}</div>;
    }

    if (!profileData || !profileData.user) {
        return <div className="flex items-center justify-center min-h-screen">User not found.</div>;
    }

    const { user, friendCount } = profileData;
    const isOwnProfile = user && loggedInUserId === user.ma_nguoi_dung;

    return (
        <div className="bg-gray-100 min-h-screen">
            <Header />
           <div className="relative bg-white rounded-b-lg shadow-sm mb-5 max-w-[950px] mx-auto z-20">
              <div className="h-96 overflow-hidden rounded-b-lg">
                    <img src={user.anh_bia || defaultCover} alt="Cover" className="w-full h-full object-cover block" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 flex items-end px-[30px] pb-5 bg-gradient-to-t from-black/60 to-transparent rounded-b-lg">
                    <div className="mr-4 -translate-y-2.5">
                        <img src={user.anh_dai_dien || defaultAvatar} alt="Profile" className="w-[70px] h-[70px] rounded-full border-4 border-white shadow-md object-cover" />
                    </div>
                    <div className="flex flex-col mb-[15px] flex-grow justify-center">
                        <h1 className="text-white text-3xl font-bold m-0 [text-shadow:1px_1px_3px_rgba(0,0,0,0.7)]">{user.ten_hien_thi}</h1>
                        <p className="text-white text-base mt-1 [text-shadow:1px_1px_3px_rgba(0,0,0,0.7)]">{friendCount || 0} bạn bè</p>
                    </div>
                    <div className="ml-auto mb-[15px]">
                        {isOwnProfile ? (
                            <button className="bg-slate-100 text-black py-2.5 px-[15px] rounded-md font-bold cursor-pointer transition-colors duration-300 hover:bg-gray-300" onClick={() => setIsEditModalOpen(true)}>
                                Chỉnh sửa trang cá nhân
                            </button>
                        ) : (
                            <>
                                {friendshipStatus === 'not_friends' && (
                                    <button className="bg-blue-500 text-white py-2.5 px-[15px] rounded-md font-bold cursor-pointer transition-colors duration-300 hover:bg-blue-600" onClick={() => handleFriendAction('add_friend')}>
                                        Thêm bạn bè
                                    </button>
                                )}
                                {friendshipStatus === 'request_sent' && (
                                    <button className="bg-gray-500 text-white py-2.5 px-[15px] rounded-md font-bold cursor-pointer transition-colors duration-300 hover:bg-gray-600" onClick={() => handleFriendAction('cancel_request')}>
                                        Đã gửi lời mời
                                    </button>
                                )}
                                {friendshipStatus === 'request_received' && (
                                    <button className="bg-green-500 text-white py-2.5 px-[15px] rounded-md font-bold cursor-pointer transition-colors duration-300 hover:bg-green-600" onClick={() => handleFriendAction('respond_request')}>
                                        Phản hồi lời mời
                                    </button>
                                )}
                                {friendshipStatus === 'friends' && (
                                    <button className="bg-red-500 text-white py-2.5 px-[15px] rounded-md font-bold cursor-pointer transition-colors duration-300 hover:bg-red-600" onClick={() => handleFriendAction('unfriend')}>
                                        Hủy kết bạn
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

           <div className="profile-content-area relative z-10">
                <div className="profile-left-column">
                    <div className="sticky-content">
                        <Intro user={user} />
                    </div>
                </div>
                <div className="profile-right-column">
                   
                    <PostList posts={posts} userId = {userId}/>
                </div>
            </div>

            {isEditModalOpen && (
                <EditProfileModal
                    user={user}
                    onClose={() => setIsEditModalOpen(false)}
                    onProfileUpdate={handleProfileUpdate}
                />
            )}
        </div>
    );
};

export default ProfilePage;
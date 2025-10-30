import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header/Header';
import EditProfileModal from '../../components/EditProfileModal/EditProfileModal';
import Intro from '../../components/Intro/Intro';
import PostList from '../../components/PostList/PostList';
import defaultAvatar from '../../assets/images/default-avatar.jpg';
import defaultCover from '../../assets/images/default-avatar.jpg';
import { jwtDecode } from "jwt-decode";

const ProfilePage = () => {
    const { userId } = useParams();
    const [profileData, setProfileData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(''); // FIX: Đã thêm error state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
            const response = await axios.get(`${API_BASE}/api/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(response)
            setProfileData(response.data);
            setPosts(response.data.posts || []);
        } catch (err) {
            setError('Failed to fetch profile data.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [userId, token, API_BASE]);
   
    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

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
            <div className="relative bg-white rounded-b-lg shadow-sm mb-5 max-w-[950px] mx-auto">
                <div className="max-h-[400px] overflow-hidden rounded-b-lg">
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
                        {isOwnProfile && (
                            <button className="bg-gray-200 text-black py-2.5 px-[15px] rounded-md font-bold cursor-pointer transition-colors duration-300 hover:bg-gray-300" onClick={() => setIsEditModalOpen(true)}>
                                Chỉnh sửa trang cá nhân
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* FIX: Layout đã được sửa lại */}
            <div className="max-w-[950px] mx-auto px-5 flex gap-5 pb-10">
                <div className="w-[35%]">
                    <div className="sticky top-5">
                        <Intro user={user} />
                    </div>
                </div>
                <div className="w-[65%]">
                    <PostList postsFromProps={posts} userId={userId} />
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
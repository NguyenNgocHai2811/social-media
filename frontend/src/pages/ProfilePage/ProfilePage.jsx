import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header/Header';
import PostList from '../../components/PostList/PostList';
import EditProfileModal from '../../components/EditProfileModal/EditProfileModal';
import './ProfilePage.css';
import defaultAvatar from '../../assets/images/default-avatar.jpg';
import defaultCover from '../../assets/images/default-avatar.jpg';
import { jwtDecode } from "jwt-decode";

const ProfilePage = () => {
    const { userId } = useParams();
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const token = localStorage.getItem('token');
    const loggedInUserId = token ? jwtDecode(token).ma_nguoi_dung : null;

    // Add the logic to determine the correct API base URL
    const isLocalhost = window.location.hostname === "localhost";
    const API_BASE = isLocalhost
        ? process.env.REACT_APP_API_URL
        : process.env.REACT_APP_API_URL_LAN;

    const fetchProfileData = useCallback(async () => {
        try {
            // Use the correct API_BASE for the axios call
            const response = await axios.get(`${API_BASE}/api/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfileData(response.data);
        } catch (err) {
            setError('Failed to fetch profile data.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [userId, token, API_BASE]);

    useEffect(() => {
        setIsLoading(true);
        fetchProfileData();
    }, [fetchProfileData]);

    const handleProfileUpdate = (updatedUser) => {
        setProfileData(prevData => ({
            ...prevData,
            user: { ...prevData.user, ...updatedUser }
        }));
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!profileData) {
        return <div>User not found.</div>;
    }

    const { user, posts, friendCount } = profileData;
    const isOwnProfile = user.ma_nguoi_dung === loggedInUserId;

    return (
        <div className="profile-page">
            <Header />
            <div className="profile-header">
                <div className="cover-photo-container">
                    <img src={user.anh_bia || defaultCover} alt="Cover" className="cover-photo" />
                </div>
                <div className="profile-info-container">
                    <div className="profile-picture-container">
                        <img src={user.anh_dai_dien || defaultAvatar} alt="Profile" className="profile-picture" />
                    </div>
                    <div className="profile-details">
                        <h1 className="profile-name">{user.ten_hien_thi}</h1>
                        <p className="profile-friend-count">{friendCount} bạn bè</p>
                    </div>
                    <div className="profile-actions">
                        {isOwnProfile && (
                            <button className="edit-profile-btn" onClick={() => setIsEditModalOpen(true)}>
                                Chỉnh sửa trang cá nhân
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="profile-content">
                {/* <PostList posts={posts} /> */}
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

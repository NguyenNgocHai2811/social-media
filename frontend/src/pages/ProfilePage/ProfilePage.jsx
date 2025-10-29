import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import userApi from '../../api/userApi';
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
    const loggedInUserId = token ? jwtDecode(token).id : null;
    
    const fetchProfileData = useCallback(async () => {
        try {
            const data = await userApi.getProfile(userId);
            setProfileData(data);
        } catch (err) {
            setError('Failed to fetch profile data.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

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
           <PostList posts={posts} />
           </div>
                   
    );
};

export default ProfilePage;

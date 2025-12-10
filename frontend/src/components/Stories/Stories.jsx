import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Stories.css';
import defaultAvatar from '../../assets/images/default-avatar.jpg';

const Stories = () => {
    const [stories, setStories] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedStory, setSelectedStory] = useState(null); // Story being viewed
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    // API Base URL
    const isLocalhost = window.location.hostname === "localhost";
    const API_BASE = isLocalhost
        ? process.env.REACT_APP_API_URL
        : process.env.REACT_APP_API_URL_LAN;

    // Helper to inject transformation into Cloudinary URL
    const getTransformedUrl = (url) => {
        if (!url) return '';
        // If it's a Cloudinary URL, inject 'du_12' (duration 12s)
        // Regex to find '/upload/' and append transformation
        if (url.includes('/upload/')) {
            // Check if already has transformation? Usually between /upload/ and /v<version>
            // We'll just insert after /upload/
            // du_12: limit duration to 12s
            // so_0: start offset 0 (default)
            // c_limit: crop limit? No, just duration.
            // fl_truncate_ts? No, eo_12 (end offset) works for trimming playback.
            // Cloudinary recommendation for "trimming video" for display: so_0,eo_12
            return url.replace('/upload/', '/upload/so_0,eo_12/');
        }
        return url;
    };

    // Fetch current user and friends' stories on mount
    useEffect(() => {
        const fetchUserAndStories = async () => {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            if (!token) return;

            try {
                // 1. Fetch Current User (for the "Add Story" card)
                const userRes = await axios.get(`${API_BASE}/api/users/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { ma_nguoi_dung: userId }
                });
                setCurrentUser(userRes.data);

                // 2. Fetch Stories
                const storiesRes = await axios.get(`${API_BASE}/api/stories`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStories(storiesRes.data);

            } catch (err) {
                console.error('Failed to load stories data:', err);
            }
        };

        fetchUserAndStories();
    }, [API_BASE]);

    // Handle File Selection
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation (Video only, maybe size check?)
        if (!file.type.startsWith('video/')) {
            alert('Vui lòng chọn file video (MP4).');
            return;
        }

        const formData = new FormData();
        formData.append('video', file);

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE}/api/stories`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Đã đăng tin thành công!');
            // Refresh stories? Or just wait for reload? 
            // For now, let's just clear the input.
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Có lỗi xảy ra khi đăng tin.');
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAddClick = () => {
        fileInputRef.current.click();
    };

    const openStory = (storyGroup) => {
        if (storyGroup.stories.length > 0) {
            setSelectedStory({
                user: storyGroup.user,
                videoUrl: storyGroup.stories[0].video_url // Newest story
            });
        }
    };

    const closeStory = () => {
        setSelectedStory(null);
    };

    return (
        <div className="stories-container">
            <h3 className="stories-title">Tin gần đây</h3>
            <div className="stories-scroll-container">
                {/* 1. Add Story Card */}
                <div className="story-card add-story-card" onClick={handleAddClick}>
                    <img 
                        src={currentUser?.anh_dai_dien || defaultAvatar} 
                        className="story-avatar add-story-avatar" 
                        alt="Me"
                    />
                    <div className="add-icon-container">
                        <span className="add-icon">+</span>
                    </div>
                    <span className="story-user">Tạo tin</span>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        accept="video/mp4,video/x-m4v,video/*"
                        onChange={handleFileChange}
                    />
                    {isLoading && <div className="loading-overlay">...</div>}
                </div>

                {/* 2. Friend Stories */}
                {stories.map((storyGroup, index) => (
                    <div 
                        key={index} 
                        className="story-card friend-story-card" 
                        onClick={() => openStory(storyGroup)}
                    >
                         {/* Fallback styling or thumbnail if possible */}
                         <div 
                            className="story-bg-image"
                            style={{ backgroundImage: `url(${storyGroup.stories[0].video_url.replace(/\.[^/.]+$/, ".jpg")})` }}
                         ></div>

                        <img 
                            src={storyGroup.user.anh_dai_dien || defaultAvatar} 
                            className="story-avatar" 
                            alt={storyGroup.user.ten_hien_thi} 
                        />
                        <span className="story-user">{storyGroup.user.ten_hien_thi}</span>
                    </div>
                ))}
            </div>

            {/* Viewer Modal */}
            {selectedStory && (
                <div className="story-modal-backdrop" onClick={closeStory}>
                    <div className="story-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-story-btn" onClick={closeStory}>×</button>
                        <div className="story-header">
                            <img 
                                src={selectedStory.user.anh_dai_dien || defaultAvatar} 
                                className="story-header-avatar"
                                alt="Author"
                            />
                            <span className="story-header-name">{selectedStory.user.ten_hien_thi}</span>
                        </div>
                        <video 
                            controls 
                            autoPlay 
                            src={getTransformedUrl(selectedStory.videoUrl)} 
                            className="story-video-player"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stories;

import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import PostList from '../../components/PostList/PostList';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import RightSidebar from '../../components/RightSidebar/RightSidebar';
import Stories from '../../components/Stories/Stories';
import './NewsFeed.css';

const NewsFeed = () => {
    const [newPost, setNewPost] = useState(null);

    // Placeholder for post creation logic
    const handlePostCreated = (post) => {
        setNewPost(post);
    };

    return (
        <>
            <Header />
            <div className="newsfeed-container">
                <aside className="left-sidebar">
                    <LeftSidebar />
                </aside>
                <main className="main-content">
                    <Stories />
                    {/* We can re-integrate CreatePost here later if needed */}
                    <PostList newPost={newPost} />
                </main>
                <aside className="right-sidebar">
                    <RightSidebar />
                </aside>
            </div>
        </>
    );
};

export default NewsFeed;
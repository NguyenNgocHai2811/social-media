import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import PostList from '../../components/PostList/PostList';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import RightSidebar from '../../components/RightSidebar/RightSidebar';
import Stories from '../../components/Stories/Stories';
import './NewsFeed.css';
import CreatePost from '../../components/CreatePost/CreatePost';

const NewsFeed = () => {
    const [newPost, setNewPost] = useState(null);
    const [showCreatePost, setShowCreatePost] = useState(false);

    // Placeholder for post creation logic
    const handlePostCreated = (post) => {
        setNewPost(post);
        setShowCreatePost(false);
    };
    const toggleCreatePost = () =>{
        setShowCreatePost(!showCreatePost);
    }

    return (
        <>
            <Header />
            <div className="newsfeed-container">
                <aside className="left-sidebar">
                   <LeftSidebar onPostClick={toggleCreatePost}/>
                </aside>
                <main className="main-content">
                    <Stories />
                    {showCreatePost && <CreatePost onPostCreated={handlePostCreated}/>}
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
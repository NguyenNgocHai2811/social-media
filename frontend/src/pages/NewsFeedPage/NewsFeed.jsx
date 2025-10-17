import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import CreatePost from '../../components/CreatePost/CreatePost';
import PostList from '../../components/PostList/PostList';
import { useNavigate } from 'react-router-dom';

const NewsFeed = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPost, setNewPost] = useState(null);
    const navigate = useNavigate();
    const handlePostCreated = (post) => {
        setNewPost(post);
    };
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login')
    }
    

    return (
        <div>
            <Header />
            <main style={{ padding: '1rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <button onClick={() => setIsModalOpen(true)} style={{ padding: '0.5rem 1rem' }}>
                        Create New Post
                    </button>
                </div>
                <button onClick={handleLogout} className="logout-button">
            Đăng xuất
          </button>
                
                {isModalOpen && (
                    <CreatePost 
                        onClose={() => setIsModalOpen(false)} 
                        onPostCreated={handlePostCreated}
                    />
                )}

                <PostList newPost={newPost} />
            </main>
        </div>
    );
};

export default NewsFeed;
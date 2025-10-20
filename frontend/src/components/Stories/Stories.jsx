import React from 'react';
import './Stories.css';

const Stories = () => {
    // Mock data for stories
    const stories = [
        { id: 1, user: 'Nguyen Ngoc Hai', image: 'https://via.placeholder.com/110x200/1', avatar: 'https://via.placeholder.com/40/1' },
        { id: 2, user: 'Tran Van An', image: 'https://via.placeholder.com/110x200/2', avatar: 'https://via.placeholder.com/40/2' },
        { id: 3, user: 'Le Thi Binh', image: 'https://via.placeholder.com/110x200/3', avatar: 'https://via.placeholder.com/40/3' },
        { id: 4, user: 'Pham Minh Chien', image: 'https://via.placeholder.com/110x200/4', avatar: 'https://via.placeholder.com/40/4' },
        { id: 5, user: 'Vo Thi Dao', image: 'https://via.placeholder.com/110x200/5', avatar: 'https://via.placeholder.com/40/5' },
        { id: 6, user: 'Do Xuan E', image: 'https://via.placeholder.com/110x200/6', avatar: 'https://via.placeholder.com/40/6' },
    ];

    return (
        <div className="stories-container">
            <h3 className="stories-title">Tin gần đây</h3>
            <div className="stories-scroll-container">
                {stories.map(story => (
                    <div key={story.id} className="story-card" style={{ backgroundImage: `url(${story.image})` }}>
                        <img src={story.avatar} alt={`${story.user}'s avatar`} className="story-avatar" />
                        <span className="story-user">{story.user}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Stories;
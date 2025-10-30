import React from 'react';
import './Stories.css';

const Stories = () => {
    // Mock data for stories
    const stories = [
        { id: 1, user: 'Nguyen Ngoc Hai' },
        { id: 2, user: 'Tran Van An' },
        { id: 3, user: 'Le Thi Binh' },
        { id: 4, user: 'Pham Minh Chien' },
        { id: 5, user: 'Vo Thi Dao' },
        { id: 6, user: 'Do Xuan E' },
    ];

    return (
        <div className="stories-container">
            <h3 className="stories-title">Tin gần đây</h3>
            <div className="stories-scroll-container">
                {stories.map(story => (
                    <div key={story.id} className="story-card" >
                        <img className="story-avatar" />
                        <span className="story-user">{story.user}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Stories;
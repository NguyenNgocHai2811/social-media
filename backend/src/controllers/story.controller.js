const storyService = require('../services/story.service');

const createStory = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No video file uploaded' });
        }

        const userId = req.user.ma_nguoi_dung;
        const videoUrl = req.file.path;
        const publicId = req.file.filename; // Cloudinary public_id

        const newStory = await storyService.createStory(userId, videoUrl, publicId);

        res.status(201).json(newStory);
    } catch (error) {
        console.error('Error creating story:', error);
        res.status(500).json({ message: 'Failed to create story', error: error.message });
    }
};

const getFriendStories = async (req, res) => {
    try {
        const userId = req.user.ma_nguoi_dung;
        const stories = await storyService.getFriendStories(userId);
        res.status(200).json(stories);
    } catch (error) {
        console.error('Error fetching stories:', error);
        res.status(500).json({ message: 'Failed to fetch stories', error: error.message });
    }
};

module.exports = {
    createStory,
    getFriendStories
};

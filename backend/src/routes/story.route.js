const express = require('express');
const router = express.Router();
const storyController = require('../controllers/story.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { uploadStoryVideo } = require('../middleware/upload.middleware');

// Create a new story (upload video)
router.post('/', verifyToken, uploadStoryVideo.single('video'), storyController.createStory);

// Get friends' stories
router.get('/', verifyToken, storyController.getFriendStories);

module.exports = router;

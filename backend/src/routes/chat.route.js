const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.use(verifyToken);

router.post('/send', chatController.sendMessage);
router.get('/conversations', chatController.getConversations);
router.get('/messages/:partnerId', chatController.getMessages);
router.put('/read', chatController.markAsRead);
router.get('/unread-count', chatController.getUnreadCount);

module.exports = router;

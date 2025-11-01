const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friend.controller');
const authMiddleware = require('../middleware/auth.middleware');

// get friendship status
router.get('/status/:userId',authMiddleware.verifyToken, friendController.getFriendshipStatus);

// send friend request
router.post('/request/:userId', authMiddleware.verifyToken, friendController.sendFriendRequest);

// cancel friend request 
router.delete('/request/:userId', authMiddleware.verifyToken,friendController.cancelFriendRequest);

// get pending friend request
router.get('/requests',authMiddleware.verifyToken, friendController.getFriendRequest);

// Accept friend request
router.post('/accept/:userId', authMiddleware.verifyToken, friendController.acceptFriendRequest);

// Reject friend request 
router.delete('reject/:userId',authMiddleware.verifyToken, friendController.rejectFriendRequest);

// unfriend user
router.delete('/unfriend/:userId',authMiddleware.verifyToken,friendController.unFriendUser);



module.exports = router;
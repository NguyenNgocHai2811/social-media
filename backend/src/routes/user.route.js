const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { uploadProfileImages } = require('../middleware/upload.middleware');

router.get('/me', authMiddleware.verifyToken, userController.getMe);
router.get('/:userId', authMiddleware.verifyToken, userController.getUserProfile);

// Route to update the current authenticated user's profile
// This can handle both text data and file uploads for avatar and cover photo
router.put(
    '/me',
    authMiddleware.verifyToken,
    uploadProfileImages.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'anh_bia', maxCount: 1 }
    ]),
    userController.updateUserProfile
);

module.exports = router;

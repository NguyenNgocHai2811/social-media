const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { uploadAvatar } = require('../middleware/upload.middleware');

router.get('/me', authMiddleware.verifyToken, userController.getUserProfile);

router.put(
    '/me',
    authMiddleware.verifyToken,
    uploadAvatar.single('avatar'),
    userController.updateUserProfile
);

module.exports = router;
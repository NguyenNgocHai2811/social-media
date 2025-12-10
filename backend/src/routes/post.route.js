const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { uploadPostImage } = require('../middleware/upload.middleware');
const commentRoutes = require('./comment.route');

router.get('/', authMiddleware.verifyToken, postController.getAllPosts);
router.post('/', authMiddleware.verifyToken, uploadPostImage.single('image'), postController.createPost);

// Nested route for comments on a specific post
router.use('/:ma_bai_dang/comments', commentRoutes);

// Like post
router.post('/:id/like', authMiddleware.verifyToken, postController.likePost);

// Delete post
router.delete('/:id', authMiddleware.verifyToken, postController.deletePost);

// Get posts by user
router.get('/user/:userId', authMiddleware.verifyToken, postController.getPostsByUser);

module.exports = router;
const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { uploadPostImage } = require('../middleware/upload.middleware');
const commentRoutes = require('./comment.route');

router.get('/', authMiddleware.verifyToken, postController.getAllPosts);
router.post('/',authMiddleware.verifyToken, uploadPostImage.single('image'), postController.createPost);

// Nested route for comments on a specific post
console.log("da vao post route");
router.use('/:ma_bai_dang/comments', commentRoutes);

module.exports = router;
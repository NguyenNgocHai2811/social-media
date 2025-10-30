const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { uploadPostImage } = require('../middleware/upload.middleware');

router.get('/', authMiddleware.verifyToken, postController.getAllPosts);
router.post('/',authMiddleware.verifyToken, uploadPostImage.single('image'), postController.createPost);
module.exports = router;
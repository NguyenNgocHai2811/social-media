const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.post('/',authMiddleware.verifyToken, upload.single('image'), postController.createPost);
router.get('/', authMiddleware.verifyToken, postController.getAllPosts);

module.exports = router;
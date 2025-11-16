const express = require('express');
const router = express.Router({ mergeParams: true });
const commentController = require('../controllers/comment.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Định tuyến lồng nhau: /api/posts/:ma_bai_dang/comments
router.route('/')
    .post(verifyToken, commentController.creatComment)
    .get(verifyToken, commentController.getCommentsByPostId);

// Các định tuyến này cần đứng riêng để không bị xung đột params
// /api/comments/:ma_binh_luan
router.route('/:ma_binh_luan')
    .put(verifyToken, commentController.updateComment)
    .delete(verifyToken, commentController.deleteComment);

module.exports = router;

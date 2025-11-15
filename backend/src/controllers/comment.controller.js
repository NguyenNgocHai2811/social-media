const commentService = require('../services/comment.service');

/**
 * @desc Tạo một bình luận mới.
 */
const createComment = async (req, res) => {
    try {
        const { ma_bai_dang } = req.params;
        const { ma_nguoi_dung } = req.user; // Lấy từ middleware xác thực
        const { noi_dung } = req.body;

        if (!noi_dung) {
            return res.status(400).json({ message: 'Comment content cannot be empty.' });
        }

        const newComment = await commentService.createComment(ma_bai_dang, ma_nguoi_dung, noi_dung);
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Lấy tất cả bình luận của một bài đăng.
 */
const getCommentsByPostId = async (req, res) => {
    try {
        const { ma_bai_dang } = req.params;
        const comments = await commentService.getCommentsByPostId(ma_bai_dang);
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Cập nhật một bình luận.
 */
const updateComment = async (req, res) => {
    try {
        const { ma_binh_luan } = req.params;
        const { ma_nguoi_dung } = req.user;
        const { noi_dung } = req.body;

        if (!noi_dung) {
            return res.status(400).json({ message: 'Comment content cannot be empty.' });
        }

        const updatedComment = await commentService.updateComment(ma_binh_luan, noi_dung, ma_nguoi_dung);
        res.status(200).json(updatedComment);
    } catch (error) {
        res.status(404).json({ message: error.message }); // 404 nếu không tìm thấy bình luận hoặc không có quyền
    }
};

/**
 * @desc Xóa một bình luận.
 */
const deleteComment = async (req, res) => {
    try {
        const { ma_binh_luan } = req.params;
        const { ma_nguoi_dung } = req.user;

        await commentService.deleteComment(ma_binh_luan, ma_nguoi_dung);
        res.status(204).send(); // 204 No Content
    } catch (error) {
        res.status(404).json({ message: error.message }); // 404 nếu không tìm thấy hoặc không có quyền
    }
};

module.exports = {
    createComment,
    getCommentsByPostId,
    updateComment,
    deleteComment,
};

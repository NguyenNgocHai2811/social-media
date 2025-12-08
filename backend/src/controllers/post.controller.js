const { error } = require('neo4j-driver');
const postService = require('../services/post.service');

const createPost = async (req, res) => {
    try {
        const { noi_dung, che_do_rieng_tu } = req.body;
        const userId = req.user.ma_nguoi_dung;

        const postData = {
            noi_dung,
            che_do_rieng_tu,
            ma_nguoi_dung: userId,
            imageFile: req.file,
        };

        const newPost = await postService.createPost(postData);
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllPosts = async (req, res) => {
    try {
        // Lấy ID user nếu đã đăng nhập, nếu chưa thì là null
        const currentUserId = req.user ? req.user.ma_nguoi_dung : null;

        const posts = await postService.getAllPosts(currentUserId);
        res.status(200).json(posts);
    } catch (error) {
        console.error("Controller Error:", error.message); // Log lỗi controller
        res.status(500).json({ message: error.message });
    }
};

const getPostsByUser = async (req, res) => {
    try {
        // ID của người đang xem (lấy từ token)
        const currentUserId = req.user ? req.user.ma_nguoi_dung : null;

        // ID của profile đang xem (lấy từ URL)
        const targetUserId = req.params.userId;

        const posts = await postService.getPostsByUserId(currentUserId, targetUserId);
        res.status(200).json(posts);
    } catch (error) {
        console.error("Error getting user posts:", error);
        res.status(500).json({ message: error.message });
    }
};

const likePost = async (req, res) => {
    try {
        const userId = req.user.ma_nguoi_dung;
        const postId = req.params.id;

        const result = await postService.toggleLikePost(userId, postId);

        // Trả về cả trạng thái lẫn số lượng mới
        return res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deletePost = async (req, res) => {
    try {
        const userId = req.user.ma_nguoi_dung;
        const postId = req.params.id

        const wasDeleted = await postService.deletePost(userId, postId)
        console.log('UserId', userId, 'postId', postId);
        // console.log('Delete result:', result)
        if (wasDeleted) {
            // Xóa thành công
            return res.status(200).json({ message: 'Post deleted successfully' });
        } else {
            // Không tìm thấy bài viết hoặc không có quyền
            // (Vì MATCH không tìm thấy gì)
            return res.status(403).json({ message: 'Post not found or user not authorized' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
module.exports = {
    createPost,
    getAllPosts,
    likePost,
    deletePost,
    getPostsByUser
};
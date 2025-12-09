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
        const posts = await postService.getAllPosts();
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const likePost = async (req, res) => {
    try {
        const userId = req.user.ma_nguoi_dung;
        const postId = req.params.id;

        const result = await postService.toggleLikePost(userId, postId);

        if (result.error) {
            return res.status(404).json({
                success: false,
                message: result.error
            });
        }

        res.json({
            success: true,
            message: result.message,
            data: { action: result.message }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deletePost = async(req, res) => {
    try {
        const userId = req.user.ma_nguoi_dung;
        const postId = req.params.id;

        const wasDeleted = await postService.deletePost(userId, postId);

        if (wasDeleted) {
            return res.json({
                success: true,
                message: "Bài viết đã được xóa thành công"
            });
        } else {
            return res.status(403).json({
                success: false,
                message: "Bài viết không tồn tại hoặc bạn không có quyền xóa"
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
module.exports = {
    createPost,
    getAllPosts,
    likePost,
    deletePost
};
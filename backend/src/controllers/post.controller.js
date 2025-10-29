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

module.exports = {
    createPost,
    getAllPosts,
};
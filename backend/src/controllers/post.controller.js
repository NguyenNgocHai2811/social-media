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
        const postId = req.params.id // id từ bài viết trên url
        console.log(req.user)   
        const result =  await postService.toggleLikePost(userId, postId)
        console.log("userId:", userId, "postId:", postId);
        console.log('like result: ', result)
        return res.json({message: result.message});
    }catch(error){
        res.status(500).json({message: error.message})
    }
}

const deletePost = async(req, res) => {
    try{
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
    }catch(error){
        res.status(500).json({message: error.message})
    }
}
module.exports = {
    createPost,
    getAllPosts,
    likePost,
    deletePost
};
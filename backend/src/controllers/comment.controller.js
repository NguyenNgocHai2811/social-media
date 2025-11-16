const commentService = require('../services/comment.service');

// tao binh luan moi
const creatComment = async (req , res) => {
    try {
        const {ma_bai_dang} = req.params;
        const {ma_nguoi_dung} = req.user; // lay tu middware xac thuc
        const {noi_dung} = req.body;

        if(!noi_dung) {
            return res.status(400).json({message: 'Comment content cannot be empty'});
        }
        const newComment = await commentService.createComment(ma_bai_dang, ma_nguoi_dung, noi_dung);
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// lay tat ca cac binh luan
const getCommentsByPostId = async(req , res) => {
    try {
        const {ma_bai_dang} = req.params;
        const comments = await commentService.getCommentsByPostId(ma_bai_dang);
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

// cap nhat mot binh luan

const updateComment = async(req, res) => {
    try{
        const {ma_binh_luan} = req.params;
        const {ma_nguoi_dung} = req.user;
        const {noi_dung} = req.body;
        
        if (!noi_dung) {
            return res.status(400).json({ message: 'Comment content cannot be empty.' });
        }

        const updateComment = await commentService.updateComment(ma_binh_luan,noi_dung,ma_nguoi_dung);
        res.status(200).json(updateComment);
    } catch (error) {
        res.status(404).json({message: error.message})
    }
};

// xoa binh luan
const deleteComment = async (req, res)=> {
    try {
        const {ma_binh_luan} = req.params;
        const {ma_nguoi_dung} = req.user;

        await commentService.deleteComment(ma_binh_luan, ma_nguoi_dung);
        res.status(204).send();
    } catch (error){
        res.status(404).json({ message: error.message});
    }
};

module.exports = {
    creatComment,
    getCommentsByPostId,
    updateComment,
    deleteComment
}
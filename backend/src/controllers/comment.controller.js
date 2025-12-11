const commentService = require('../services/comment.service');
const notificationService = require('../services/notification.service');
const postService = require('../services/post.service');
const { getIO } = require('../socket');
// Remove getSession import as we moved DB logic to service
// const { getSession } = require('../config/neo4j'); 

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

        // --- NOTIFICATION LOGIC ---
        try {
            const authorId = await postService.getPostAuthorId(ma_bai_dang);
            
            if (authorId && authorId !== ma_nguoi_dung) {
                const notification = await notificationService.createNotification({
                    recipientId: authorId,
                    senderId: ma_nguoi_dung,
                    type: 'COMMENT',
                    content: `${req.user.ten_hien_thi} đã bình luận về bài viết của bạn`,
                    relatedId: ma_bai_dang
                });

                // Enrich notification with sender info for real-time display
                const notificationWithSender = {
                    ...notification,
                    sender: {
                        ma_nguoi_dung: ma_nguoi_dung,
                        ten_hien_thi: req.user.ten_hien_thi,
                        anh_dai_dien: req.user.anh_dai_dien
                    }
                };

                try {
                    const io = getIO();
                    io.to(authorId).emit('newNotification', notificationWithSender);
                } catch (socketError) {
                    console.error('Socket emit error:', socketError);
                }
            }
        } catch (dbError) {
             console.error('Error fetching post author for notification:', dbError);
        }
        // --------------------------

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
const { getSession } = require('../config/neo4j');
const { v4: uuidv4 } = require('uuid');

/**
 * @desc Tạo một bình luận mới cho một bài đăng.
 * @param {string} ma_bai_dang - ID của bài đăng.
 * @param {string} ma_nguoi_dung - ID của người dùng đang bình luận.
 * @param {string} noi_dung - Nội dung của bình luận.
 * @returns {Promise<object>} Bình luận vừa được tạo.
 */
const createComment = async (ma_bai_dang, ma_nguoi_dung, noi_dung) => {
    const session = getSession();
    try {
        const ma_binh_luan = uuidv4();
        const now = new Date().toISOString();

        const result = await session.run(
            `MATCH (u:NguoiDung {ma_nguoi_dung: $ma_nguoi_dung})
             MATCH (p:BaiDang {ma_bai_dang: $ma_bai_dang})
             CREATE (c:BinhLuan {
                ma_binh_luan: $ma_binh_luan,
                noi_dung: $noi_dung,
                thoi_gian_tao: $now
             })
             CREATE (u)-[:DA_BINH_lUAN]->(c)
             CREATE (p)-[:CO_BINH_LUAN]->(c)
             RETURN c, u`,
            { ma_nguoi_dung, ma_bai_dang, ma_binh_luan, noi_dung, now }
        );

        if (result.records.length === 0) {
            throw new Error('User or Post not found, or comment could not be created.');
        }

        const newComment = result.records[0].get('c').properties;
        const user = result.records[0].get('u').properties;

        delete user.mat_khau;
        delete user.email;

        newComment.user = user;

        return newComment;
    } catch (error) {
        console.error("Error creating comment:", error);
        throw new Error('Could not create comment. ' + error.message);
    } finally {
        await session.close();
    }
};

/**
 * @desc Lấy tất cả bình luận của một bài đăng.
 * @param {string} ma_bai_dang - ID của bài đăng.
 * @returns {Promise<Array<object>>} Danh sách các bình luận.
 */
const getCommentsByPostId = async (ma_bai_dang) => {
    const session = getSession();
    try {
        const result = await session.run(
            `MATCH (p:BaiDang {ma_bai_dang: $ma_bai_dang})-[:CO_BINH_LUAN]->(c:BinhLuan)<-[:DA_BINH_lUAN]-(u:NguoiDung)
             RETURN c, u
             ORDER BY c.thoi_gian_tao ASC`,
            { ma_bai_dang }
        );

        const comments = result.records.map(record => {
            const comment = record.get('c').properties;
            const user = record.get('u').properties;

            delete user.mat_khau;
            delete user.email;

            comment.user = user;
            return comment;
        });

        return comments;
    } catch (error) {
        console.error("Error fetching comments:", error);
        throw new Error('Could not fetch comments. ' + error.message);
    } finally {
        await session.close();
    }
};

/**
 * @desc Cập nhật một bình luận.
 * @param {string} ma_binh_luan - ID của bình luận.
 * @param {string} noi_dung - Nội dung mới của bình luận.
 * @param {string} ma_nguoi_dung - ID của người dùng yêu cầu cập nhật.
 * @returns {Promise<object>} Bình luận đã được cập nhật.
 */
const updateComment = async (ma_binh_luan, noi_dung, ma_nguoi_dung) => {
    const session = getSession();
    try {
        const result = await session.run(
            `MATCH (u:NguoiDung {ma_nguoi_dung: $ma_nguoi_dung})-[:DA_BINH_lUAN]->(c:BinhLuan {ma_binh_luan: $ma_binh_luan})
             SET c.noi_dung = $noi_dung
             RETURN c`,
            { ma_nguoi_dung, ma_binh_luan, noi_dung }
        );

        if (result.records.length === 0) {
            throw new Error('Comment not found or user does not have permission to update.');
        }

        return result.records[0].get('c').properties;
    } catch (error) {
        console.error("Error updating comment:", error);
        throw new Error('Could not update comment. ' + error.message);
    } finally {
        await session.close();
    }
};

/**
 * @desc Xóa một bình luận.
 * @param {string} ma_binh_luan - ID của bình luận.
 * @param {string} ma_nguoi_dung - ID của người dùng yêu cầu xóa (phải là chủ sở hữu bình luận hoặc chủ bài đăng).
 * @returns {Promise<void>}
 */
const deleteComment = async (ma_binh_luan, ma_nguoi_dung) => {
    const session = getSession();
    try {
        // Kiểm tra xem người dùng có phải là chủ sở hữu bình luận hoặc chủ bài đăng không
        const permissionCheck = await session.run(
            `MATCH (c:BinhLuan {ma_binh_luan: $ma_binh_luan})
             OPTIONAL MATCH (c)<-[:DA_BINH_lUAN]-(commentOwner:NguoiDung {ma_nguoi_dung: $ma_nguoi_dung})
             OPTIONAL MATCH (c)<-[:CO_BINH_LUAN]-(p:BaiDang)<-[:DANG_BAI]-(postOwner:NguoiDung {ma_nguoi_dung: $ma_nguoi_dung})
             RETURN commentOwner, postOwner`,
            { ma_binh_luan, ma_nguoi_dung }
        );

        const record = permissionCheck.records[0];
        if (!record || (!record.get('commentOwner') && !record.get('postOwner'))) {
            throw new Error('User does not have permission to delete this comment.');
        }

        // Nếu có quyền, tiến hành xóa
        await session.run(
            `MATCH (c:BinhLuan {ma_binh_luan: $ma_binh_luan})
             DETACH DELETE c`,
            { ma_binh_luan }
        );

    } catch (error) {
        console.error("Error deleting comment:", error);
        throw new Error('Could not delete comment. ' + error.message);
    } finally {
        await session.close();
    }
};


module.exports = {
    createComment,
    getCommentsByPostId,
    updateComment,
    deleteComment,
};

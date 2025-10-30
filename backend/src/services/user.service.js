const { getSession } = require('../config/neo4j');
const cloudinary = require('../config/cloudinary');
const { v4: uuidv4 } = require('uuid');

const getUserById = async (userId) => {
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (u:NguoiDung {ma_nguoi_dung: $userId}) RETURN u',
            { userId }
        );

        if (result.records.length === 0) {
            throw new Error('User not found');
        }

        const user = result.records[0].get('u').properties;
        // Do not return the password
        delete user.mat_khau;
        return user;
    } finally {
        await session.close();
    }
};

const getUserProfileWithPosts = async (userId) => {
    const session = getSession();
    try {
        // Step 1: Get user profile
        const userResult = await session.run(
            'MATCH (u:NguoiDung {ma_nguoi_dung: $userId}) RETURN u',
            { userId }
        );

        if (userResult.records.length === 0) {
            throw new Error('User not found');
        }

        const user = userResult.records[0].get('u').properties;
        delete user.mat_khau;
        delete user.email;

        // Step 2: Get user's posts
        const postsResult = await session.run(
            `
            MATCH (author:NguoiDung {ma_nguoi_dung: $userId})-[r:DANG_BAI]->(post:BaiDang)
            OPTIONAL MATCH (post)-[:CO_MEDIA]->(media:Media)
            RETURN post, media, author
            ORDER BY post.thoi_gian_dang DESC
            `,
            { userId }
        );

        const posts = postsResult.records.map(record => {
            const post = record.get('post').properties;
            const media = record.get('media');
            const author = record.get('author').properties;
            delete author.mat_khau;
            delete author.email;
            return {
                ...post,
                media: media ? media.properties : null,
                user: author
            };
        });

        // Step 3: Get friend count (we'll implement this properly later)
        // For now, let's return a placeholder
        const friendCount = 0; // Placeholder

        return { user, posts, friendCount };

    } finally {
        await session.close();
    }
}


const updateUserProfile = async (userId, profileData, files) => {
    const session = getSession();
    try {
        const setClauses = [];
        const params = { userId };
        const { ten_hien_thi, song_o_dau, tinh_trang_quan_he, gioi_thieu } = profileData;

        // Handle text fields
        if (ten_hien_thi) {
            setClauses.push('u.ten_hien_thi = $ten_hien_thi');
            params.ten_hien_thi = ten_hien_thi;
        }
        if (song_o_dau) {
            setClauses.push('u.song_o_dau = $song_o_dau');
            params.song_o_dau = song_o_dau;
        }
        if (tinh_trang_quan_he) {
            setClauses.push('u.tinh_trang_quan_he = $tinh_trang_quan_he');
            params.tinh_trang_quan_he = tinh_trang_quan_he;
        }
        if (gioi_thieu) {
            setClauses.push('u.gioi_thieu = $gioi_thieu');
            params.gioi_thieu = gioi_thieu;
        }

        // Get current public IDs for potential deletion
        const userResult = await session.run(
            'MATCH (u:NguoiDung {ma_nguoi_dung: $userId}) RETURN u.avatar_public_id, u.anh_bia_public_id',
            { userId }
        );

        const oldAvatarPublicId = userResult.records.length > 0 ? userResult.records[0].get('u.avatar_public_id') : null;
        const oldAnhBiaPublicId = userResult.records.length > 0 ? userResult.records[0].get('u.anh_bia_public_id') : null;

        // Handle avatar file
        if (files && files.avatar) {
            const avatarFile = files.avatar[0];
            if (oldAvatarPublicId) {
                cloudinary.uploader.destroy(oldAvatarPublicId).catch(err => {
                    console.error("Failed to delete old avatar from Cloudinary:", err);
                });
            }
            setClauses.push('u.anh_dai_dien = $avatarUrl, u.avatar_public_id = $avatarPublicId');
            params.avatarUrl = avatarFile.path;
            params.avatarPublicId = avatarFile.filename;
        }

        // Handle cover photo file
        if (files && files.anh_bia) {
            const anhBiaFile = files.anh_bia[0];
            if (oldAnhBiaPublicId) {
                cloudinary.uploader.destroy(oldAnhBiaPublicId).catch(err => {
                    console.error("Failed to delete old cover photo from Cloudinary:", err);
                });
            }
            setClauses.push('u.anh_bia = $anhBiaUrl, u.anh_bia_public_id = $anhBiaPublicId');
            params.anhBiaUrl = anhBiaFile.path;
            params.anhBiaPublicId = anhBiaFile.filename;
        }


        if (setClauses.length === 0) {
            // Nothing to update
            return await getUserById(userId);
        }

        const query = `
            MATCH (u:NguoiDung {ma_nguoi_dung: $userId})
            SET ${setClauses.join(', ')}
            RETURN u
        `;

        const result = await session.run(query, params);

        if (result.records.length === 0) {
            throw new Error('User not found, could not update profile.');
        }

        const updatedUser = result.records[0].get('u').properties;
        delete updatedUser.mat_khau;
        return updatedUser;

    } catch (error) {
        console.error("Error updating user profile in service:", error);
        throw error;
    }
    finally {
        await session.close();
    }
};


module.exports = {
    getUserById,
    updateUserProfile,
    getUserProfileWithPosts,
};

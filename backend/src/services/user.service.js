const { getSession } = require('../config/neo4j');

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

const updateUserAvatar = async (userId, file) => {
    const session = getSession();
    try {
        // First, get the current user data to find the old avatar's public_id
        const userResult = await session.run(
            'MATCH (u:NguoiDung {ma_nguoi_dung: $userId}) RETURN u.avatar_public_id as avatar_public_id',
            { userId }
        );

        if (userResult.records.length > 0) {
            const oldPublicId = userResult.records[0].get('avatar_public_id');
            if (oldPublicId) {
                // Asynchronously delete the old image from Cloudinary
                cloudinary.uploader.destroy(oldPublicId).catch(err => {
                    console.error("Failed to delete old avatar from Cloudinary:", err);
                });
            }
        }

        // Now, update the user node with the new avatar info
        const result = await session.run(
            `MATCH (u:NguoiDung {ma_nguoi_dung: $userId})
             SET u.anh_dai_dien = $avatarUrl, u.avatar_public_id = $publicId
             RETURN u`,
            {
                userId,
                avatarUrl: file.path, // This is the secure_url from Cloudinary
                publicId: file.filename, // This is the public_id from Cloudinary
            }
        );

        if (result.records.length === 0) {
            // This case should ideally not happen if the user exists
            throw new Error('User not found during avatar update.');
        }

        const updatedUser = result.records[0].get('u').properties;
        delete updatedUser.mat_khau;
        return updatedUser;

    } finally {
        await session.close();
    }
};

module.exports = {
    getUserById,
    updateUserAvatar
};
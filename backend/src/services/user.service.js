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

module.exports = {
    getUserById,
};
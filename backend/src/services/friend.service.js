const driver = require('../config/neo4j');
const getFriendshipStatus = async (currentUserId, otherUserId) => {
    const session = driver.getSession();
    try {
        const result = await session.run(
            `
            MATCH (u1:NguoiDung {ma_nguoi_dung: $currentUserId})
            MATCH (u2:NguoiDung {ma_nguoi_dung: $otherUserId})
            RETURN
                CASE
                    WHEN EXISTS((u1)-[:IS_FRIENDS_WITH]-(u2)) THEN 'friends'
                    WHEN EXISTS((u1)-[:FRIEND_REQUEST]->(u2)) THEN 'request_sent'
                    WHEN EXISTS((u1)<-[:FRIEND_REQUEST]-(u2)) THEN 'request_received'
                    ELSE 'not_friends'
                END AS status
            `,
            { currentUserId, otherUserId }
        );
        return { status: result.records[0].get('status') };
    } finally {
        await session.close();
    }
};

const sendFriendRequest = async (senderId, receiverId) => {
    const session = driver.getSession();
    try {
        await session.run(
            `
            MATCH (sender:NguoiDung {ma_nguoi_dung: $senderId})
            MATCH (receiver:NguoiDung {ma_nguoi_dung: $receiverId})
            MERGE (sender)-[:FRIEND_REQUEST]->(receiver)
          `,
        {senderId, receiverId}
        )
    } finally {
        await session.close();
    }
}

const cancelFriendRequest = async (senderId, receiverId )=>{
    const session = driver.getSession();
    try {
        await session.run(
            `
            MATCH (sender:NguoiDung {ma_nguoi_dung: $senderId})-[r:FRIEND_REQUEST]->(receiver:NguoiDung {ma_nguoi_dung: $receiverId})
            DELETE r
            `,
            {senderId, receiverId}
        );

    } finally {
        await session.close();
    }
};

const getFriendRequest = async (userId) => {
    const session = driver.getSession();
    try {
        const result = await session.run(
            `
            MATCH (sender:NguoiDung)-[:FRIEND_REQUEST]->(receiver:NguoiDung {ma_nguoi_dung: $userId})
            RETURN sender
            `,
            {userId}
        )
        return result.records.map(record => record.get('sender').properties);
    } finally {
        await session.close();
    }
};
const acceptFriendRequest = async (currentUserId, senderId) => {
    const session = driver.getSession();
    try {
        await session.executeWrite(tx =>
            tx.run(
                `
                MATCH (sender:NguoiDung {ma_nguoi_dung: $senderId})-[r:FRIEND_REQUEST]->(receiver:NguoiDung {ma_nguoi_dung: $currentUserId})
                DELETE r
                MERGE (sender)-[:IS_FRIENDS_WITH]->(receiver)
                `,
                { senderId, currentUserId }
            )
        );
    } finally {
        await session.close();
    }
};

const rejectFriendRequest = async (currentUserId, senderId) =>{
    const session = driver.getSession();
    try {
        await session.run(
            `
            MATCH (sender:NguoiDung {ma_nguoi_dung: $senderId})-[r:FRIEND_REQUEST]->(receiver:NguoiDung {ma_nguoi_dung: $currentUserId})
            DELETE r
            `,
            {senderId, currentUserId}
        );
    } finally {
        await session.close();
    }
}

const unFriendUser = async (currentUserId, otherUserId) =>{
    const session = driver.getSession();
    try {
        await session.run(
            `
            MATCH (u1:NguoiDung {ma_nguoi_dung: $currentUserId})-[r:IS_FRIENDS_WITH]-(u2:NguoiDung {ma_nguoi_dung: $otherUserId})
            DELETE r
            `,
            {currentUserId, otherUserId}
        );
    } finally {
        await session.close();
    }
};




module.exports = {
    getFriendshipStatus,
    sendFriendRequest,
    cancelFriendRequest,
    getFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    unFriendUser
}
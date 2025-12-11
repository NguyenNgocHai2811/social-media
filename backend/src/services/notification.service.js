const driver = require('../config/neo4j');
const { v4: uuidv4 } = require('uuid');

const createNotification = async ({ recipientId, senderId, type, content, relatedId }) => {
    const session = driver.getSession();
    const id = uuidv4();
    try {
        await session.run(
            `
            MATCH (recipient:NguoiDung {ma_nguoi_dung: $recipientId})
            MATCH (sender:NguoiDung {ma_nguoi_dung: $senderId})
            CREATE (n:ThongBao {
                id: $id,
                noi_dung: $content,
                loai: $type,
                related_id: $relatedId,
                da_doc: false,
                tao_luc: datetime()
            })
            MERGE (sender)-[:THONG_BAO_TU]->(n)
            MERGE (n)-[:THONG_BAO_CHO]->(recipient)
            RETURN n
            `,
            { recipientId, senderId, id, content, type, relatedId }
        );
        
        // Return the notification object with sender info for immediate socket use
        return {
            id,
            noi_dung: content,
            loai: type,
            related_id: relatedId,
            da_doc: false,
            tao_luc: new Date().toISOString(), // Approximation for client
            sender: { ma_nguoi_dung: senderId }
        };
    } finally {
        await session.close();
    }
};

const getNotifications = async (userId) => {
    const session = driver.getSession();
    try {
        const result = await session.run(
            `
            MATCH (n:ThongBao)-[:THONG_BAO_CHO]->(recipient:NguoiDung {ma_nguoi_dung: $userId})
            MATCH (sender:NguoiDung)-[:THONG_BAO_TU]->(n)
            RETURN n, sender
            ORDER BY n.tao_luc DESC
            `
        );
        return result.records.map(record => {
            const n = record.get('n').properties;
            const sender = record.get('sender').properties;
            return {
                ...n,
                tao_luc: n.tao_luc.toString(), // Convert Neo4j DateTime to string
                sender: {
                    ma_nguoi_dung: sender.ma_nguoi_dung,
                    ten_hien_thi: sender.ten_hien_thi,
                    anh_dai_dien: sender.anh_dai_dien
                }
            };
        });
    } finally {
        await session.close();
    }
};

const markAsRead = async (notificationId, userId) => {
    const session = driver.getSession();
    try {
        await session.run(
            `
            MATCH (n:ThongBao {id: $notificationId})-[:THONG_BAO_CHO]->(u:NguoiDung {ma_nguoi_dung: $userId})
            SET n.da_doc = true
            RETURN n
            `,
            { notificationId, userId }
        );
    } finally {
        await session.close();
    }
};

const markAllAsRead = async (userId) => {
    const session = driver.getSession();
    try {
        await session.run(
            `
            MATCH (n:ThongBao)-[:THONG_BAO_CHO]->(u:NguoiDung {ma_nguoi_dung: $userId})
            WHERE n.da_doc = false
            SET n.da_doc = true
            RETURN count(n) as updatedCount
            `,
            { userId }
        );
    } finally {
        await session.close();
    }
};

module.exports = {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead
};

const driver = require('../config/neo4j');
const { v4: uuidv4 } = require('uuid');

const sendMessage = async (senderId, receiverId, content) => {
    const session = driver.getSession();
    const id = uuidv4();
    try {
        // Create message node and relationships
        // (Sender)-[:DA_GUI]->(Message)-[:GUI_DEN]->(Receiver)
        const result = await session.run(
            `
            MATCH (sender:NguoiDung {ma_nguoi_dung: $senderId})
            MATCH (receiver:NguoiDung {ma_nguoi_dung: $receiverId})
            CREATE (m:TinNhan {
                id: $id,
                noi_dung: $content,
                tao_luc: datetime(),
                da_doc: false
            })
            MERGE (sender)-[:DA_GUI]->(m)
            MERGE (m)-[:GUI_DEN]->(receiver)
            RETURN m, sender, receiver
            `,
            { senderId, receiverId, content, id }
        );

        const record = result.records[0];
        const message = record.get('m').properties;
        const sender = record.get('sender').properties;
        const receiver = record.get('receiver').properties;

        return {
            ...message,
            tao_luc: new Date().toISOString(), // Convert for JS client
            sender: {
                ma_nguoi_dung: sender.ma_nguoi_dung,
                ten_hien_thi: sender.ten_hien_thi,
                anh_dai_dien: sender.anh_dai_dien
            },
            receiver: {
                ma_nguoi_dung: receiver.ma_nguoi_dung
            }
        };
    } finally {
        await session.close();
    }
};

const getConversations = async (userId) => {
    const session = driver.getSession();
    try {
        const result = await session.run(
            `
            MATCH (u:NguoiDung {ma_nguoi_dung: $userId})
            
            // Find all people who are friends OR have chatted
            OPTIONAL MATCH (u)-[:IS_FRIENDS_WITH]-(friend:NguoiDung)
            OPTIONAL MATCH (u)-[:DA_GUI|GUI_DEN]-(m:TinNhan)-[:DA_GUI|GUI_DEN]-(chatPartner:NguoiDung)
            
            WITH u, collect(DISTINCT friend) + collect(DISTINCT chatPartner) as partners
            UNWIND partners as partner
            WITH DISTINCT partner, u
            WHERE partner IS NOT NULL AND partner.ma_nguoi_dung <> $userId
            
            // Find last message for each partner
            OPTIONAL MATCH (u)-[:DA_GUI|GUI_DEN]-(m:TinNhan)-[:DA_GUI|GUI_DEN]-(partner)
            WITH partner, m
            ORDER BY m.tao_luc DESC
            WITH partner, head(collect(m)) as lastMessage
            
            RETURN partner, lastMessage
            ORDER BY 
                CASE WHEN lastMessage IS NOT NULL THEN lastMessage.tao_luc ELSE datetime('1970-01-01T00:00:00Z') END DESC,
                partner.ten_hien_thi ASC
            `,
            { userId }
        );

        return result.records.map(record => {
            const partner = record.get('partner').properties;
            const lastMessageNode = record.get('lastMessage');
            
            let lastMessage = null;
            if (lastMessageNode) {
                const props = lastMessageNode.properties;
                lastMessage = {
                    ...props,
                    tao_luc: props.tao_luc.toString()
                };
            }

            return {
                partner: {
                    ma_nguoi_dung: partner.ma_nguoi_dung,
                    ten_hien_thi: partner.ten_hien_thi,
                    anh_dai_dien: partner.anh_dai_dien
                },
                lastMessage: lastMessage
            };
        });
    } finally {
        await session.close();
    }
};

const getMessages = async (userId, partnerId) => {
    const session = driver.getSession();
    try {
        // Explicitly match the direction to ensure we find all messages
        // Case 1: User -> Partner
        // Case 2: Partner -> User
        const result = await session.run(
            `
            MATCH (u:NguoiDung {ma_nguoi_dung: $userId})
            MATCH (p:NguoiDung {ma_nguoi_dung: $partnerId})
            MATCH (m:TinNhan)
            WHERE (
                (u)-[:DA_GUI]->(m)-[:GUI_DEN]->(p)
            ) OR (
                (p)-[:DA_GUI]->(m)-[:GUI_DEN]->(u)
            )
            
            // Identify sender for return structure
            OPTIONAL MATCH (realSender:NguoiDung)-[:DA_GUI]->(m)
            
            RETURN m, realSender
            ORDER BY m.tao_luc ASC
            `,
            { userId, partnerId }
        );

        return result.records.map(record => {
            const m = record.get('m').properties;
            const sender = record.get('realSender').properties;
            return {
                ...m,
                tao_luc: m.tao_luc.toString(),
                senderId: sender.ma_nguoi_dung
            };
        });
    } finally {
        await session.close();
    }
};

const markMessagesAsRead = async (userId, partnerId) => {
    const session = driver.getSession();
    try {
        // Find messages sent by partner to user that are unread
        await session.run(
            `
            MATCH (partner:NguoiDung {ma_nguoi_dung: $partnerId})-[:DA_GUI]->(m:TinNhan)-[:GUI_DEN]->(u:NguoiDung {ma_nguoi_dung: $userId})
            WHERE m.da_doc = false
            SET m.da_doc = true
            RETURN count(m)
            `,
            { userId, partnerId }
        );
    } finally {
        await session.close();
    }
};

const getUnreadCount = async (userId) => {
    const session = driver.getSession();
    try {
        const result = await session.run(
            `
            MATCH (m:TinNhan)-[:GUI_DEN]->(u:NguoiDung {ma_nguoi_dung: $userId})
            WHERE m.da_doc = false
            RETURN count(m) as count
            `,
            { userId }
        );
        return result.records[0].get('count').toNumber();
    } finally {
        await session.close();
    }
};

module.exports = {
    sendMessage,
    getConversations,
    getMessages,
    markMessagesAsRead,
    getUnreadCount
};

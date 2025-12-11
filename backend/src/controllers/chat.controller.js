const chatService = require('../services/chat.service');
const { getIO } = require('../socket');

const sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.ma_nguoi_dung;

        if (!receiverId || !content) {
            return res.status(400).json({ message: "Receiver ID and content are required" });
        }

        const message = await chatService.sendMessage(senderId, receiverId, content);

        // Emit socket event to the receiver
        try {
            const io = getIO();
            // Assuming socket.js joins users to room named by their userId
            io.to(receiverId).emit('newChatMessage', message);
            // Optionally emit to sender too if they have multiple tabs open, 
            // but usually frontend handles "own message" optimistically or via response
             io.to(senderId).emit('newChatMessage', message);
        } catch (socketError) {
            console.error("Socket emit failed:", socketError);
            // Don't fail the request if socket fails, message is saved in DB
        }

        res.status(201).json(message);
    } catch (error) {
        console.error("Send message error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getConversations = async (req, res) => {
    try {
        const userId = req.user.ma_nguoi_dung;
        const conversations = await chatService.getConversations(userId);
        res.json(conversations);
    } catch (error) {
        console.error("Get conversations error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getMessages = async (req, res) => {
    try {
        const userId = req.user.ma_nguoi_dung;
        const { partnerId } = req.params;
        const messages = await chatService.getMessages(userId, partnerId);
        res.json(messages);
    } catch (error) {
        console.error("Get messages error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const markAsRead = async (req, res) => {
    try {
        const userId = req.user.ma_nguoi_dung;
        const { partnerId } = req.body;
        await chatService.markMessagesAsRead(userId, partnerId);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Mark read error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.ma_nguoi_dung;
        const count = await chatService.getUnreadCount(userId);
        res.json({ count });
    } catch (error) {
        console.error("Get unread count error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    sendMessage,
    getConversations,
    getMessages,
    markAsRead,
    getUnreadCount
};

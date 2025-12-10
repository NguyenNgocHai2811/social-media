const notificationService = require('../services/notification.service');

const getNotifications = async (req, res) => {
    try {
        const userId = req.user.ma_nguoi_dung;
        const notifications = await notificationService.getNotifications(userId);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.ma_nguoi_dung;
        await notificationService.markAsRead(id, userId);
        res.status(200).json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.ma_nguoi_dung;
        await notificationService.markAllAsRead(userId);
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead
};

const adminService = require('../services/admin.service');


// Lấy tổng số người dùng
const getTotalUsers = async (req, res) => {
    try {
        const total = await adminService.getTotalUsers();
        res.json({
            success: true,
            data: { total }
        });
    } catch (error) {
        console.error("Get Total Users Error:", error);
        res.status(500).json({ 
            success: false,
            message: "Lỗi lấy tổng số người dùng" 
        });
    }
};

// Lấy tổng số bài đăng
const getTotalPosts = async (req, res) => {
    try {
        const total = await adminService.getTotalPosts();
        res.json({
            success: true,
            data: { total }
        });
    } catch (error) {
        console.error("Get Total Posts Error:", error);
        res.status(500).json({ 
            success: false,
            message: "Lỗi lấy tổng số bài đăng" 
        });
    }
};

// Lấy tổng lượt tương tác
const getTotalInteractions = async (req, res) => {
    try {
        const total = await adminService.getTotalInteractions();
        res.json({
            success: true,
            data: { total }
        });
    } catch (error) {
        console.error("Get Total Interactions Error:", error);
        res.status(500).json({ 
            success: false,
            message: "Lỗi lấy tổng lượt tương tác" 
        });
    }
};

// Lấy số người dùng mới trong 30 ngày
const getNewUsersLast30Days = async (req, res) => {
    try {
        const total = await adminService.getNewUsersLast30Days();
        res.json({
            success: true,
            data: { total }
        });
    } catch (error) {
        console.error("Get New Users Last 30 Days Error:", error);
        res.status(500).json({ 
            success: false,
            message: "Lỗi lấy số người dùng mới" 
        });
    }
};

// Lấy tất cả thống kê cùng lúc
const getOverviewStats = async (req, res) => {
    try {
        const stats = await adminService.getOverviewStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ 
            success: false,
            message: "Lỗi lấy dữ liệu thống kê" 
        });
    }
};


// Lấy danh sách tất cả người dùng
const getAllUsers = async (req, res) => {
    try {
        const users = await adminService.getAllUsers();
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error("Get All Users Error:", error);
        res.status(500).json({ 
            success: false,
            message: "Lỗi lấy danh sách người dùng" 
        });
    }
};

// Tìm kiếm người dùng
const searchUsers = async (req, res) => {
    try {
        const { keyword } = req.query;
        
        if (!keyword || keyword.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập từ khóa tìm kiếm"
            });
        }

        const users = await adminService.searchUsers(keyword);
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error("Search Users Error:", error);
        res.status(500).json({ 
            success: false,
            message: "Lỗi tìm kiếm người dùng" 
        });
    }
};

// Lấy danh sách người dùng đang hoạt động
const getActiveUsers = async (req, res) => {
    try {
        const users = await adminService.getActiveUsers();
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error("Get Active Users Error:", error);
        res.status(500).json({ 
            success: false,
            message: "Lỗi lấy danh sách người dùng hoạt động" 
        });
    }
};

// Khóa/Mở khóa người dùng
const toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp ID người dùng"
            });
        }

        if (!status || !['active', 'inactive', 'banned'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Trạng thái không hợp lệ. Vui lòng nhập: active, inactive hoặc banned"
            });
        }

        const user = await adminService.toggleUserStatus(userId, status);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng"
            });
        }

        res.json({
            success: true,
            message: `Cập nhật trạng thái người dùng thành công`,
            data: user
        });
    } catch (error) {
        console.error("Toggle User Status Error:", error);
        res.status(500).json({ 
            success: false,
            message: "Lỗi cập nhật trạng thái người dùng" 
        });
    }
};

module.exports = {
    // Stats
    getTotalUsers,
    getTotalPosts,
    getTotalInteractions,
    getNewUsersLast30Days,
    getOverviewStats,
    // Users
    getAllUsers,
    searchUsers,
    getActiveUsers,
    toggleUserStatus
};
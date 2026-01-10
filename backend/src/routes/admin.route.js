const express = require('express');
const adminController = require('../controllers/admin.controller');
// const { verifyAdmin } = require('../middleware/admin.middeware');
const { verifyToken, isUserAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(verifyToken); // Xác thực token
router.use(isUserAdmin); // Xác thực quyền admin


// Lấy tất cả thống kê cùng lúc
router.get('/stats', adminController.getOverviewStats);

// Lấy tất cả thống kê riêng lẻ
router.get('/stats/users', adminController.getTotalUsers);
router.get('/stats/posts', adminController.getTotalPosts);
router.get('/stats/interactions', adminController.getTotalInteractions);
router.get('/stats/new-users', adminController.getNewUsersLast30Days);


// Tìm kiếm người dùng 
router.get('/users/search', adminController.searchUsers);

// Lấy danh sách tất cả người dùng
router.get('/users', adminController.getAllUsers);


// Lấy danh sách người dùng đang hoạt động 
router.get('/users/active', adminController.getActiveUsers);

// Khóa/Mở khóa người dùng
router.put('/users/:userId/status', adminController.toggleUserStatus);

// lấy thông tin người dùng theo ID
router.get('/users/:userId', adminController.getUserById);

// Cập nhật thông tin người dùng
router.put('/users/:userId', adminController.updateUser);


// Quản lý bài viết
router.get('/posts', adminController.getInformationPost);

//  Tìm kiếm bài viết
router.get('/posts/search', adminController.searchPosts);

// Xóa bài viết theo ID
router.delete('/posts/:id', adminController.deletePostController);

module.exports = router;

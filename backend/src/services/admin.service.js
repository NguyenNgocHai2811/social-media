const {getSession} = require('../config/neo4j')

// Lấy danh sách tất cả người dùng 
const getAllUsers = async () => {
    const session = getSession();
    try {
        const result = await session.run(`
            MATCH (u:NguoiDung)
            RETURN u { .ma_nguoi_dung, .ho_ten, .email, .role, .ngay_tao, .trang_thai } as user
            ORDER BY u.ngay_tao DESC
        `);
        return result.records.map(record => record.get('user'));
    } catch (error) {
        console.error('getAllUsers Error:', error);
        throw error;
    } finally {
        await session.close();
    }
};

// Lấy tổng số người dùng
const getTotalUsers = async () => {
    const session = getSession();
    try {
        const result = await session.run(
            `MATCH (u:NguoiDung) 
            RETURN COUNT(u) as total`
        );
        if (result.records.length === 0) return 0;
        const total = result.records[0].get('total');
        return typeof total === 'object' ? total.toNumber() : total;
    } catch (error) {
        console.error('getTotalUsers Error:', error);
        throw error;
    } finally {
        await session.close();
    }
};

// Lấy tổng số bài đăng
const getTotalPosts = async () => {
    const session = getSession();
    try {
        const result = await session.run(
            `MATCH (p:BaiDang) 
            RETURN COUNT(p) as total`
        );
        if (result.records.length === 0) return 0;
        const total = result.records[0].get('total');
        return typeof total === 'object' ? total.toNumber() : total;
    } catch (error) {
        console.error('getTotalPosts Error:', error);
        throw error;
    } finally {
        await session.close();
    }
};

// Lấy tổng lượt tương tác
const getTotalInteractions = async () => {
    const session = getSession();
    try {
        const result = await session.run(
            `MATCH (u:NguoiDung)-[r:LIKE|DA_BINH_LUAN]->() 
            RETURN COUNT(r) as total`
        );
        if (result.records.length === 0) return 0;
        const total = result.records[0].get('total');
        return typeof total === 'object' ? total.toNumber() : total;
    } catch (error) {
        console.error('getTotalInteractions Error:', error);
        throw error;
    } finally {
        await session.close();
    }
};

// Lấy số người dùng mới trong 30 ngày
const getNewUsersLast30Days = async () => {
    const session = getSession();
    try {
        const result = await session.run(
            `MATCH (u:NguoiDung)
            WHERE u.ngay_tao >= timestamp() - (30 * 24 * 60 * 60 * 1000)
            RETURN COUNT(u) as total`
        );
        if (result.records.length === 0) return 0;
        const total = result.records[0].get('total');
        return typeof total === 'object' ? total.toNumber() : total;
    } catch (error) {
        console.error('getNewUsersLast30Days Error:', error);
        throw error;
    } finally {
        await session.close();
    }
};

// Gom tất cả thống kê - gọi song song 4 hàm trên
const getOverviewStats = async () => {
    try {
        const [tongNguoiDung, tongBaiDang, tongLuotTuongTac, nguoiDungMoi] = await Promise.all([
            getTotalUsers(),
            getTotalPosts(),
            getTotalInteractions(),
            getNewUsersLast30Days()
        ]);

        return {
            tongNguoiDung,
            tongBaiDang,
            tongLuotTuongTac,
            nguoiDungMoi
        };
    } catch (error) {
        console.error('Error getting overview stats:', error);
        throw error;
    }
};

// Tìm kiếm người dùng
const searchUsers = async (keyword) => {
    const session = getSession();
    try {
        const result = await session.run(`
            MATCH (u:NguoiDung)
            WHERE toLower(u.ten_hien_thi) CONTAINS toLower($keyword) 
            OR toLower(u.email) CONTAINS toLower($keyword)
            RETURN {
                ma_nguoi_dung: u.ma_nguoi_dung,
                ten_hien_thi: u.ten_hien_thi,
                email: u.email,
                role: u.role,
                trang_thai: u.trang_thai
            } as user
            LIMIT 20
        `, { keyword });
        return result.records.map(record => record.get('user'));
    } catch (error) {
        console.error('searchUsers Error:', error);
        throw error;
    } finally {
        await session.close();
    }
};

// Lấy danh sách người dùng đang hoạt động
const getActiveUsers = async () => {
    const session = getSession();
    try {
        const result = await session.run(`
            MATCH (u:NguoiDung {trang_thai: 'active'})
            RETURN {
                ma_nguoi_dung: u.ma_nguoi_dung,
                ho_ten: u.ho_ten,
                email: u.email
            } as user
        `);
        return result.records.map(record => record.get('user'));
    } finally {
        await session.close();
    }
};

// Khóa/Mở khóa người dùng
const toggleUserStatus = async (userId, newStatus) => {
    const session = getSession();
    try {
        const result = await session.run(`
            MATCH (u:NguoiDung {ma_nguoi_dung: $userId})
            SET u.trang_thai = $newStatus
            RETURN u { .ma_nguoi_dung, .ho_ten, .email, .role, .trang_thai } as user
        `, { userId, newStatus });
        
        if (result.records.length === 0) {
            return null;
        }
        return result.records[0].get('user');
    } finally {
        await session.close();
    }
};

module.exports = {
    getTotalUsers,
    getTotalPosts,
    getTotalInteractions,
    getNewUsersLast30Days,
    getOverviewStats,
    getAllUsers,
    searchUsers,
    getActiveUsers,
    toggleUserStatus
}
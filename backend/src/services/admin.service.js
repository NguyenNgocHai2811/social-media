const {getSession} = require('../config/neo4j')

// Lấy danh sách tất cả người dùng 
const getAllUsers = async () => {
    const session = getSession();
    try {
        const result = await session.run(`
            MATCH (u:NguoiDung)
            RETURN u {.ma_nguoi_dung, .anh_dai_dien, .ten_hien_thi, .email, .role, ngay_tao: toString(u.ngay_tao), .trang_thai } as user
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

// lấy danh sách người dùng theo id

const getUserById = async (userId) => {
    const session = getSession();
    try {
        const result = await session.run(`
            MATCH (u:NguoiDung {ma_nguoi_dung: $userId})
            RETURN u { .ma_nguoi_dung, .ten_hien_thi, .email, .role, .trang_thai } as user
        `, { userId });

        if (result.records.length === 0) {
            return null;    
        }
        return result.records[0].get('user');
    } catch (error) {
        console.error('getUserById Error:', error);
        throw error;
    } finally {
        await session.close();
    }
}
// Cập nhật thông tin người dùng
const updateUser = async (userId, updateData)  => {
    const session = getSession();
    try {
        const result = await session.run(`
            MATCH (u:NguoiDung {ma_nguoi_dung: $userId})
            set u += {
            ten_hien_thi: $ten_hien_thi,
            role: $role,
            trang_thai: $trang_thai
            }
            return u { .ma_nguoi_dung, .ten_hien_thi, .email, .role, .trang_thai } as user
        ` ,
        {
            userId,
            ten_hien_thi: updateData.ten_hien_thi || null,
            role: updateData.role || null,
            trang_thai: updateData.trang_thai || null
        });
        if (result.records.length === 0) {
            return null;    
        }
        return result.records[0].get('user');
          }   catch (error) {
        console.error('editUserRole Error:', error);
        throw error;
         }
        finally {
        await session.close();
    }
};

// Quản lý lý bài viết

const getManagerPost = async () => {
    const session = getSession();
    try {
        const result = await session.run(`
            MATCH (n:NguoiDung)-[k:DANG_BAI]->(p:BaiDang)
            
            OPTIONAL  MATCH (p)-[:CO_MEDIA] ->(m:Media)
            OPTIONAL MATCH ()-[l:LIKE]->(p)
            OPTIONAL MATCH (p)-[:CO_BINH_LUAN]->(b:BinhLuan) 
            
            RETURN 
                p.ma_bai_dang AS ma_bai_dang,
                p.noi_dung AS noi_dung,
                n.ten_hien_thi AS ten_hien_thi,
                m.duong_dan AS duong_dan,
                toString(k.thoi_gian) AS thoi_gian, 
                count(l) AS like_count,     
                count(DISTINCT b) AS comment_count
            
            ORDER BY thoi_gian DESC
        `);

        if (result.records.length === 0) {
            return []; // Nên trả về mảng rỗng [] thay vì null để Frontend dễ map
        }
        const toInt = (value) => {
        if (value === null || value === undefined) return 0; 
        if (value.toNumber) return value.toNumber();         
        return Number(value);                              
    };
        return result.records.map(record => ({
            // 3. Mapping theo đúng Alias đã đặt ở trên (bỏ chữ p. đi)
            ma_bai_dang: record.get('ma_bai_dang'),
            noi_dung: record.get('noi_dung'),
            ten_hien_thi: record.get('ten_hien_thi'),
            duong_dan: record.get('duong_dan'),
            thoi_gian: record.get('thoi_gian'), // Đã là string nhờ hàm toString() ở trên
            
            // Xử lý số nguyên Neo4j
            like: toInt(record.get('like_count')),
            comment: toInt(record.get('comment_count'))
        }));

    } catch (error) {
        console.error('getManagerPost Error:', error);
        throw error;
    } finally {
        await session.close();
    }
};


const deletePostById = async (postId) => {
    const session = getSession();
    try {
        if (!postId) {
            throw new Error("ID bài viết không được để trống");
        }
         await session.run(`
            MATCH (p:BaiDang {ma_bai_dang: $postId})

            OPTIONAL MATCH (p)-[:CO_MEDIA]->(m:Media)

            OPTIONAL MATCH (p)-[:CO_BINH_LUAN]->(c:BinhLuan)

            DETACH DELETE p, m, c
        `, { postId: postId });
        return true;
        
    } catch (error) {
        console.error('Error:', error);
        throw error;
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
    toggleUserStatus,
    getUserById,
    updateUser,
    getManagerPost,
    deletePostById
}
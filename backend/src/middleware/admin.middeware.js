const { getSession } = require('../config/neo4j');

const verifyAdmin = async (req, res, next) => {
    try {
        const userId = req.user?.ma_nguoi_dung || req.user?.id;
        
        if (!userId) {
            return res.status(401).json({ 
                success: false,
                message: "Vui lòng đăng nhập" 
            });
        }

        const session = getSession();
        try {
            const result = await session.run(
                `MATCH (u:NguoiDung {ma_nguoi_dung: $userId})
                RETURN u.role as role`,
                { userId }
            );

            if (result.records.length === 0) {
                return res.status(404).json({ 
                    success: false,
                    message: "Không tìm thấy người dùng" 
                });
            }

            const role = result.records[0].get('role');
            
            if (role === 'admin') {
                next();
            } else {
                return res.status(403).json({ 
                    success: false,
                    message: "Truy cập bị từ chối! Bạn không phải Admin." 
                });
            }
        } finally {
            await session.close();
        }
    } catch (error) {
        console.error('Admin Middleware Error:', error);
        return res.status(500).json({ 
            success: false,
            message: "Lỗi server khi check quyền Admin" 
        });
    }
};

module.exports = { verifyAdmin };
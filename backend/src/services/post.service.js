const { getSession } = require('../config/neo4j');
const { v4: uuidv4 } = require('uuid'); //

const createPost = async (postData) => {
    // Fix: Default noi_dung to empty string to prevent Neo4j driver error with undefined.
    const { noi_dung = '', che_do_rieng_tu = 'cong_khai', ma_nguoi_dung, imageFile } = postData;
    const session = getSession();
    const transaction = session.beginTransaction();

    try {
        const ma_bai_dang = uuidv4();
        const now = new Date().toISOString();

        // Optimization: Combine user matching, post creation, and relationship creation into one query.
        const result = await transaction.run(
            `MATCH (u:NguoiDung {ma_nguoi_dung: $ma_nguoi_dung})
             CREATE (p:BaiDang {
                ma_bai_dang: $ma_bai_dang,
                noi_dung: $noi_dung,
                che_do_rieng_tu: $che_do_rieng_tu,
                ngay_tao: $now,
                ngay_sua: $now
             })
             CREATE (u)-[:DANG_BAI {thoi_gian: $now}]->(p)
             RETURN p, u`,
            { ma_nguoi_dung, ma_bai_dang, noi_dung, che_do_rieng_tu, now }
        );

        if (result.records.length === 0) {
            throw new Error('User not found or post could not be created.');
        }

        const record = result.records[0];
        const newPost = record.get('p').properties;
        const user = record.get('u').properties;

        // Sanitize user data before attaching to the post object
        delete user.mat_khau;
        delete user.email;
        newPost.user = user;

        // Handle media (image) if it exists
        if (imageFile) {
            const ma_media = uuidv4();
            // Optimization: Combine media creation and relationship creation into one query.
            const mediaResult = await transaction.run(
                `MATCH (p:BaiDang {ma_bai_dang: $ma_bai_dang})
                 CREATE (m:Media {
                    ma_media: $ma_media,
                    loai: 'anh',
                    duong_dan: $imageUrl,
                    public_id: $publicId,
                    ngay_tai_len: $now
                 })
                 CREATE (p)-[:CO_MEDIA]->(m)
                 RETURN m`,
                {
                    ma_bai_dang,
                    ma_media,
                    imageUrl: imageFile.path,
                    publicId: imageFile.filename,
                    now
                }
            );
            newPost.media = mediaResult.records[0].get('m').properties;
        } else {
            newPost.media = null;
        }

        await transaction.commit();
        return newPost;
    } catch (error) {
        await transaction.rollback();
        console.error("Error creating post:", error);
        throw new Error('Could not create post. ' + error.message);
    } finally {
        await session.close();
    }
};

const getAllPosts = async (userId, filter, targetUserId = null) => {
    const session = getSession();
    try {
        // Đảm bảo userId không bị null/undefined khi query (để tránh lỗi query)
        const currentUserId = userId || '';
        
        let matchClause = "";
        let orderByClause = "";
        let limitClause = "";

        // 1. XÂY DỰNG MATCH CLAUSE DỰA TRÊN FILTER
        if (targetUserId) {
             // Lấy bài viết của một user cụ thể (Profile)
             matchClause = `
                MATCH (u:NguoiDung {ma_nguoi_dung: $targetUserId})-[:DANG_BAI]->(p:BaiDang)
             `;
        } else if (filter === 'friends') {
            // Chỉ lấy bài của bạn bè
            matchClause = `
                MATCH (me:NguoiDung {ma_nguoi_dung: $currentUserId})-[:IS_FRIENDS_WITH]-(u:NguoiDung)
                MATCH (u)-[:DANG_BAI]->(p:BaiDang)
            `;
        } else {
            // Mặc định: Lấy tất cả bài viết (Newsfeed chung)
            matchClause = `
                MATCH (u:NguoiDung)-[:DANG_BAI]->(p:BaiDang)
            `;
        }

        // 2. XÂY DỰNG ORDER BY VÀ LIMIT
        if (filter === 'popular') {
            // Sắp xếp theo độ phổ biến (Like + Comment)
            orderByClause = `ORDER BY (so_luot_binh_luan + so_luot_like) DESC, p.ngay_tao DESC`;
        } else {
            // Mặc định: Sắp xếp theo thời gian mới nhất
            orderByClause = `ORDER BY p.ngay_tao DESC`;
        }

        // Giới hạn số lượng nếu là tab "Gần đây" hoặc mặc định để tránh load quá nặng
        if (filter === 'recent') {
            limitClause = `LIMIT 20`;
        } else {
            limitClause = `LIMIT 50`; // Giới hạn mặc định để không crash app
        }

        // 3. TẠO QUERY HOÀN CHỈNH
        const query = `
            ${matchClause}
            
            // Lấy thông tin Media (nếu có)
            OPTIONAL MATCH (p)-[:CO_MEDIA]->(m:Media)

            // Kiểm tra User hiện tại có like bài này không?
            OPTIONAL MATCH (me:NguoiDung {ma_nguoi_dung: $currentUserId})-[my_like:LIKE]->(p)

            // Đếm Like và Comment (Sử dụng Sub-query COUNT để tối ưu hiệu năng)
            WITH p, u, m, my_like,
                 COUNT { (p)-[:CO_BINH_LUAN]->(:BinhLuan) } as so_luot_binh_luan,
                 COUNT { (:NguoiDung)-[:LIKE]->(p) } as so_luot_like

            RETURN p, u, m, so_luot_binh_luan, so_luot_like,
                   CASE WHEN my_like IS NOT NULL THEN true ELSE false END as da_like
            
            ${orderByClause}
            ${limitClause}
        `;

        const result = await session.run(query, { currentUserId, targetUserId });

        // 4. MAP DỮ LIỆU TRẢ VỀ
        const posts = result.records.map(record => {
            const post = record.get('p').properties;
            const user = record.get('u').properties;
            const media = record.get('m') ? record.get('m').properties : null;
            
            // Hàm chuyển đổi số an toàn (Neo4j Integer -> JS Number)
            const toNativeNumber = (val) => {
                if (val === null || val === undefined) return 0;
                if (typeof val === 'number') return val;
                if (val.low !== undefined) return val.toNumber();
                return 0;
            };

            const so_luot_binh_luan = toNativeNumber(record.get('so_luot_binh_luan'));
            const so_luot_like = toNativeNumber(record.get('so_luot_like'));
            const da_like = record.get('da_like');

            // Xóa thông tin nhạy cảm của người đăng
            if (user) {
                delete user.mat_khau;
                delete user.email;
            }

            return {
                ...post,
                user,
                media,
                so_luot_binh_luan,
                so_luot_like,
                da_like
            };
        });

        return posts;

    } catch (error) {
        console.error("Lỗi tại getAllPosts service:", error);
        throw error;
    } finally {
        await session.close();
    }
};

const toggleLikePost = async (userId, postId) => {
    const session = getSession();
    try {
        const result = await session.run(
            `
            MATCH (u:NguoiDung {ma_nguoi_dung: $userId})
            MATCH (p:BaiDang {ma_bai_dang: $postId})
            
            // 1. Kiểm tra xem đã like chưa
            OPTIONAL MATCH (u)-[l:LIKE]->(p)
            
            // 2. Xử lý Toggle (Nếu có thì Xóa, chưa có thì Tạo)
            FOREACH (_ IN CASE WHEN l IS NOT NULL THEN [1] ELSE [] END | DELETE l)
            FOREACH (_ IN CASE WHEN l IS NULL THEN [1] ELSE [] END | CREATE (u)-[:LIKE {ngay_tao: datetime()}]->(p))
            
            // 3. QUAN TRỌNG: Tính toán lại tổng số like và trạng thái mới NGAY LẬP TỨC
            WITH p, u, l
            // Nếu l ban đầu là NULL (chưa like) -> Thì bây giờ là đã like (true)
            // Nếu l ban đầu có (đã like) -> Thì bây giờ là chưa like (false)
            // (Hoặc đơn giản là kiểm tra lại quan hệ vừa tạo/xóa)
            
            CALL {
                WITH p
                MATCH (p)<-[:LIKE]-(anyUser)
                RETURN count(anyUser) as total_likes
            }
            
            // Check lại xem user hiện tại còn link tới post không
            RETURN total_likes, EXISTS((u)-[:LIKE]->(p)) as is_liked
            `,
            { userId, postId }
        );

        if (result.records.length > 0) {
            const record = result.records[0];

            // Lấy số liệu chuẩn từ DB
            const totalLikes = record.get('total_likes').low !== undefined
                ? record.get('total_likes').toNumber()
                : record.get('total_likes');

            const isLiked = record.get('is_liked'); // true/false

            return {
                success: true,
                liked: isLiked,       // Trạng thái mới
                likeCount: totalLikes // Số lượng like  
            };
        } else {
            throw new Error("Post/User not found");
        }

    } catch (err) {
        console.error("Error toggling like:", err);
        throw err;
    } finally {
        if (session) await session.close();
    }
}

// xoá bài viết
const deletePost = async (userId, postId) => {
    const session = getSession();
    try {
        const result = await session.run(
            `
            MATCH (:NguoiDung {ma_nguoi_dung: $userId}) -[:DANG_BAI]-> (post:BaiDang {ma_bai_dang: $postId})
            DETACH DELETE post
            `,
            { userId, postId }
        );

        const nodesDeleted = result.summary.counters.updates().nodesDeleted;

        if (nodesDeleted > 0) {
            console.log(`>>> THÀNH CÔNG: Đã xoá ${nodesDeleted} bài viết.`);
            return true;
        } else {
            console.log(`>>> THẤT BẠI: Không tìm thấy bài viết hoặc người dùng không khớp.`);
            return false;
        }
    } catch (err) {
        console.error("Error in deletePost service:", err);
        throw err;
    } finally {
        if (session) {
            await session.close();
        }
    }
}

const getPostAuthorId = async (postId) => {
    const session = getSession();
    try {
        const result = await session.run(
            `MATCH (u:NguoiDung)-[:DANG_BAI]->(p:BaiDang {ma_bai_dang: $postId}) RETURN u.ma_nguoi_dung as authorId`,
            { postId }
        );
        if (result.records.length > 0) {
            return result.records[0].get('authorId');
        }
        return null;
    } finally {
        await session.close();
    }
};

module.exports = {
    createPost,
    getAllPosts,
    toggleLikePost,
    deletePost,
    getPostAuthorId
};
  


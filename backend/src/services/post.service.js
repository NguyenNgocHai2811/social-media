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


const getAllPosts = async (currentUserId = null) => {
    const session = getSession();
    try {
        // Xử lý currentUserId: Nếu null/undefined thì gán là chuỗi rỗng để tránh lỗi query
        const safeUserId = currentUserId || '';

        // Query an toàn: Dùng COUNT thay vì size() để tránh lỗi cú pháp ở các bản Neo4j cũ
        // Dùng CASE WHEN để check like thay vì EXISTS
        const query = `
            MATCH (u:NguoiDung)-[:DANG_BAI]->(p:BaiDang)
            OPTIONAL MATCH (p)-[:CO_MEDIA]->(m:Media)
            
            // Đếm like
            OPTIONAL MATCH (p)<-[l:LIKE]-()
            WITH p, u, m, count(l) as so_luot_like
            
            // Đếm comment
            OPTIONAL MATCH (p)-[:CO_BINH_LUAN]->(bl:BinhLuan)
            WITH p, u, m, so_luot_like, count(bl) as so_luot_binh_luan

            // Kiểm tra user hiện tại đã like chưa
            // Tìm quan hệ LIKE từ user hiện tại (nếu có)
            OPTIONAL MATCH (me:NguoiDung {ma_nguoi_dung: $safeUserId})-[my_like:LIKE]->(p)
            
            RETURN p, u, m, so_luot_like, so_luot_binh_luan, 
                   CASE WHEN my_like IS NOT NULL THEN true ELSE false END as da_like
            ORDER BY p.ngay_tao DESC
        `;

        const result = await session.run(query, { safeUserId });

        const posts = result.records.map(record => {
            const post = record.get('p').properties;
            const user = record.get('u').properties;
            const media = record.get('m') ? record.get('m').properties : null;

            // --- HÀM CONVERT SỐ AN TOÀN (CHỐNG CRASH) ---
            const toNativeNumber = (val) => {
                if (val === null || val === undefined) return 0;
                if (typeof val === 'number') return val; // Đã là số JS
                if (val.low !== undefined) return val.toNumber(); // Là số Neo4j
                return 0; // Fallback
            };

            const so_luot_like = toNativeNumber(record.get('so_luot_like'));
            const so_luot_binh_luan = toNativeNumber(record.get('so_luot_binh_luan'));
            const da_like = record.get('da_like'); // Đã là boolean nhờ query CASE WHEN

            // Xóa thông tin nhạy cảm
            if (user) {
                delete user.mat_khau;
                delete user.email;
            }

            return {
                ...post,
                user,
                media,
                so_luot_like,
                so_luot_binh_luan,
                da_like
            };
        });

        return posts;
    } catch (error) {
        // Log lỗi ra terminal 
        console.error(">>> LỖI GỐC Ở GET ALL POSTS:", error);
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

module.exports = {
    createPost,
    getAllPosts,
    toggleLikePost,
    deletePost
};
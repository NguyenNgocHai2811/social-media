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

const getAllPosts = async () => {
    const session = getSession();
    try {
        const result = await session.run(
            `MATCH (u:NguoiDung)-[:DANG_BAI]->(p:BaiDang)
             OPTIONAL MATCH (p)-[:CO_MEDIA]->(m:Media)
             RETURN p, u, m
             ORDER BY p.ngay_tao DESC`
        );

        const posts = result.records.map(record => {
            const post = record.get('p').properties;
            const user = record.get('u').properties;
            const media = record.get('m') ? record.get('m').properties : null;
            
            // Sanitize user data
            delete user.mat_khau;
            delete user.email; // Or any other private fields

            return { ...post, user, media };
        });

        return posts;
    } catch (error) {
        console.error("Error fetching posts:", error);
        throw new Error('Could not fetch posts. ' + error.message);
    } finally {
        await session.close();
    }
};

const likePost = async(userId, postId) => {
    const session = getSession()
    try {
         const checkResult = await session.run(
            `
            MATCH (u:User {ma_nguoi_dung: $userId})-[l:LIKE]->(p:BaiDang {ma_bai_dang: $postId})
            RETURN l
            `,
            { userId, postId }
        );

           if (checkResult.records.length > 0) {
            // Đã like → unlike (xóa relationship)
            await session.run(
                `
                MATCH (u:User {ma_nguoi_dung: $userId})-[l:LIKE]->(p:BaiDang {ma_bai_dang: $postId})
                DELETE l
                `,
                { userId, postId }
            );
            return { message: 'Unliked' };
             } 
             else {
                // Chưa like → like (tạo relationship)
                await session.run(
                    `
                    MATCH (u:User {ma_nguoi_dung: $userId})
                    MATCH (p:BaiDang {ma_bai_dang: $postId})
                    CREATE (u)-[:LIKE]->(p)
                    `,
                    { userId, postId }
                );
                return { message: 'Liked' };
             }

    }finally {
        await session.close();
    } 
}

// xoá bài viết
const deletePost = async(userId, postId) => {
    const session = getSession()
    try {
        const result = await session.run(`
            Match (:NguoiDung {ma_nguoi_dung: $userId}) -[:Dang_Bai] ->(post:BaiDang {ma_bai_dang: $postId})
            Detach delete post;
            `,
            {userId, postId}
        )

    }catch(err){
        console.error(err)
    }finally {
        await session.close();
    }
}

module.exports = {
    createPost,
    getAllPosts,
    likePost
};
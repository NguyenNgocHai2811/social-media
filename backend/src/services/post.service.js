const { getSession } = require('../config/neo4j');
const { v4: uuidv4 } = require('uuid');

const createPost = async (postData) => {
    const { noi_dung, che_do_rieng_tu = 'cong_khai', ma_nguoi_dung, imageFile } = postData;
    const session = getSession();
    const transaction = session.beginTransaction();
    
    try {
        const ma_bai_dang = uuidv4();
        const now = new Date().toISOString();

        // Create the BaiDang node
        const postResult = await transaction.run(
            `CREATE (p:BaiDang {
                ma_bai_dang: $ma_bai_dang,
                noi_dung: $noi_dung,
                che_do_rieng_tu: $che_do_rieng_tu,
                ngay_tao: $now,
                ngay_sua: $now
            }) RETURN p`,
            { ma_bai_dang, noi_dung, che_do_rieng_tu, now }
        );
        const newPost = postResult.records[0].get('p').properties;

        // Create the relationship between User and Post
        await transaction.run(
            `MATCH (u:NguoiDung {ma_nguoi_dung: $ma_nguoi_dung})
             MATCH (p:BaiDang {ma_bai_dang: $ma_bai_dang})
             CREATE (u)-[:DANG_BAI {thoi_gian: $now}]->(p)`,
            { ma_nguoi_dung, ma_bai_dang, now }
        );

        // Handle media (image) if it exists
        
        if (imageFile) {
            const ma_media = uuidv4();
            const mediaResult = await transaction.run(
                `CREATE (m:Media {
                    ma_media: $ma_media,
                    loai: 'anh',
                    duong_dan: $imageUrl,
                    public_id: $publicId,
                    ngay_tai_len: $now
                }) RETURN m`,
                { 
                    ma_media, 
                    imageUrl: imageFile.path, // secure_url from Cloudinary
                    publicId: imageFile.filename, // public_id from Cloudinary
                    now 
                }
            );
            
            // Create the relationship between Post and Media
            await transaction.run(
                `MATCH (p:BaiDang {ma_bai_dang: $ma_bai_dang})
                 MATCH (m:Media {ma_media: $ma_media})
                 CREATE (p)-[:CO_MEDIA]->(m)`,
                { ma_bai_dang, ma_media }
            );
            newPost.media = mediaResult.records[0].get('m').properties;
        } else {
             newPost.media = null;
        }

        // Fetch user information to return with the post
        const userResult = await transaction.run(
            'MATCH (u:NguoiDung {ma_nguoi_dung: $ma_nguoi_dung}) RETURN u',
            { ma_nguoi_dung }
        );
        
        if (userResult.records.length > 0) {
            const user = userResult.records[0].get('u').properties;
            delete user.mat_khau; // Sanitize user data
            delete user.email;
            newPost.user = user;
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

module.exports = {
    createPost,
    getAllPosts,
};
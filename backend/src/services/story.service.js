const neo4j = require('neo4j-driver');
const { getSession } = require('../config/neo4j');
const { v4: uuidv4 } = require('uuid');


const createStory = async (userId, videoUrl, publicId) => {
    const session = getSession()
    try {
        const result = await session.run(
            `
            MATCH (u:NguoiDung {ma_nguoi_dung: $userId})
            CREATE (s:Story {
                ma_story: $storyId,
                video_url: $videoUrl,
                public_id: $publicId,
                thoi_gian_tao: datetime()
            })
            CREATE (u)-[:DA_DANG]->(s)
            RETURN s, u
            `,
            {
                userId,
                storyId: uuidv4(),
                videoUrl,
                publicId
            }
        );

        if (result.records.length === 0) {
            throw new Error('User not found or failed to create story');
        }

        const story = result.records[0].get('s').properties;
        const user = result.records[0].get('u').properties;

        return { ...story, user };
    } finally {
        await session.close();
    }
};

const getFriendStories = async (userId) => {
    const session = getSession();
    try {
        // Query to get stories from friends posted in the last 24 hours
        // Updated to ensure proper sorting of friends by their latest story
        
        const result = await session.run(
            `
            MATCH (u:NguoiDung {ma_nguoi_dung: $userId})-[:IS_FRIENDS_WITH]-(friend:NguoiDung)-[:DA_DANG]->(s:Story)
            WHERE s.thoi_gian_tao > datetime() - duration({hours: 24})
            WITH friend, s
            ORDER BY s.thoi_gian_tao DESC
            WITH friend, collect(s) as stories
            ORDER BY stories[0].thoi_gian_tao DESC
            RETURN friend, stories
            `,
            { userId }
        );

        const friendStories = result.records.map(record => {
            const friend = record.get('friend').properties;
            const stories = record.get('stories').map(node => node.properties);
            
            // Stories are already collected in order due to prior sort (mostly), 
            // but `collect` aggregates. `stories[0]` in the RETURN clause refers to the first element of collection.
            // Wait, `collect` order is not guaranteed unless we order before collecting.
            // The query above:
            // 1. Matches and filters.
            // 2. Orders by s.thoi_gian_tao DESC.
            // 3. Collects s into stories. Since rows were ordered, the collection *should* be ordered? 
            // Actually Neo4j `collect` aggregates over the grouping key (friend). 
            // If rows are ordered by `friend` then `s.time`, then `collect` usually respects that order.
            // But strict Cypher guarantee: Order is only guaranteed for the stream. `collect` might consume in order.
            // To be safe, we can sort in JS as we already do.
            
            stories.sort((a, b) => new Date(b.thoi_gian_tao) - new Date(a.thoi_gian_tao));

            return {
                user: friend,
                stories: stories
            };
        });

        return friendStories;
    } finally {
        await session.close();
    }
};

module.exports = {
    createStory,
    getFriendStories
};

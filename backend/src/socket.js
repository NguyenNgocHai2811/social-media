const { Server } = require("socket.io");
const { getFriends } = require('./services/friend.service');
const { getUserById } = require('./services/user.service');

const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*", // Configure based on your needs
            methods: ["GET", "POST"]
        }
    });

    // Track online users: Set of userIds
    const onlineUserIds = new Set();

    io.on('connection', async (socket) => {
        const userId = socket.handshake.query.userId;
        if (!userId || userId === 'undefined') {
            return;
        }

        console.log(`User connected: ${userId}`);

        // Join a room named after the userId
        socket.join(userId);

        // Add to online set
        onlineUserIds.add(userId);

        try {
            // 1. Get current user's friends
            const friends = await getFriends(userId);

            // 2. Identify which friends are online
            const onlineFriends = friends.filter(friend => onlineUserIds.has(friend.ma_nguoi_dung));

            // 3. Send the list of online friends to the current user
            socket.emit('onlineFriends', onlineFriends);

            // 4. Notify each online friend that this user has come online
            // We need the current user's full profile to send to friends
            const currentUser = await getUserById(userId);
            
            // Construct the user object to send (similar to what getFriends returns)
            const userInfo = {
                ma_nguoi_dung: currentUser.ma_nguoi_dung,
                ten_hien_thi: currentUser.ten_hien_thi,
                anh_dai_dien: currentUser.anh_dai_dien
            };

            onlineFriends.forEach(friend => {
                io.to(friend.ma_nguoi_dung).emit('friendOnline', userInfo);
            });

        } catch (error) {
            console.error("Error in socket connection logic:", error);
        }

        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${userId}`);
            
            // Check if there are other sockets for this user (e.g., other tabs)
            const sockets = await io.in(userId).fetchSockets();
            if (sockets.length === 0) {
                // Only if no other connections exist for this user
                onlineUserIds.delete(userId);
                
                try {
                     // Notify online friends that this user has gone offline
                    // We need to fetch friends again to know who to notify
                    // (Optimization: could cache this, but for now fetch is safer)
                    const friends = await getFriends(userId);
                    const onlineFriends = friends.filter(friend => onlineUserIds.has(friend.ma_nguoi_dung));
                    
                    onlineFriends.forEach(friend => {
                        io.to(friend.ma_nguoi_dung).emit('friendOffline', userId);
                    });
                } catch (error) {
                    console.error("Error in socket disconnect logic:", error);
                }
            }
        });
    });

    return io;
};

module.exports = initSocket;

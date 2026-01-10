const jwt = require('jsonwebtoken');
const userService = require('../services/user.service');


const verifyToken = (req, res, next) => {
   
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(403).json({ message: 'A token is required for authentication' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        // set userid to req
        req.userId = decoded.ma_nguoi_dung;
    } catch (err) {
        return res.status(401).json({ message: err.message});
    }

    return next();
};

const isUserAdmin = async (req, res, next) => {
    try {
        const userId = req.userId;
        const role = await userService.getUserRole(userId);
        if (role === 'admin'){
            next()
        }else {
            return res.status(403).json({ success: false, message: 'Truy cập bị từ chối: Chỉ dành cho Admin' });
        }
    }catch (error){
        return res.status(401).json({message: error.message})
    }
}

module.exports = {
    verifyToken, isUserAdmin
};
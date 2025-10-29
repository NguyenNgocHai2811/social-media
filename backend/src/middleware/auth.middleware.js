const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
   
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(403).json({ message: 'A token is required for authentication' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
    } catch (err) {
        return res.status(401).json({ message: 'Invalid Token' });
    }

    return next();
};

module.exports = {
    verifyToken,
};
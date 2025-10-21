const userService = require('../services/user.service');

const getUserProfile = async (req , res ) => {
    try {
            const user = await userService.getUserById(req.userId);
            res.status(200).json(user);
        } catch(error) {
            res.status(404).json({message: error.message});
        }
};
module.exports = {
    getUserProfile,
}

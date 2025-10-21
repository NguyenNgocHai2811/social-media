const userService = require('../services/user.service');

const getUserProfile = async (req , res ) => {
    try {
            const user = await userService.getUserById(req.userId);
            res.status(200).json(user);
        } catch(error) {
            res.status(404).json({message: error.message});
        }
};

const updateUserAvatar = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({message:'no file upload!'});
    }

    try {
        const updateUser = await userService.updateUserAvatar(req.userId, req.file)
        res.status(200).json(updateUser);
    } catch (error) {
        cloudinary.uploader.destroy(req.file.filename).catch(err => {
            console.error("Failed to delete orphaned avatar after an error:", err);
        });
        res.status(500).json({ message: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    const { ten_hien_thi } = req.body;
    const file = req.file;

    try {
        const updatedUser = await userService.updateUserProfile(req.userId, ten_hien_thi, file);
        res.status(200).json(updatedUser);
    } catch (error) {
        if (file) {
            // If something goes wrong, make sure to delete the uploaded file from Cloudinary
            cloudinary.uploader.destroy(file.filename).catch(err => {
                console.error("Failed to delete orphaned file after an error:", err);
            });
        }
        res.status(500).json({ message: error.message });
    }
};
module.exports = {
    getUserProfile,
    updateUserAvatar,
    updateUserProfile
}

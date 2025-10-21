const userService = require('../services/user.service');
const cloudinary = require('../config/cloudinary');


// get profile of uesr the currently authenticated user
const getMe = async (req, res) => {
    try {
        const user = await userService.getUserById(req.userId);
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
};


const getUserProfile = async(req, res) => {
    try {
        const { userId } = req.params;
        const profileData = await userService.getUserProfileWithPost(userId);
        res.status(200).json(profileData);
     } catch (error) {
        res.status(404).json({message: error.message})
     }
};

// Update the authenticated user's profile
const updateUserProfile = async (req, res) => {
    try {
        // req.body will contain text fields
        // req.files will be an object with fields like 'avatar' and 'anh_bia'
        const updatedUser = await userService.updateUserProfile(req.userId, req.body, req.files);
        res.status(200).json(updatedUser);
    } catch (error) {
        // If the service fails, we should attempt to delete any files that were just uploaded
        if (req.files) {
            if (req.files.avatar) {
                cloudinary.uploader.destroy(req.files.avatar[0].filename).catch(err =>
                    console.error("Failed to delete orphaned avatar after error:", err)
                );
            }
            if (req.files.anh_bia) {
                cloudinary.uploader.destroy(req.files.anh_bia[0].filename).catch(err =>
                    console.error("Failed to delete orphaned cover photo after error:", err)
                );
            }
        }
        res.status(500).json({ message: "Failed to update profile: " + error.message });
    }
};


module.exports = {
    getMe,
    getUserProfile,
    updateUserProfile
}

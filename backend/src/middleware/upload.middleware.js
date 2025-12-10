const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// A single, dynamic storage engine for profile images (avatar and cover photo)
const profileImageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        let folder, transformation, public_id;

        // Determine storage parameters based on the field name
        if (file.fieldname === 'avatar') {
            folder = 'avatars';
            transformation = [{ width: 500, height: 500, crop: 'fill' }];
            // Use req.user.ma_nguoi_dung which is attached by the auth middleware
            public_id = `avatar-${req.user.ma_nguoi_dung}-${uniqueSuffix}`;
        } else if (file.fieldname === 'anh_bia') {
            folder = 'cover_photos';
            transformation = [{ width: 1200, height: 400, crop: 'fill' }];
            public_id = `cover-${req.user.ma_nguoi_dung}-${uniqueSuffix}`;
        } else {
            // Fallback for any other unexpected file field
            folder = 'misc';
            transformation = [];
            public_id = `misc-${req.user.ma_nguoi_dung}-${uniqueSuffix}`;
        }
        
        return {
            folder,
            transformation,
            public_id,
            allowed_formats: ['jpg', 'png', 'jpeg'],
        };
    },
});

// Storage for post images
const postImageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'posts',
      allowed_formats: ['jpg', 'png', 'jpeg'],
      public_id: (req, file) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Use req.user.ma_nguoi_dung which is attached by the auth middleware
        return `post-${req.user.ma_nguoi_dung}-${uniqueSuffix}`;
      },
    },
  });

// Storage for story videos
const storyVideoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'stories',
        resource_type: 'video', 
        allowed_formats: ['mp4'],
        // Attempt to trim on upload to save storage
        transformation: [{ duration: "30.0", crop: "limit" }],
        public_id: (req, file) => {
             const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
             return `story-${req.user.ma_nguoi_dung}-${uniqueSuffix}`;
        }
    }
});


// Middleware for single post image upload
const uploadPostImage = multer({ storage: postImageStorage });

// Middleware for handling both avatar and cover photo uploads in one request
// This now uses the single dynamic storage engine
const uploadProfileImages = multer({ storage: profileImageStorage });

// Middleware for story video upload
const uploadStoryVideo = multer({ storage: storyVideoStorage });

module.exports = {
    uploadPostImage,
    uploadProfileImages, // Use this for updating the user profile
    uploadStoryVideo
};

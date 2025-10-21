const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Storage for user avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'avatars',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 500, height: 500, crop: 'fill' }],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `avatar-${req.userId}-${uniqueSuffix}`;
    },
  },
});

// Storage for user cover photos
const coverPhotoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'cover_photos',
      allowed_formats: ['jpg', 'png', 'jpeg'],
      transformation: [{ width: 1200, height: 400, crop: 'fill' }], // Example dimensions
      public_id: (req, file) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        return `cover-${req.userId}-${uniqueSuffix}`;
      },
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
        return `post-${req.userId}-${uniqueSuffix}`;
      },
    },
  });


// Middleware for single post image upload
const uploadPostImage = multer({ storage: postImageStorage });

// Middleware for handling both avatar and cover photo uploads in one request
const uploadProfileImages = multer({
    storage: (req, file, cb) => {
        if (file.fieldname === 'avatar') {
            cb(null, avatarStorage);
        } else if (file.fieldname === 'anh_bia') {
            cb(null, coverPhotoStorage);
        } else {
            cb(new Error('Invalid field name for file upload'), null);
        }
    }
});


module.exports = {
    uploadPostImage,
    uploadProfileImages // Use this for updating the user profile
};

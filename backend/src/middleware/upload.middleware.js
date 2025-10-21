const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'avatars',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 500, height: 500, crop: 'fill' }],
    public_id: (req, file) => {
      // Generate a unique public_id for the image
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `avatar-${req.userId}-${uniqueSuffix}`;
    },
  },
});

const uploadAvatar = multer({ storage: avatarStorage });



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
const uploadPostImage = multer({ storage: postImageStorage });
module.exports = {
    uploadAvatar,
    uploadPostImage
};
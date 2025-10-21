const multer = require('multer');
const path = require('path');

// set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,'uploads/');
    },
    filename: (req, file, cb) => {
        // create a unique file name
         cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
// create the multer instance
});
const upload = multer({storage: storage});

module.exports = upload;
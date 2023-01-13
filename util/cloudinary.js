const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: "cockbook",
  api_key: "362125891568421",
  api_secret: "kR3bk36ysLWcYuKLy-MN9otXogM",
  secure: true  
});

const storage = new CloudinaryStorage({
  cloudinary,
  allowedFormats: ["audio/mp3"], 
  filename: function (req, file, cb) {
    cb(null, file.originalname); 
  }
});

const uploadCloud = multer({ storage });

module.exports = uploadCloud;
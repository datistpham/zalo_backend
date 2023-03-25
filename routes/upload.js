const router = require("express").Router();
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
    allowedFormats: ['jpg', 'png', 'mp3', 'mp4'],
    filename: function (req, file, cb) {
      cb(null, file.originalname); 
    }
});

const uploadCloud = multer({ storage });
router.post("/api/upload", uploadCloud.single("image"), (req, res)=> {
    if (!req.file) {
        next(new Error('No file uploaded!'));
        return;
    }
    
    res.json({ secure_url: req.file.path });
})

module.exports= router
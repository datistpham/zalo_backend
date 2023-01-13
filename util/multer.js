const multer= require("multer")

const storage= multer.diskStorage({
    destination: function (req, file , cb) {
        cb(null, 'assets/voice')
    },
    filename: function (req, file, cb) {
        cb(null, "voice"+ "-" + Date.now()+ ".mp3")
    }
})

const upload= multer({storage})

module.exports= upload
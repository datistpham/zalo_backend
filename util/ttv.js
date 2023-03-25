const gTTS = require('gtts');
const { v4 } = require('uuid');
const cloudinary = require('cloudinary').v2;

const textToVoiceFunction= (req, res)=> {
  try {
    const gtts = new gTTS(req.body.text, 'vi');
    const id= v4()
    gtts.save(`./assets/textToVoice/${id}.mp3`, async function (err, result) {
      if(err) { throw new Error(err) }
      const voice= await cloudinary.uploader.upload(`./assets/textToVoice/${id}.mp3`, {resource_type: "auto"})
      return res.status(200).json({voice: voice.secure_url})
    });
    
  } catch (error) {
    console.log(error)
    return res.status(200).json({voice: undefined})
  }
}

module.exports= textToVoiceFunction

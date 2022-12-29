const { RtcTokenBuilder, RtcRole } = require('agora-access-token')
const expressAsyncHandler = require('express-async-handler')

const generateToken= expressAsyncHandler(async(req, res)=> {
    try {
        const { appId, channelName, appCertificate, userId }= req.query
        const role = RtcRole.PUBLISHER
        const expirationTimeInSeconds = 3600
        const currentTimestamp = Math.floor(Date.now() / 1000)
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
        const token= RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, userId, role, privilegeExpiredTs)
        return res.status(200).json(token)
        
    } catch (error) {
        return res.status(500).json(error.message)
    }
})

module.exports= {
    generateToken
}
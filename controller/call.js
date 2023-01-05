const { RtcTokenBuilder, RtcRole, RtmTokenBuilder, RtmRole } = require('agora-access-token')
const expressAsyncHandler = require('express-async-handler')

const generateUidToken= expressAsyncHandler(async(req, res)=> {
    try {
        const { appId, appCertificate }= req.query
        const currentTimestamp = Math.floor(Date.now() / 1000)
        const expirationTimeInSeconds = 3600
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
        const account = req.query.account;
        if (!account) {
            return res.status(400).json({ 'error': 'account is required' }).send();
        }
        const key = RtmTokenBuilder.buildToken(appId, appCertificate, account, RtmRole, privilegeExpiredTs);
        return res.json({ 'uid': key }).send();
    } catch (error) {
        return res.status(500).json(error.message)
    }
})

const generateToken= expressAsyncHandler(async(req, res)=> {
    try {
        const { appId, channelName, appCertificate, uid }= req.query
        const role = RtcRole.PUBLISHER
        const expirationTimeInSeconds = 3600
        const currentTimestamp = Math.floor(Date.now() / 1000)
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
        const token= RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs)
        return res.status(200).json(token)
        
    } catch (error) {
        return res.status(500).json(error.message)
    }
})

module.exports= {
    generateToken,
    generateUidToken
}
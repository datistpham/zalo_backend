const jwt = require('jsonwebtoken')

const verifyToken = (req,res,next) => {
    const authHeader = req.header('Authorization')
    if(!authHeader) 
        return res.status(401).json({ success: false, msg: 'No access token provided' })

    //Beaer [token] => split
    const token = authHeader.split(" ")[1]

    jwt.verify(token,process.env.TOKEN_SECRET_KEY, (err,user) => {
        if(err) res.status(403).json({
            success: false, 
            msg: error.message
        })
        req.user = user
        next()
    }) 
    
}
module.exports =  verifyToken
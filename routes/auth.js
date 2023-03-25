const router = require("express").Router();
const authCtrl = require("../controller/authCrl");

router.post("/register", authCtrl.register)
router.post("/login", authCtrl.login) 
router.post("/refresh_token", authCtrl.refreshToken)
router.post("/logout",authCtrl.logout) 
router.post("/reset-password", authCtrl.resetPassword ); 
router.post("/send-sms", authCtrl.sendMail ); 
router.post("/check-user", authCtrl.checkPhone ); 
router.post("/confirm_code", authCtrl.confirm_code)
module.exports = router;

const router = require("express").Router();
const authCtrl = require("../controller/authCrl");

router.post("/register", authCtrl.register)// done it
router.post("/login", authCtrl.login) // done it
router.post("/refresh_token", authCtrl.refreshToken) // unneccessary
router.post("/logout",authCtrl.logout) // done it
router.post("/reset-password", authCtrl.resetPassword ); // do later
router.post("/send-sms", authCtrl.sendMail ); //do later
router.post("/check-user", authCtrl.checkPhone ); // done it
router.post("/confirm_code", authCtrl.confirm_code)
module.exports = router;

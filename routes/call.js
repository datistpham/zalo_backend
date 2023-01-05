const { generateToken, generateUidToken } = require("../controller/call");

const router = require("express").Router();

router.get("/get_token", generateToken)
router.get("/create/uid", generateUidToken)

module.exports= router
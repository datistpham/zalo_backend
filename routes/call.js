const { generateToken } = require("../controller/call");

const router = require("express").Router();

router.get("/get_token", generateToken)

module.exports= router
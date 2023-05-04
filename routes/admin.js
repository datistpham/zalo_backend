const { getUser, updateUser, deleteUser, stats } = require("../controller/admin");

const router = require("express").Router();

router.get("/user", getUser)
router.patch("/user", updateUser)
router.delete("/user", deleteUser)
router.get("/stats", stats)

module.exports= router
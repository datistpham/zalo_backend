const router = require("express").Router();
const messagesCrl = require("../controller/messagesCrl");
const Message = require("../models/Message");

router.post("/", messagesCrl.postMessage) // 
router.get("/:conversationId",messagesCrl.getMessageByConversationId)
router.post("/recall/message/:keyId", messagesCrl.recallMessage)
router.post("/remove/message/:keyId", messagesCrl.removeMessage)
router.get("/media/image", messagesCrl.getDetailImage)
module.exports = router
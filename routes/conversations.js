const router = require("express").Router();
const conversationsCrl = require("../controller/conversationsCrl");

router.post("/", conversationsCrl.postConversation);

router.get("/:userId", conversationsCrl.getConversationByUserId); // done
router.get("/detail/:idConversation",conversationsCrl.getDetailConversation )
router.post("/friend/:friendId", conversationsCrl.getConversationWithFriend); 
router.post("/updateLastMsg/:conversationId", conversationsCrl.updateLastMsg);
router.get("/get-files/:conversationId", conversationsCrl.getFiles);
router.get(
  "/get-image-and-video/:conversationId",
  conversationsCrl.getImageAndVideo
);

router.post("/search/:keyword", conversationsCrl.search); // doing

router.put("/change-label/:id", conversationsCrl.changeLabel);
router.post("/add-member-group/:conversationId", conversationsCrl.addMemberGroup);
router.post("/delete-group/:id", conversationsCrl.deleteGroup);
router.post("/delete-member/:memberId", conversationsCrl.deleteMember);
router.post("/out-group/:id", conversationsCrl.outGroup);

module.exports = router;

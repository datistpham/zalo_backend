const router = require("express").Router();
const userCrl = require("../controller/userCrl");
const User = require("../models/User");

router.put("/change-password/:id", userCrl.changePassword); // do later

router.post("/admin/isActiveUser/:id", userCrl.isActiveUser); // do later
router.get("/", userCrl.getAll);  // get all friend 

// GET ONE
router.get("/:id", userCrl.getUserById); // done

// GET ONE BY PHONE NUMBER
router.get("/phone/:phoneNumber", userCrl.getUserByPhoneNumber); // done

// GET LIST USER SEND REQUEST ADD FRINED BY ME
router.get(
  "/get-list-user-send-request-add-friend-of-me/:id",
  userCrl.getListUserSendRequestAddFriendOfMe
);

router.get("/get/user/request-make-friend/to/me/:id", userCrl.getListUserRequestmakeFriendToMe) // 

router.get("/friends/:userId", userCrl.getListFriend)


// SEND REQUEST ADD FRIEND
router.post("/request-add-friend/:id", userCrl.sendRequestAddFriend);// done

// ACCEPT REQUEST ADD FRIEND
router.post("/accept-add-friend/:id", userCrl.acceptAddFriend);

// Cancel REQUEST ADD FRIEND (thằng gửi nó hủy yêu cầu)
router.post("/cancel-add-friend/:id", userCrl.cancelRequestAddFriend); // done

// Denied REQUEST ADD FRIEND (thằng nhận nó hủy yêu cầu)
router.post("/denied-add-friend/:id", userCrl.deniedRequestAddFriend); // doing

// SUGGESSTION FRIENDS
router.post("/suggestions-friend", userCrl.suggestionsFriend); // doing

// UNFRIEND
router.post("/unfriend/:id", userCrl.unFriend);

// GET USER BY CONTACTS
router.post("/contacts", userCrl.getListUserByContact);

// EDIT USER PROFILE
router.post("/edit-infor/:id", userCrl.editInfo);
router.post("/change-phone/:id", userCrl.changePhone);

router.post("/update/last/conversation/:userId", userCrl.updateLastConversation)
router.get("/get/last/conversation/:userId", userCrl.getLastConversationId)


module.exports = router;

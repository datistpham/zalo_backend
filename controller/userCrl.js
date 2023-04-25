const User = require("../models/User");
const bcrypt = require("bcrypt");
const Mongoose = require("mongoose");
const expressAsyncHandler = require("express-async-handler");
const saltRounds = 10;

class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  paginating() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 9;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
const userCrl = {
  getAll: async (req, res) => {
    try {
      const features = new APIfeatures(
        User.find({ _id: { $exists: true } }),
        req.query
      )
      const users = await features.query
        .populate(
          "friends", "profilePicture gender isAdmin username phoneNumber createdAt status"
        )
        
        .sort("-createdAt");
      res.status(200).json({
        data: users,
        page: parseInt(req.query.page),
        result: users.length,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getListFriend: async (req , res)=> {
      try {
        const users= await User.findOne({
          _id: Mongoose.Types.ObjectId(req.params.userId)
        })
        .populate("friends", "username profilePicture")

        return res.status(200).json({
          data: users,
        });
      } catch (error) {
        return res.status(500).json({ msg: error.message });
      }
  },
  // done
  getListUserSendRequestAddFriendOfMe: async (req, res) => {
    try {
      const userId = req.params.id;
      const users = await User.find({
        friendsQueue: { $in: [userId] },
      }).select("username profilePicture phoneNumber");

      res.status(200).json({
        data: users,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getListUserRequestmakeFriendToMe: async (req, res)=> {
    try {
      const userId = req.params.id;
      const users = await User.findOne({
        _id: Mongoose.Types.ObjectId(userId),
      })

      .populate("friendsQueue", "username profilePicture phoneNumber")

      res.status(200).json({
        data: users,
      });
    } catch (error) {
      
    }
  }
  ,
  // done
  getUserById: async (req, res) => {
    try {
      const user = await User.findById({ _id: req.params.id });
      const { password, updatedAt, ...other } = user._doc;
      res.status(200).json(other);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  isActiveUser: async (req, res) => {
    try {
      const admin = await User.findById({ _id: req.body.userId });

      const user = await User.findById(req.params.id);
      if (admin._doc.isAdmin) {
        const userUpdate = await User.findByIdAndUpdate(
          req.params.id,
          {
            status: !user._doc.status,
          },
          { new: true }
        );
        res
          .status(200)
          .json({ msg: "Update status success", user: userUpdate });
      }
    } catch (err) {
      return res.status(500).json({ msg: err });
    }
  },

  // done
  getUserByPhoneNumber: async (req, res) => {
    try {
      const user = await User.findOne({ phoneNumber: req.params.phoneNumber });
      const { password, updatedAt, ...other } = user._doc;
      res.status(200).json({...other, exist: true});
    } catch (err) {
      return res.status(200).json({ msg: "Không tồn tại!", exist: false });
    }
  },
  getListUserByContact: async (req, res) => {
    try {
      const contacts = req.body.contacts;

      const getUser = async () => {
        let users = [];

        for (let i = 0; i < contacts.length; i++) {
          users.push(
            await User.findOne({
              phoneNumber: contacts[i].split(" ").join(""),
            }).select("-password -updatedAt -createdAt")
          );
        }

        return users.filter((user) => user != null);
      };

      res.status(200).json(await getUser());
    } catch (err) {
      return res.status(200).json({ msg: "Không tồn tại!" });
    }
  },
  
  // done
  sendRequestAddFriend: async (req, res) => {
    try {
      const idcuaMinh = req.body.userId;
      //
      const cuaminh= await User.findById({ _id: req.body.userId})
      const thangNhan = await User.findById({ _id: req.params.id });
      if (thangNhan._doc.friendsQueue.includes(idcuaMinh)) {
        return res.status(200).json({ msg: "Bạn đã gửi yêu cầu kết bạn rồi", request: true, duplicate: true });
      }
      thangNhan._doc.friendsQueue.push(idcuaMinh);

      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: thangNhan._doc,
      });
      res.status(200).json({ msg: "Gửi yêu cầu kết bạn thành công!" , request: true, duplicate: false });
    } catch (err) {
      return res.status(200).json({ err, request: false , duplicate: false });
    }
  },
  acceptAddFriend: async (req, res) => {
    const userId = req.body.userId;
    const friendId = req.params.id;
    try {
      const user = await User.findById(userId);

      const friends = user._doc.friends.push(friendId);
      const friendsQueue = user._doc.friendsQueue.pull(friendId);

      const userUpdate = await User.findOneAndUpdate(
        { _id: userId },
        { $set: user }
        // function (err, docs) {
        //   err &&  res.status(500).json({msg:err.message});
        // }
      );

      const nguoiGui = await User.findById(friendId);
      nguoiGui._doc.friends.push(userId);
      nguoiGui._doc.friendsQueue.pull(userId);

      await User.findOneAndUpdate(
        { _id: friendId },
        { $set: nguoiGui }
        // function (err, docs) {
        //   err &&  res.status(500).json({msg:err.message});
        // }
      );

      res.status(200).json({ nguoiGui, userUpdate });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  cancelRequestAddFriend: async (req, res) => {
    try {
      const nguoiNhan = await User.findById(req.params.id);
      nguoiNhan._doc.friendsQueue.pull(req.body.userId);

      await User.findOneAndUpdate(
        { _id: req.params.id },
        { $set: nguoiNhan }
        // { returnOriginal: false },
        // function (err, docs) {
        //   err && res.status(500).json({ nguoiNhan });
        // }
      );

      res.status(200).json({ msg: "Hủy yêu cầu kết bạn thành công!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deniedRequestAddFriend: async (req, res) => {
    try {
      //user là minh nè
      const user = await User.findById(req.body.userId);

      user._doc.friendsQueue.pull(req.params.id);
      const nguoiGui = await User.findById(req.params.id);

      await User.findOneAndUpdate(
        { _id: req.body.userId },

        { $set: user },
        function (err, docs) {
          err && res.status(500).json({ msg: "that bai" });
        }
      );

      res.status(200).json({ nguoiGui });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  suggestionsFriend: async (req, res) => {
    try {
      const user = await User.findById({ _id: req.body.userId });

      const friends_user = user.friends;

      const result = [];
      if (friends_user.length > 0) {
        for (var i = 0; i < friends_user.length; i++) {
          const a = await User.findById({ _id: friends_user[i] });

          a.friends.forEach((a1) => {
            if (
              a1 !== user._id &&
              friends_user.filter((f) => f == a1)[0] == undefined
            ) {
              result.push(a1);
            }
          });
        }

        return res.status(200).json({ result: result });
      } else {
        const list = await User.find();
        if (list.length >= 10) {
          const nlist = list.slice(0, 10);
          nlist.forEach((u, index) => {
            result.push(u._id);
          });

          return res.status(200).json({ result: result });
        } else {
          list.forEach((u, index) => {
            result.push(u._id);
          });
          return res.status(200).json({ result: result });
        }
      }
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  unFriend: async (req, res) => {
    try {
      const user = await User.findById({ _id: req.body.userId });
      const friend = await User.findById({ _id: req.params.id });
      user._doc.friends.pull(friend._id);
      friend._doc.friends.pull(user._id);

      const userUpdate = await User.findOneAndUpdate(
        { _id: user._id },
        { $set: user },
        { new: true }
      );
      const friendUpdate = await User.findOneAndUpdate(
        { _id: friend._id },
        { $set: friend },
        { new: true }
      );

      res.status(200).json(userUpdate);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  changePassword: async (req, res) => {
    try {
      let user = await User.findById(req.params.id);

      const newPassword = req.body.newPassword;
      const oldPassword = req.body.oldPassword;

      if (await bcrypt.compare(oldPassword, user.password)) {
        if (newPassword.length < 5) {
          return res
            .status(400)
            .json({ msg: "Mật khẩu phải lớn hơn 5 ký tự." });
        }

        const passwordHash = await bcrypt.hash(newPassword, saltRounds);

        user = await User.findByIdAndUpdate(
          req.params.id,
          { password: passwordHash },
          { new: true }
        );
        return res
          .status(200)
          .json({ msg: "Cập nhật mật khẩu thành công", user });
      }

      return res
        .status(400)
        .json({ msg: "Mật khẩu sai, vui lòng kiểm tra lại", user });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  changePhone: async (req, res) => {
    try {
      let user = await User.findById(req.params.id);

      const phoneNumber = req.body.phoneNumber;

      const validPassword = await bcrypt.compare(
        req.body.password.trim(),
        user.password
      );

      if (validPassword) {
        await User.findByIdAndUpdate(
          req.params.id,
          { phoneNumber: phoneNumber },
          { new: true }
        );
        return res
          .status(200)
          .json({ msg: "Cập nhật số điện thoại thành công" });
      }

      return res.status(200).json({ msg: "Cập nhật số điện thoại thất bại" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateLastConversation: async (req, res)=> {
    try {
        const lastMessage= await User.findOneAndUpdate({_id: Mongoose.Types.ObjectId(req.params.userId)}, {lastConversationId: req.body.idConversation})
        return res.status(200).json(lastMessage)
    } catch (err) {
      return res.status(500).json({ msg: err.message });
      
    }
  },
  getLastConversationId: async (req, res)=> {
    try {
      const lastMessage= await User.findOne({_id: Mongoose.Types.ObjectId(req.params.userId)})
      return res.status(200).json(lastMessage)
    } catch (err) {
      return res.status(500).json({ msg: err.message });
      
    }
  },
  editInfo: async (req, res) => {
    try {
      const { newUsername, newProfilePicture, newGender, newCoverPhoto, newAddress } = req.body;

      const u = await User.findById(req.params.id);
      const user = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            username: newUsername,
            profilePicture: newProfilePicture
              ? newProfilePicture
              : u.profilePicture,
            gender: newGender, 
            coverPicture: newCoverPhoto,
            address: newAddress
          },
        },
        { new: true }
      );
      res.status(200).json({ msg: "Cập nhật thông tin thành công", user, status: 200 });
    } catch (err) {
      return res.status(500).json({ msg: err.message, status: 500 });
    }
  },
  //
  deafUser: expressAsyncHandler(async(req, res)=> {
    try {
      await User.updateOne(
        {_id: req.body.id_user},
        {
          isDeaf: req.body.deaf,
        }
      );
      res.status(200).json({ msg: "Update infor user success"});
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }),
  // 
  profileUser: expressAsyncHandler(async (req, res)=> {
    try {
      const userProfile= await User.findOne({"_id": req.params.id});
      res.status(200).json(userProfile);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }),
  update_seen_request: expressAsyncHandler(async (req, res)=> {
    try {
      // console.log(req.body.un_seen)
      const userProfile= await User.findOneAndUpdate({"_id": req.params.id}, {seenRequest: req.body.un_seen});
      res.status(200).json(userProfile);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }),
  statusRequest: expressAsyncHandler(async (req, res)=> {
      const idcuaMinh = req.query.userId;
      //
      // const cuaminh= await User.findById({ _id: req.body.userId})
      const thangNhan = await User.findById({ _id: req.params.id });
      if (thangNhan._doc.friendsQueue.includes(idcuaMinh)) {
        return res.status(200).json({ msg: "Bạn đã gửi yêu cầu kết bạn rồi", request: true, duplicate: true });
      }
      else {
        res.status(200).json({msg: "", request: false, duplicate: false})
      }
  }),

  update_password: expressAsyncHandler(async (req, res)=> {
    const user= await User.findById({_id: req.user.id})
    if(!user) {
      return res.status(401).json({message: "Chưa đăng nhập"})
    }
    else {
      const validPassword = await bcrypt.compare(
        req.body.old_password,
        user.password
      );
      if(!validPassword) {
          return res.status(401).json({message: "Mật khẩu sai"})
      }
      else {
        const newPassword= await bcrypt.hash(req.body.new_password, saltRounds)
        const updateUser= await User.findByIdAndUpdate({_id: req.user.id}, {password: newPassword})
        return res.status(200).json({message: "Cập nhật mật khẩu thành công"})
      }
    }
  })
};
module.exports = userCrl;

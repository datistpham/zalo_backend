const expressAsyncHandler = require("express-async-handler");
const Mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const cloudinary = require('cloudinary').v2;

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
const conversationsCrl = {
  postConversation: async (req, res) => {
    const newConversation = new Conversation({
      label: req.body.label,
      member: req.body.member,
      createdBy: req.body.createdBy,
      imageGroup: req.body.imageGroup
    });

    try {
      const savedConversation = await newConversation.save();
      const conversation = await Conversation.findByIdAndUpdate({
        _id: savedConversation._id,
      }, {id_conversation: savedConversation._id})
        .select("-updatedAt")
        .populate("member", "profilePicture username phoneNumber")
        .populate("lastMessage", "text updatedAt")
        .populate("createdBy", " _id username");

      res.status(200).json(conversation);
    } catch (error) {
      res.status(500).json({ msg: error });
    }
  },
  getDetailConversation: async (req, res)=>  {
    try {
      const conversation= await Conversation.findOne({
        id_conversation: (req.params.idConversation)
      })
      .populate("member", "username profilePicture phoneNumber gender coverPicture address")
      
      return res.status(200).json(conversation)
    }catch (error) {
      res.status(500).json({ msg: error });
    }
  },
  getConversationByUserId: async (req, res) => {
    try {
      const conversations = await Conversation.find({
        member: { $in: [req.params.userId] },
      })
      
        // .limit(10)
        
      .populate("member", "profilePicture username phoneNumber")
      .populate("createdBy", "_id username")

      res.status(200).json(conversations);
    } catch (error) {
      res.status(500).json({ msg: error });
    }
  },
  //
  getConversationWithFriend: async (req, res) => {
    try {
      const conversation = await Conversation.find({
        $and: [
          { member: { $size: 2 } },
          { member: { $all: [req.params.friendId, req.body.userId] } },
        ],
      })
        .select("-updatedAt")
        .populate("member", "profilePicture username phoneNumber")
        .populate("lastMessage", "message updatedAt");
      res.status(200).json(conversation[0]);
    } catch (error) {
      res.status(500).json({ msg: error });
    }
  },
  //
  updateLastMsg: async (req, res) => {
    const msgId = req.body.lastMsgId;
    try {
      const conversation = await Conversation.findOneAndUpdate(
        { _id: req.params.conversationId },
        { lastMessage: msgId }
      )
        .select("-updatedAt")
        .populate("member", "profilePicture username phoneNumber");
      res.status(200).json(conversation);
    } catch (error) {
      res.status(500).json({ msg: error });
    }
  },
  //
  getImageAndVideo: async (req, res) => {
    const media = await Message.aggregate([
      {
        $match: {
          conversation: Mongoose.Types.ObjectId(req.params.conversationId),
        },
      },
      { $match: { media: { $exists: true, $not: { $size: 0 } } } },
      { $project: { media: "$media" } },
      { $unwind: "$media" },
      {
        $match: {
          "media.type": { $in: [/^image/i, /^video/] },
        },
      },
    ]);

    try {
      res.status(200).json({ media });
    } catch (error) {
      res.status(500).json({ msg: error });
    }
  },
  getFiles: async (req, res) => {
    const media = await Message.aggregate([
      {
        $match: {
          conversation: req.params.conversationId,
        },
      },
      {
        $match: {
          $or: [
            {"type_message": "image"},
            {"type_message": "file"},
          ]
          
        },
      },

    ]);

    try {
      res.status(200).json({ media });
    } catch (error) {
      res.status(500).json({ msg: error });
    }
  },
  //search
  search: async (req, res) => {
    function xoa_dau(str) {
      str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
      str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
      str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
      str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
      str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
      str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
      str = str.replace(/đ/g, "d");
      str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
      str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
      str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
      str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
      str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
      str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
      str = str.replace(/Đ/g, "D");
      return str.toLowerCase();
    }
    const keyword = xoa_dau(req.params.keyword);

    const userId = req.body.userId;
    try {
      let converFriend = await Conversation.find({
        $and: [{ member: { $size: 2 } }, { member: { $in: [userId] } }],
      })
        .select("-updatedAt")
        .populate("member", "profilePicture username phoneNumber")
        .populate("lastMessage", "text updatedAt");
      // .find({});
      if (converFriend.length > 0) {
        converFriend = converFriend.filter((item) =>
          item.member.find((element) =>
            xoa_dau(element.username).includes(keyword)
          )
        );
      }

      let converGroup = await Conversation.find({
        $and: [
          {
            $nor: [
              { member: { $exists: false } },
              { member: { $size: 0 } },
              { member: { $size: 1 } },
              { member: { $size: 2 } },
            ],
          },
          { member: { $in: [userId] } },
        ],
      })
        .select("-updatedAt")
        .populate("member", "profilePicture username phoneNumber")
        .populate("lastMessage", "text updatedAt");
      if (converGroup.length > 0) {
        converGroup = converGroup.filter((item) =>
          xoa_dau(item.label).includes(keyword)
        );
      }
      const conversation = converFriend.concat(converGroup);
      res.status(200).json(conversation);
    } catch (error) {
      res.status(500).json({ msg: error });
    }
  },
  // end search
  changeLabel: async (req, res) => {
    try {
      const conversation = await Conversation.findById(req.params.id);
      if (conversation.label !== undefined) {
        await Conversation.findByIdAndUpdate(
          { _id: req.params.id },
          {
            label: req.body.newLabel,
          },
          { new: true }
        );
      }

      res.status(200).json(await Conversation.findById(req.params.id));
    } catch (error) {
      res.status(500).json({ msg: error });
    }
  },

  addMemberGroup: async (req, res) => {
    const { conversationId } = req.params;
    const newMember = req.body.member;
    try {
      const c = await Conversation.findById(conversationId);
      const m = c.member;
      
      if (!c.member.includes(newMember)) m.push(newMember);
      const conversation = await Conversation.findByIdAndUpdate(
        { _id: conversationId },
        {
          member: m,
        },
        { new: true }
      );
      res.status(200).json(conversation);
    } catch (error) {
      res.status(500).json({ msg: error });
    }
  },

  deleteGroup: async (req, res) => {
    const conversationId = req.params.id;

    try {
      const user = req.body.userId;

      const c = await Conversation.findById({ _id: conversationId });
      if (c.createdBy == user) {
        await Conversation.findByIdAndDelete({ _id: conversationId });

        res.status(200).json({ msg: "Xóa nhóm chat thành công!" });
      } else {
        res
          .status(500)
          .json({ msg: "Chỉ có admin mới có quyền xóa nhóm chat" });
      }
    } catch (error) {
      res.status(500).json({ errorMessage: error });
    }
  },
  deleteMember: async (req, res) => {
    const { memberId } = req.params;

    try {
      const { conversationId, userId } = req.body;
      const c = await Conversation.findById(conversationId);

      if (c.createdBy == userId) {
        const m = c.member.pull(memberId);

        const conversation = await Conversation.findByIdAndUpdate(
          { _id: req.body.conversationId },
          {
            member: m,
          },
          { new: true }
        );
        res.status(200).json(conversation);
      } else {
        return res
          .status(500)
          .json({ msg: "Chỉ có admin mới có quyền xóa thành viên" });
      }
    } catch (error) {
      return res.status(500).json({ errorMessage: error });
    }
  },

  //roi nhom
  outGroup: async (req, res) => {
    const { id } = req.params;

    try {
      const { userId } = req.body;
      const c = await Conversation.findById(id);
      const m = c.member.pull(userId);

      const conversation = await Conversation.findByIdAndUpdate(
        { _id: id },
        {
          member: m,
        },
        { new: true }
      );
      res.status(200).json(conversation);
    } catch (error) {
      return res.status(500).json({ errorMessage: error });
    }
  },
  uploadVoice: (async (req, res)=> {
    // cloudinary.config({
    //   cloud_name: "cockbook",
    //   api_key: "362125891568421",
    //   api_secret: "kR3bk36ysLWcYuKLy-MN9otXogM",
    //   secure: true  
    // });
    const result= await cloudinary.uploader.upload(`./${req.file.destination}/${req.file.filename}`, {resource_type: "auto"})
    return res.status(200).json({voice: result.secure_url})
  }),
  updateLastUpdate: expressAsyncHandler(async (idConversation, lastUpdate)=> {
    const result= await Conversation.findOneAndUpdate({id_conversation: idConversation}, {lastUpdate})
    return result
  })
};
module.exports = conversationsCrl;

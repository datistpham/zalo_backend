const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    id_conversation: String,
    member: [{ type: String, ref: "User" }],
    label: String,
    lastMessage: { type: mongoose.Types.ObjectId, ref: "Message" },
    createdBy: { type: mongoose.Types.ObjectId, ref: "User" },
    imageGroup: !String,
    lastUpdate: {type: String, default: new Date().toLocaleString("en-US", { timeZone: 'Asia/Ho_Chi_Minh' })},
    unSeenMessage: {
      type: Number, 
      default: 0
    }
  },
  { timestamps: true }
);
ConversationSchema.index({
  name: "text",
  label: "text",
});
//   ConversationSchema.index({
//     name: "text",
//     'user.username': "text"
//   })
module.exports = mongoose.model("Conversation", ConversationSchema);

const mongoose = require("mongoose")

const MessageSchema = new mongoose.Schema(
    {
        conversation: {type: String, ref: 'Conversation'},
        sender: { type: String, ref: 'User' },
        text: !String,
        media: !Array,
        call: !Object,
        message: String,
        roomId: String,   
        type_message: String,
        key: String,
        data: Object,
        name_file: !String
            
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("Message", MessageSchema);
const mongoose = require("mongoose")
const moment= require("moment")

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
        name_file: !String,
        extend_text: {
            type: String,
            default: ""
        },
        autoplaying: {
            type: Number, 
            default: 1
        },
        time_created: {
            type: String,
            default: moment(new Date()).format("DD/MM/YYYY")
        }
            
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("Message", MessageSchema);
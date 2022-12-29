const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

class APIfeatures {
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }

    paginating(){
        const page = this.queryString.page * 1 ||1
        const limit = this.queryString.limit * 1 ||9
        const skip = (page - 1) * limit
        this.query = this.query.skip(skip).limit(limit)
        return this;
    }
}
const messagesCrl = {
   postMessage: async (req, res) => {
       const {sender, conversation, message, roomId, type_message, key, name_file} = req.body
        if(!conversation || !sender) return
        
        try {
            var newMessage = new Message(({conversation :conversation, sender:sender, key: key, message:message, roomId: roomId, type_message: type_message, name_file: name_file}))
            const savedMessage = await newMessage.save()
            
            res.status(200).json(savedMessage)
        } catch (err) { 
            res.status(500).json({msg: err.message})
        }
    },
    getMessageByConversationId: async (req, res) => {
        try {
            const features = new APIfeatures(Message.find({conversation: req.params.conversationId}), req.query).paginating()
            const messages = await features.query
            .select(' -updatedAt')
            .sort('-createdAt')
            .populate("sender", "username profilePicture createdAt phoneNumber")
            .populate("conversation", "label member createdBy imageGroup")
    
            res.status(200).json({
                data:messages,
                page: parseInt(req.query.page), 
                result: messages.length
            })
        } catch (err) {
            res.status(500).json({msg: err.message})
        }
    },
    recallMessage: async (req, res)=> {
        try {
            const recall= await Message.findOneAndUpdate({key: req.params.keyId}, {type_message: "text", message: req.body.message})
            res.status(200).json({
                data: recall
            })
        } catch (error) {
            res.status(500).json({msg: err.message})
            
        }
    },
    removeMessage: async (req, res)=> {
        try {
            const remove= await Message.findOneAndUpdate({key: req.params.keyId}, {type_message: "text", message: req.body.message})
            res.status(200).json({
                data: remove
            })
        } catch (error) {
            res.status(500).json({msg: err.message})
        }
    }
}
module.exports = messagesCrl
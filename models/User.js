const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
        username: {
            type: String,
            require: true,
            trim:true,
            min: 3,
            // max: 50,
        },
        nickName: {
            type: String,
            trim:true,
            min: 3,
            // max: 50,
        },
        phoneNumber: {
            type: String,
            require: true,
            min: 2,
            unique: true,
        },
        password: {
            type: String,
            require: true,
            min: 6,
        },
        email: {
            type: String,
            require: true,
            min: 6,
        },
        profilePicture: {
            type: String,
            default: "",
        },
        coverPicture: {
            type: String,
            default: "",
        },
        gender:{
            type: Boolean,
            default: true,
        },
        
        friends: [{type: mongoose.Types.ObjectId, ref:'User'}],
        friendsQueue: [{type: mongoose.Types.ObjectId, ref:'User'}],
        isAdmin: {
            type: Boolean,
            default: false,
        },
        desc: {
            type: String,
            max: 50,
        },
        status: {
            type: Boolean,
            default: true,
        },
        lastConversationId: {
            type: !String
        }
    },
    {timestamps: true}
)
UserSchema.index({
    name: "textUsername",
    'username': "text"
  })
module.exports = mongoose.model("User", UserSchema) 
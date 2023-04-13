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
        dateOfBirth: {
            type: String,
        },
        address: {
            type: String
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
        isDeaf: {
            type: Boolean,
            default: false
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
            type: String,
            default: ""
        },
        seenRequest: {
            type: Number,
            default: 0
        },
        coverPicture: {
            type: String,
            default: ""
        },
        address: {
            type: String,
            default: ""
        }
    },
    {timestamps: true}
)
UserSchema.index({
    name: "textUsername",
    'username': "text"
  })
module.exports = mongoose.model("User", UserSchema) 
const mongoose = require('mongoose')

const ConfirmSchema = new mongoose.Schema({
        id_user: {type: String}, 
        code_verify: {type: String},
        email: {type: String}
    },
    {timestamps: true}
)

module.exports = mongoose.model("Confirm", ConfirmSchema) 
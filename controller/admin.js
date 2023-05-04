const Message = require("../models/Message")
const User = require("../models/User")
const moment= require("moment")

const adminController= {
    getUser: async (req, res)=> {
        try {
            const user= await User.find({}, "_id username phoneNumber email address")
            return res.status(200).json(user)

        }
        catch(e ){
            console.log(e)
            return res.status(500).json(e)
        }
    },
    updateUser: async (req, res)=> {

    },
    deleteUser: async (req, res)=> {
        try {
            const deleteUser= await User.deleteOne({_id: req.body.idUser})
            return res.status(200).json({delete: true})
        } catch (error) {
            console.log(e)
            return res.status(500).json(e)
        }
    },
    stats: async (req, res)=> {
        try {
            const stats1= await Message.find({time_created: moment(new Date()).format("DD/MM/YYYY")})
            const stats2= await Message.find({time_created: moment(new Date()).subtract(1, "days").format("DD/MM/YYYY")})
            const stats3= await Message.find({time_created: moment(new Date()).subtract(2, "days").format("DD/MM/YYYY")})
            const stats4= await Message.find({time_created: moment(new Date()).subtract(3, "days").format("DD/MM/YYYY")})
            const stats5= await Message.find({time_created: moment(new Date()).subtract(4, "days").format("DD/MM/YYYY")})
            const stats6= await Message.find({time_created: moment(new Date()).subtract(5, "days").format("DD/MM/YYYY")})
            const stats7= await Message.find({time_created: moment(new Date()).subtract(6, "days").format("DD/MM/YYYY")})
            return res.status(200).json([{time: moment(new Date()).format("DD/MM/YYYY"), stats: stats1?.length || 0},
            {time: moment(new Date()).subtract(1, "days").format("DD/MM/YYYY"), stats: stats2?.length || 0},
            {time: moment(new Date()).subtract(2, "days").format("DD/MM/YYYY"), stats: stats3?.length || 0},
            {time: moment(new Date()).subtract(3, "days").format("DD/MM/YYYY"), stats: stats4?.length || 0},
            {time: moment(new Date()).subtract(4, "days").format("DD/MM/YYYY"), stats: stats5?.length || 0},
            {time: moment(new Date()).subtract(5, "days").format("DD/MM/YYYY"), stats: stats6?.length || 0},
            {time: moment(new Date()).subtract(6, "days").format("DD/MM/YYYY"), stats: stats7?.length || 0},])

        } catch (error) {
            console.log(error)
            return res.status(500).json(error)
            
        }
    }
}

module.exports= adminController
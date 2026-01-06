const mongoose = require("mongoose")

const userschema = mongoose.Schema({
    Fullname: {
        type: String,
        required: true
    },
    Username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String
    },
    avatar: {
        required: true,
        type: String,
        default: "https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o="
    },
    State: {
        required: true,
        type: String,
        default: "Offline"
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    callingId: {
        type: String,
        default: ""
    },
})

const User = mongoose.model("user", userschema)

module.exports = User
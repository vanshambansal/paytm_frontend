const mongoose = require("mongoose")
const { string } = require("zod")
mongoose.connect("mongodb+srv://vansham:94bzpc6nRUAuPIsr@cluster0.suhf8.mongodb.net/paytm")
const userSchema= new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    }
})


const accountschema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    balance:{
        type:Number,
        required:true
    }
})

const Account = mongoose.model("Account",accountschema)
const User=mongoose.model("User",userSchema)




module.exports = {
    User,
    Account
}
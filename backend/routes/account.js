const express= require("express")
const { authmiddleware } = require("../middleware")
const { Account } = require("../db")
const { default: mongoose } = require('mongoose');



const router=express.Router()

router.get("/balance",authmiddleware,async (req,res)=>{
    const account = await Account.findOne({
        userId:req.userId
    })
    res.json({
        balance:account.balance
    })
})

router.post("/transfer",authmiddleware,async(req,res)=>{
    const session=await mongoose.startSession()
    

    session.startTransaction()
    const {amount,to}=req.body

    const account=await Account.findOne({userId:req.userId}).session(session)
    
    if(!account || account.balance<amount){
        await session.abortTransaction()
        return res.status(400).json({
            message:"Insufficient balance"
        })
    }
    const toAccount= await Account.findOne({userId:to}).session(session)

    if(!account){
        await session.abortTransaction()
        return res.status(400).json({
            message:"Invalid account"
        })
    }
    await Account.updateOne({userId:req.userId},{$inc:{balance:-amount}},{session})
    await Account.updateOne({userId:to},{$inc:{balance:amount}},{session})

    await session.commitTransaction()
    res.json({
        message:"Transaction successful"
    })
})
module.exports=router
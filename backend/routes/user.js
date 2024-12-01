const express = require("express")
const Zod=require("zod")
const { User, Account } = require("../db")
const JWT_SECRET = require("./config")
const jwt = require("jsonwebtoken")
const { authmiddleware } = require("../middleware")


const  router = express.Router()

const signupSchema = Zod.object({
    username : Zod.string().email(),
    lastName: Zod.string(),
    firstName : Zod.string(),
    password : Zod.string()

})

router.post("/signup",async (req,res)=>{
    const body =  req.body
    const{success}= signupSchema.safeParse(req.body)
    if(!success){
        return res.json({
            message:"email already taken/incorrect input"
        })
    }
    const  user = await User.findOne({
        username:req.body.username
    })
    if (user){
        return res.status(409).json({
            message:"email already taken/incorrect input"
        })
    }
    const dbuser = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    })

    await Account.create({
        userId:dbuser._id,
        balance:1+Math.random()*1000
    })

    const token = jwt.sign({
        userId:dbuser._id
    },JWT_SECRET)

     
    res.json({
        message:"user created successfully",
        token:token
    })
})

const signinbody=Zod.object({
    username:Zod.string().email(),
    password:Zod.string()
})

router.post('/signin',async(req,res)=>{
const{success}=signinbody.safeParse(req.body)
if(!success){
    return res.status(411).json({
        message:"Email already taken/incorrect inputs"
    })
}
const user = await User.findOne({
    username:req.body.username,
    password:req.body.password
})
if(user){
    const token = jwt.sign({
        userId:user._id
    },JWT_SECRET)

    res.json({
        token:token
    })
    return
}
res.status(411).json({
    message: "Error while logging in"
})
})

const updatebody=Zod.object({
    password:Zod.string().optional(),
    firstName:Zod.string().optional(),
    lastName:Zod.string().optional()
})

router.put("/",authmiddleware,async(req,res)=>{
    const{success}=updatebody.safeParse(req.body)
    if(!success){
       return res.status(411).json({
            message:"Error while updating the information"
        })
    }

    await User.updateOne(req.body,{
        id : req.userId
    })

    res.json({
        message:"updated succesfully"
    })

})


router.get("/bulk",async(req,res)=>{
    const filter = req.query.filter || ""
    const  users =await User.find({
        $or:[{
            firstName:{
                "$regex":filter
            }
        },{lastName:{
            "$regex":filter
        }
    }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })

})



 module.exports= router
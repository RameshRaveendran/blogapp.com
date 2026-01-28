const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();


// register route setup
router.post("/register", async (req , res) => {
    const {email , password} = req.body;

    try {
        // validate the input
        if(!email || !password){
            return res.status(400).josn({
                success: false,
                message: "Email and password are required"
            });
        }
        // if user is find check existing user or not 
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(409),json({
                success: false,
                message: "User already exists"
            });
        }
        // if the user is new hash password
        const hashedPassword = await bcrypt.hash(password , 10);

        // save the user after hashed password
        const user = new User({
            email,
            password: hashedPassword
        });

        await user.save();

        return res.status(201).json({
            success: true,
            message: 'User registerd Successfully'
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});



module.exports = router;
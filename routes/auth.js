const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

// register get route
router.get("/register", (req , res) => {
    res.render("register")
});
// login get route
router.get("/login",(req , res) => {
    res.render("login");
});


// register route setup
router.post("/register", async (req , res) => {
    const {email , password} = req.body;

    // validate the input early
    if(!email || !password){
        return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }
    try {

        
        // if user is find check existing user or not 
        const existingUser = await User.findOne({email});

        
        if(existingUser){


            return res.status(409).json({
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
        if(error.code === 11000){
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }
        console.error("Register Error :" ,error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// login request handler

router.post("/login", async (req , res) => {
    const {email , password} = req.body;

    try {
        
        // validate email and password
        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: 'Email id and password required'
            });
        }
        // find the user by email id
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                success: false,
                message: "Invalid User Check the email id"
            });
        }
        // compare password
        const isMatch = await bcrypt.compare(password , user.password);
        if(!isMatch){
            return res.status(401).json({
                success: false,
                message: "Password is invalid"
            });
        }
        // if its all success create a session for the login
        req.session.userId = user._id;
        console.log("SESSION AFTER LOGIN:", req.session);

    
        return res.status(200).json({
            success: true,
            message: 'Login successful'
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }

});
// logout route handler
router.post('/logout', (req , res) => {
    // distroyer
    req.session.destroy(err => {
        if(err) {
            return res.status(500).json({
                success: false,
                message:"Logout failed"
            });
        }
        // else case clearCookie
        res.clearCookie("connect.sid");
    
        return res.status(200).json({
            success: true,
            message:"Logout successfully"
        });
    });

});



module.exports = router;
const express = require('express');
const Blog = require('../models/Blog');
const requireLogin = require('../middleware/auth');

const router = express.Router();

// Blog creating space
router.post('/blogs',requireLogin, async (req , res ) => {
    console.log("SESSION IN BLOG ROUTE:", req.session);
    const { title , content } = req.body;

    // validate input
    if(!title || !content){
        return res.status(400).json({
            success: false,
            message: "Title and content are required"
        });
    }
    try {
        const blog = new Blog({
            title,
            content,
            author: req.session.userId
        });
        await  blog.save();

        return res.status(201).json({
            success:true,
            message:"Blog created successfully",
            blogId: blog._id
        });


    } catch (error) {
        console.error('Create blog error:',error);
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        });

    }
});
// read all blogs route
router.get("/blogs", async (req, res ) => {
    try {
        const blogs = await Blog.find()
        .populate("author","email")
        .sort({ createdAt: -1});

        return res.status(200).json({
            success: true,
            blogs
        });
    } catch (error) {
        console.error("Fetch blogs error:" , error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
})




module.exports = router;
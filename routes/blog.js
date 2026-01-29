const express = require('express');
const mongoose = require('mongoose');
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
});
// single blog route
router.get("/blogs/:id", async (req , res ) => {
    const { id } = req.params;
    // check valid ObjectId
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({
            success: false,
            message: "Invalid blog id"
        });
    }

    try {
        const blog = await Blog.findById(id)
        .populate("author", "email");
        console.log(blog)

        if(!blog){
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        return res.status(200).json({
            success: true,
            blog
        });
    } catch (error) {
        console.error( "Fetch blog error:" ,error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});
// update blog 
router.put("/blogs/:id", requireLogin, async (req, res) => {
    const { id } = req.params;
    const { title , content} = req.body;

    // validate ObjectId
    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success:false,
            message:"Invalid blog id"
        });
    }
    try {
        const blog = await Blog.findById(id);

        if(!blog){
            return res.status(404).json({
                success: false,
                message:"Blog not found"
            });
        }
        // ownership Check
        if(blog.author.toString() !== req.session.userId) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to edit this blog"
            });
        }
        // update field
        if(title) blog.title = title;
        if(content) blog.content = content;

        await blog.save();

        // success note
        return res.status(200).json({
            success: true,
            message: "Blog updated Successfully"
        });

    } catch (error) {
        console.error("Update blog error:" , error);
        return res.status(500).json({
            success: false,
            message:"Internal server error"
        });
    }
});




module.exports = router;
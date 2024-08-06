// routes/comments.js
const express = require('express');
const router = express.Router();
const { ensureAuth } = require('./auth');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');

router.post('/:blogId/comments', ensureAuth, async (req, res) => {
    const { blogId } = req.params;
    const { text } = req.body;

    try {
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const comment = new Comment({
            text,
            user: req.user._id, // Ensure this is populated correctly
            blog: blogId
        });

        await comment.save();

        blog.comments.push(comment);
        await blog.save();

        res.status(201).json(await comment.populate('user', 'name')); // Populate user details
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;

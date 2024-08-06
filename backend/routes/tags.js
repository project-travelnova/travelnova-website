const express = require('express');
const router = express.Router();
const Tag = require('../models/tag');

// Get all tags
router.get('/', async (req, res) => {
    try {
        const tags = await Tag.find();
        res.json(tags);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new tag
router.post('/', async (req, res) => {
    const tag = new Tag({
        name: req.body.name
    });

    try {
        const newTag = await tag.save();
        res.status(201).json(newTag);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;

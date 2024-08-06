const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { ensureAuth } = require('../routes/auth');

// Update user profile
router.put('/profile', ensureAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.dob = req.body.dob || user.dob;
        user.gender = req.body.gender || user.gender;
        user.bio = req.body.bio || user.bio;
        user.instagram = req.body.instagram || user.instagram;

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

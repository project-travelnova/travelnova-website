const express = require('express');
const passport = require('passport');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Function to create a token
function createToken(user) {
    const payload = {
        id: user._id,
        name: user.name,
        email: user.email
    };

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
}

const ensureAuth = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (err) {
        console.error('JWT verification failed:', err);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Signup
router.post('/signup', async (req, res) => {
    const { name, email, password, dob } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({
            name,
            email,
            password,
            dob
        });

        const newUser = await user.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            const token = createToken(user);
            res.json({ user, token });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        const token = createToken(req.user);
        res.redirect(`http://localhost:3000/auth/success?token=${token}`);
    }
);

// Facebook Auth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get(
    '/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    (req, res) => {
        const token = createToken(req.user);
        res.redirect(`http://localhost:3000/auth/success?token=${token}`);
    }
);

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

module.exports = {
    ensureAuth,
    router
};

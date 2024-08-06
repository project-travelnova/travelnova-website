const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const Tag = require('../models/tag');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { ensureAuth } = require('../routes/auth');

function createToken(user) {
    const payload = {
        id: user._id,
        name: user.name,
        email: user.email
    };

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
}

// Set up multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only jpg, jpeg, and png are allowed.'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Create a new blog post
router.post('/', ensureAuth, upload.single('image'), async (req, res) => {
    const { title, description, author, date, tag } = req.body;
    const image = req.file ? req.file.path : null;

    try {
        const tagDoc = await Tag.findById(tag);
        if (!tagDoc) {
            return res.status(404).json({ message: 'Tag not found' });
        }

        const blog = new Blog({
            title,
            description,
            author,
            date,
            image,
            tag: tagDoc._id
        });

        const newBlog = await blog.save();
        res.status(201).json(newBlog);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});



// Get all blogs
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.json(blogs);
    } catch (err) {
        console.error('Error fetching blogs:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate({
            path: 'comments',
            populate: {
                path: 'user',
                select: 'name'
            }
        });
        if (!blog) {
            return res.status(404).json({ message: 'Cannot find blog' });
        }
        res.json(blog);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get blogs by tag
router.get('/tag/:tagId', async (req, res) => {
    try {
        const blogs = await Blog.find({ tag: req.params.tagId }).populate('tag');
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a blog post
router.put('/:id', upload.single('image'), async (req, res) => {
    const { title, description, date } = req.body;
    const image = req.file ? req.file.path : req.body.image; // Use the existing image if no new image is provided

    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Cannot find blog' });
        }

        blog.title = title || blog.title;
        blog.description = description || blog.description;
        blog.date = date || blog.date;
        blog.image = image || blog.image;

        const updatedBlog = await blog.save();
        res.json(updatedBlog);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Function to verify JWT token
const verifyToken = (req) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        console.error('No token provided');
        return null;
    }

    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        console.error('JWT verification failed:', err);
        return null;
    }
};

// Delete a blog post
router.delete('/:id', async (req, res) => {
    try {
        console.log('Delete request received');
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            console.error('Blog not found');
            return res.status(404).json({ message: 'Cannot find blog' });
        }

        const decoded = verifyToken(req);
        console.log('Decoded token:', decoded); // Log decoded token
        console.log('Blog author:', blog.author); // Log blog author

        if (!decoded || decoded.name !== blog.author) {
            console.error('Access denied');
            return res.status(403).json({ message: 'Access denied' });
        }

        await Blog.deleteOne({ _id: req.params.id });
        res.json({ message: 'Blog deleted' });
    } catch (err) {
        console.error('Error deleting blog:', err); // Log error
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

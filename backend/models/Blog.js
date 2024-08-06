const mongoose = require('mongoose');
/*
const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    image: {
        type: String, // Store the image path as a string
        required: false
    }
});

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;
*/

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    image: {
        type: String, // Store the image path as a string
        required: false
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
            required: false
        }
    ],
    tag: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
        required: true
    }
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;

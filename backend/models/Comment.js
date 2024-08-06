// models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true }
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;

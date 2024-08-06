const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const blogRoutes = require('./routes/blogs');
const authRoutes = require('./routes/auth');
const commentsRouter = require('./routes/comments');
const contactRouter = require('./routes/contact'); // Add this line
const app = express();
const port = process.env.PORT || 5000;

require('dotenv').config();


// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());
app.use('/uploads', express.static('uploads'));
app.use(express.json());

// Passport config
require('./config/passport');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/travelnova', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes

app.use('/api', authRoutes.router);
app.use('/api/auth', authRoutes.router);
app.use('/api/blogs', blogRoutes);
app.use('/api/comments', commentsRouter);
app.use('/api/contact', contactRouter); // Add this line

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err });
});

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));

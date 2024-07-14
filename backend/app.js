// backend/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());

require('./config/passport');

mongoose.connect('mongodb://localhost:27017/travelnova', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

const authRouter = require('./routes/auth');
const blogsRouter = require('./routes/blogs');

app.use('/api/auth', authRouter);
app.use('/api/blogs', blogsRouter);

app.listen(port, () => console.log(`Server running on port ${port}`));


const jwt = require('jsonwebtoken');
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

module.exports = createToken;

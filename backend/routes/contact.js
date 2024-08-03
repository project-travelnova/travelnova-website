const express = require('express');
const router = express.Router();

// Define the contact route
router.post('/contact', (req, res) => {
    const { firstName, lastName, email, message } = req.body;

    // Handle the received data here (e.g., save to database, send email, etc.)

    console.log(`Received contact form submission: ${firstName} ${lastName} - ${email} - ${message}`);
    
    // For now, just send a success response
    res.status(200).json({ message: 'Contact form submitted successfully' });
});

module.exports = router;

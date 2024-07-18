const express = require('express');
const router = express.Router();
const User = require('../models/User');

// User login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).send('User not found');
        }

        if (user.password !== password) {
            return res.status(400).send('Invalid password');
        }

        res.send('Login successful');
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;

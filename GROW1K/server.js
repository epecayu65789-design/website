console.log("Hey! The server is attempting to start...");   
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/amplifai';
mongoose.connect(mongoURI)
  .then(() => console.log('Connected securely to MongoDB Cluster.'))
  .catch(err => console.error('Database connection error:', err));

// Database Schema
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    channel: { type: String, required: true },
    projectedFollowers: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// API Endpoint: Process growth metrics and store user
app.post('/api/grow', async (req, res) => {
    try {
        const { firstName, lastName, channel } = req.body;

        if (!firstName || !lastName || !channel) {
            return res.status(400).json({ error: 'All fields are strictly required.' });
        }

        // Algorithmic calculation based on character weights
        const projectedFollowers = ((firstName.length + lastName.length) * 1234) + 2450;

        // Save data to Database
        const newUser = new User({
            firstName,
            lastName,
            channel,
            projectedFollowers
        });
        await newUser.save();

        // Respond back to frontend
        res.status(200).json({
            success: true,
            firstName,
            lastName,
            channel,
            projectedFollowers,
            userId: newUser._id
        });

    } catch (error) {
        console.error('Server processing error:', error);
        res.status(500).json({ error: 'Internal system server error.' });
    }
});

// Secure API Endpoint to fetch all user inputs for the Admin panel
app.get('/api/admin/data', async (req, res) => {
    try {
        // Fetch all users from the database, sorted by the newest first
        const records = await User.find().sort({ createdAt: -1 });
        res.status(200).json(records);
    } catch (error) {
        console.error('Failed to retrieve records:', error);
        res.status(500).json({ error: 'Internal system data retrieval error.' });
    }
});

// Fallback to index.html for undefined routes
app.get('*splat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server executing live on port ${PORT}`);
});
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
// Default to 10000 to match Render's standard configuration visible in previous logs.
const PORT = process.env.PORT || 10000; 

// ==========================================
// MIDDLEWARE CONFIGURATION
// ==========================================
app.use(cors());
app.use(express.json());

// Serve static frontend files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// DATABASE SETUP & SCHEMA
// ==========================================
// Use the cloud MONGODB_URI environment variable you configured on Render.
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
    console.error("CRITICAL ERROR: MONGODB_URI environment variable is not defined on Render.");
    process.exit(1); // Stop server immediately if database link is missing
}

mongoose.connect(mongoURI)
  .then(() => console.log('✅ Connected securely to MongoDB Atlas Cloud Cluster.'))
  .catch(err => console.error('❌ Database connection error:', err));

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    channel: { type: String, required: true },
    projectedFollowers: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now } // Standard timestamp for tracking
});

const User = mongoose.model('User', userSchema);

// ==========================================
// CORE API ENDPOINTS (Must stay above fallback)
// ==========================================

// 1. Process growth metrics and store user data
app.post('/api/grow', async (req, res) => {
    try {
        const { firstName, lastName, channel } = req.body;

        if (!firstName || !lastName || !channel) {
            return res.status(400).json({ error: 'All fields are strictly required.' });
        }

        // Standard algorithmic calculation based on character weights
        const projectedFollowers = ((firstName.length + lastName.length) * 1234) + 2450;

        // Save data to Database
        const newUser = new User({
            firstName,
            lastName,
            channel,
            projectedFollowers
        });
        await newUser.save();

        // Respond back to frontend success screen
        res.status(200).json({
            success: true,
            firstName,
            lastName,
            channel,
            projectedFollowers,
            userId: newUser._id
        });

    } catch (error) {
        console.error('❌ Server processing error:', error);
        res.status(500).json({ error: 'Internal system server error.' });
    }
});

// 2. Fetch all user inputs for the Admin panel (SORTED FIX)
app.get('/api/admin/data', async (req, res) => {
    try {
        // Fetch ALL users from the database.
        // The .sort() is key: -1 means descending (newest first).
        const records = await User.find().sort({ createdAt: -1 });
        
        console.log(`✅ Retrieved ${records.length} total records for admin panel.`);
        res.status(200).json(records);
    } catch (error) {
        console.error('❌ Failed to retrieve records:', error);
        res.status(500).json({ error: 'Internal system data retrieval error.' });
    }
});

// ==========================================
// EXPRESS V5 FALLBACK ROUTE (Must be dead last)
// ==========================================
app.get('*splat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 AmplifAI Server executing live on port ${PORT}`);
});
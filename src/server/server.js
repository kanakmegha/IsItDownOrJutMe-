const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS.split(',')
}));
app.use(express.json());

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

// Route to check website status
app.post('/api/check', async (req, res) => {
    const { url } = req.body;
    
    try {
        new URL(url);
    } catch (err) {
        return res.status(400).json({ error: 'Invalid URL format' });
    }

    try {
        const startTime = Date.now();
        const response = await axios.get(url, {
            timeout: parseInt(process.env.REQUEST_TIMEOUT),
            validateStatus: false
        });
        const endTime = Date.now();
        
        const result = {
            status: response.status >= 200 && response.status < 400 ? 'UP' : 'DOWN',
            statusCode: response.status,
            responseTime: endTime - startTime,
            timestamp: new Date().toISOString(),
            url: url
        };
        
        res.json(result);
    } catch (error) {
        res.json({
            status: 'DOWN',
            statusCode: error.response?.status || 0,
            responseTime: 0,
            timestamp: new Date().toISOString(),
            url: url,
            error: error.message
        });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
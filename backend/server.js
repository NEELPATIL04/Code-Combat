const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock user database
const users = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'player1', password: 'pass123', role: 'participant' },
    { username: 'player2', password: 'pass123', role: 'participant' },
];

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user
    const user = users.find(
        (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (user) {
        // Successful login
        return res.status(200).json({
            message: 'Login successful',
            role: user.role,
            username: user.username,
            token: 'jwt-token-' + Date.now() // Mock token
        });
    } else {
        // Invalid credentials
        return res.status(401).json({ message: 'Invalid username or password' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Code Combat Backend running on http://localhost:${PORT}`);
});

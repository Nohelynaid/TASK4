const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./db');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Main route (serves frontend)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Test route
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Server is running correctly' });
});

// User registration
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const result = await db.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
            [name, email, password]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') { // unique constraint violation
            res.status(400).json({ message: 'Email is already registered' });
        } else {
            console.error('Error in /register:', err);
            res.status(500).json({ error: 'Failed to register user' });
        }
    }
});

// User login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await db.query(
            'SELECT * FROM users WHERE email = $1 AND password = $2',
            [email, password]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.is_blocked) {
            return res.status(403).json({ message: 'Your account is blocked' });
        }

        // Update last login time
        await db.query(
            'UPDATE users SET last_login = NOW() WHERE id = $1',
            [user.id]
        );

        res.json({ message: 'Login successful', userId: user.id });
    } catch (err) {
        console.error('Error in /login:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, name, email, is_blocked, last_login FROM users ORDER BY last_login DESC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Block users
app.put('/api/users/block', async (req, res) => {
    const { userIds } = req.body;
    try {
        await db.query('UPDATE users SET is_blocked = TRUE WHERE id = ANY($1)', [ids]);
        res.json({ message: 'Users blocked successfully' });
    } catch (err) {
        console.error('Error blocking users:', err);
        res.status(500).json({ error: 'Failed to block users' });
    }
});

// Unblock users
app.put('/api/users/unblock', async (req, res) => {
    const { userIds } = req.body;
    try {
        await db.query('UPDATE users SET is_blocked = FALSE WHERE id = ANY($1)', [ids]);
        res.json({ message: 'Users unblocked successfully' });
    } catch (err) {
        console.error('Error unblocking users:', err);
        res.status(500).json({ error: 'Failed to unblock users' });
    }
});

// Delete users
app.delete('/api/users/delete', async (req, res) => {
    const { userIds } = req.body;
    try {
        await db.query('DELETE FROM users WHERE id = ANY($1)', [ids]);
        res.json({ message: 'Users deleted successfully' });
    } catch (err) {
        console.error('Error deleting users:', err);
        res.status(500).json({ error: 'Failed to delete users' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

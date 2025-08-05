const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./db');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Servir archivos estáticos
app.use(express.static(__dirname));

// Ruta principal para el frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta de prueba
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Servidor conectado correctamente' });
});

// Ruta de registro
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const result = await db.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
            [name, email, password]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error en /register:', err);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});
// Obtener todos los usuarios
app.get('/api/users', async (req, res) => {
    try {
        const result = await db.query('SELECT id, name, email, is_blocked, last_login FROM users ORDER BY last_login DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener usuarios:', err);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// Bloquear usuarios
app.post('/api/users/block', async (req, res) => {
    const { ids } = req.body; // array de IDs
    try {
        await db.query('UPDATE users SET is_blocked = TRUE WHERE id = ANY($1)', [ids]);
        res.json({ message: 'Usuarios bloqueados' });
    } catch (err) {
        console.error('Error al bloquear:', err);
        res.status(500).json({ error: 'Error al bloquear usuarios' });
    }
});

// Desbloquear usuarios
app.post('/api/users/unblock', async (req, res) => {
    const { ids } = req.body;
    try {
        await db.query('UPDATE users SET is_blocked = FALSE WHERE id = ANY($1)', [ids]);
        res.json({ message: 'Usuarios desbloqueados' });
    } catch (err) {
        console.error('Error al desbloquear:', err);
        res.status(500).json({ error: 'Error al desbloquear usuarios' });
    }
});

// Eliminar usuarios
app.post('/api/users/delete', async (req, res) => {
    const { ids } = req.body;
    try {
        await db.query('DELETE FROM users WHERE id = ANY($1)', [ids]);
        res.json({ message: 'Usuarios eliminados' });
    } catch (err) {
        console.error('Error al eliminar:', err);
        res.status(500).json({ error: 'Error al eliminar usuarios' });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

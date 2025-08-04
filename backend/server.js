const express = require('express');
const dotenv = require('dotenv');
const db = require('./db');
const PORT = process.env.PORT || 3000;
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Ruta de prueba
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Servidor conectado a Vercel y Neon correctamente' });
});

// Ruta de registro ejemplo
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await db.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
            [email, password]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error en /register:', err);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});


app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});


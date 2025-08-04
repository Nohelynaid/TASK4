const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./db');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 🟢 Servir archivos estáticos desde la raíz del proyecto
app.use(express.static(path.join(__dirname, '..')));

// 🟢 Ruta principal que entrega el index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Ruta de prueba
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Servidor connected to Render ' });
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
    console.error('Error in /register:', err);
    res.status(500).json({ error: 'Error registering user' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

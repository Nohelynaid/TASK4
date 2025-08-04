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
// Ruta de registro
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const result = await db.query(
      'INSERT INTO users (name, email, password, is_blocked, created_at) VALUES ($1, $2, $3, false, NOW()) RETURNING *',
      [name, email, password]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error en /api/register:', error.message);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});




app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

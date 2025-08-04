const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./db');
const bcrypt = require('bcrypt');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir archivos estáticos si aplica (solo si usas frontend en Vercel, esto puede no ser necesario)
app.use(express.static(__dirname));

// Ruta principal para probar conexión
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Servidor conectado correctamente' });
});

// Ruta de registro
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      'INSERT INTO users (name, email, password, is_blocked, created_at) VALUES ($1, $2, $3, false, NOW()) RETURNING *',
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: 'Registration successful', user: result.rows[0] });
  } catch (error) {
    console.error('Error en /api/register:', error.message);
    res.status(500).json({ message: 'Error en el servidor: ' + error.message });
  }
});

// Ruta de login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Email no registrado' });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    if (user.is_blocked) {
      return res.status(403).json({ message: 'Usuario bloqueado' });
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Error en /api/login:', error.message);
    res.status(500).json({ message: 'Error en el servidor: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

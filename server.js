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
    const response = await fetch('https://task4-gous.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });

    const text = await response.text(); // 👈 para poder ver qué te regresa realmente
    let data;

    try {
        data = JSON.parse(text); // 👈 evita crasheo si no es JSON
    } catch {
        throw new Error('Server did not return JSON: ' + text);
    }

    if (response.ok) {
        registerMessage.textContent = 'Registration successful.';
        registerMessage.style.color = 'green';
    } else {
        registerMessage.textContent = data.message || 'Registration failed';
        registerMessage.style.color = 'red';
    }

} catch (error) {
    registerMessage.textContent = 'Error: ' + error.message;
    registerMessage.style.color = 'red';
}



app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

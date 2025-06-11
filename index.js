const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Para recibir JSON en POST
app.use(express.static(__dirname));

// Middleware CORS (opcional)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// Ruta para servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para servir users.json
app.get('/users.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'users.json'));
});

// Ruta para registrar usuario
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send("Faltan datos");

  const usersPath = path.join(__dirname, "users.json");
  const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));

  if (users.find(u => u.username === username)) {
    return res.status(409).send("Usuario ya existe");
  }

  users.push({ username, password, premium: false });
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  res.send("Usuario registrado con éxito");
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor OK en puerto ${PORT}`);
});
// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = 3000;

// ------------------ BASE DE DATOS ------------------

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('❌ Error al conectar la base de datos:', err);
  } else {
    console.log('✅ Conectado a la base de datos SQLite');
  }
});

// Crear tabla de profesionales si no existe
db.run(`CREATE TABLE IF NOT EXISTS profesionales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT,
  oficio TEXT,
  delegacion TEXT,
  descripcion TEXT,
  contacto TEXT,
  foto TEXT
)`);

// Crear tabla de contactos si no existe
db.run(`CREATE TABLE IF NOT EXISTS contactos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT,
  correo TEXT,
  mensaje TEXT
)`);

// ------------------ MIDDLEWARE ------------------

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------- RUTAS HTML ---------------------

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/registrar.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'registrar.html'));
});

app.get('/contacto.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'contacto.html'));
});

app.get('/busqueda.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'busqueda.html'));
});

app.get('/profesionales.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'profesionales.html'));
});

app.get('/perfil.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'perfil.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// --------------------- API PROFESIONALES ---------------------

// Registrar profesional
app.post('/api/profesionales', (req, res) => {
  const { nombre, oficio, delegacion, descripcion, contacto, foto } = req.body;
  db.run(
    `INSERT INTO profesionales (nombre, oficio, delegacion, descripcion, contacto, foto) VALUES (?, ?, ?, ?, ?, ?)`,
    [nombre, oficio, delegacion, descripcion, contacto, foto],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al registrar profesional' });
      }
      res.json({ id: this.lastID });
    }
  );
});

// Buscar profesionales (con filtro)
app.get('/api/buscar', (req, res) => {
  const { oficio, delegacion } = req.query;

  let query = `SELECT * FROM profesionales WHERE 1=1`;
  const params = [];

  if (oficio) {
    query += ` AND LOWER(oficio) = LOWER(?)`;
    params.push(oficio);
  }

  if (delegacion) {
    query += ` AND LOWER(delegacion) = LOWER(?)`;
    params.push(delegacion);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error en la búsqueda' });
    }
    res.json(rows);
  });
});

// Listar todos los profesionales
app.get('/api/profesionales', (req, res) => {
  db.all('SELECT * FROM profesionales', (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al obtener profesionales' });
    }
    res.json(rows);
  });
});

// Obtener profesional individual
app.get('/api/profesional/:id', (req, res) => {
  db.get('SELECT * FROM profesionales WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al obtener profesional' });
    }
    res.json(row);
  });
});

// Eliminar profesional individual
app.delete('/api/profesionales/:id', (req, res) => {
  db.run('DELETE FROM profesionales WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al eliminar profesional' });
    }
    res.json({ message: 'Profesional eliminado' });
  });
});

// Eliminar todos los profesionales (para el admin)
app.delete('/api/borrar-todos', (req, res) => {
  db.run('DELETE FROM profesionales', function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al eliminar todos' });
    }
    res.json({ message: 'Todos los profesionales fueron eliminados' });
  });
});

// --------------------- API CONTACTO ---------------------

app.post('/api/contacto', (req, res) => {
  const { nombre, correo, mensaje } = req.body;
  db.run(
    `INSERT INTO contactos (nombre, correo, mensaje) VALUES (?, ?, ?)`,
    [nombre, correo, mensaje],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al guardar contacto' });
      }
      res.json({ id: this.lastID });
    }
  );
});

// --------------------- API DESTACADOS ---------------------

app.get('/api/destacados', (req, res) => {
  db.all('SELECT * FROM profesionales ORDER BY id DESC LIMIT 3', (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al obtener destacados' });
    }
    res.json(rows);
  });
});

// --------------------- 404 PERSONALIZADO ---------------------

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

// --------------------- INICIAR SERVIDOR ---------------------

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
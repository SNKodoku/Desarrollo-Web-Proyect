// db.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// Crear tablas si no existen
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS profesionales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      oficio TEXT NOT NULL,
      delegacion TEXT NOT NULL,
      descripcion TEXT,
      contacto TEXT,
      foto TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS contactos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      correo TEXT NOT NULL,
      mensaje TEXT NOT NULL,
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
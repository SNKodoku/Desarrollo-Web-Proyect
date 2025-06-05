DROP TABLE IF EXISTS profesionales;
DROP TABLE IF EXISTS contactos;

CREATE TABLE profesionales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  oficio TEXT NOT NULL,
  delegacion TEXT NOT NULL,
  descripcion TEXT,
  contacto TEXT,
  foto TEXT
);

CREATE TABLE contactos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  correo TEXT NOT NULL,
  mensaje TEXT NOT NULL
);
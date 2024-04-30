const fs = require('fs');
const express = require('express');
const app = express();
const { Pool } = require('pg');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('./ca.pem').toString(),
  },
};


const pool = new Pool(dbConfig);

app.use(express.json());

app.get('/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM data');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка' });
  }
});

app.post('/users', async (req, res) => {
  const { user_name } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO data (user_name) VALUES ($1) RETURNING *',
      [user_name]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка' });
  }
});

app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM data WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Користувача не знайдено' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка' });
  }
});

app.patch('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { user_name } = req.body;
  try {
    const { rowCount } = await pool.query(
      'UPDATE data SET user_name = $1 WHERE id = $2 RETURNING *',
      [user_name, id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Користувача не знайдено' });
    }
    res.status(200).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка' });
  }
});

app.listen(3000, () => {
  console.log('Сервер запущено на порті 3000');
});
// config/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Путь к БД из переменных окружения или по умолчанию
const dbPath = process.env.DB_PATH || path.join(__dirname, '../database.sqlite');

// Подключение к базе
const db = new sqlite3.Database(dbPath);

// Инициализация таблиц
function initTables() {
return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Таблица пользователей
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT
    )`);

      // Таблица постов
    db.run(`CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        edited_at DATETIME,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

      // Таблица лайков
    db.run(`CREATE TABLE IF NOT EXISTS likes (
        post_id INTEGER,
        user_id INTEGER,
        PRIMARY KEY(post_id, user_id),
        FOREIGN KEY(post_id) REFERENCES posts(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

      // Таблица дизлайков
    db.run(`CREATE TABLE IF NOT EXISTS dislikes (
        post_id INTEGER,
        user_id INTEGER,
        PRIMARY KEY(post_id, user_id),
        FOREIGN KEY(post_id) REFERENCES posts(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

      // Добавляем колонку edited_at, если её нет
    db.run(`ALTER TABLE posts ADD COLUMN edited_at DATETIME`, (err) => {
        if (err && !err.message.includes('duplicate')) {
        console.error('❌ Ошибка инициализации БД:', err);
        reject(err);
        } else {
        console.log('✅ Таблицы БД готовы');
        resolve();
        }
    });
    });
});
}

module.exports = { db, initTables };
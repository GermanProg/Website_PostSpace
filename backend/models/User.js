// models/User.js
const bcrypt = require('bcryptjs');
const { db } = require('../config/database');

// Создание пользователя
function createUser(username, email, password) {
return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, async (err, hashed) => {
    if (err) return reject(err);
    
    db.run(
        `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
        [username, email, hashed],
        function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, username });
        }
    );
    });
});
}

// Поиск по логину
function findByUsername(username) {
return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (err) return reject(err);
    resolve(user);
    });
});
}

// Поиск по ID
function findById(id) {
return new Promise((resolve, reject) => {
    db.get(`SELECT id, username FROM users WHERE id = ?`, [id], (err, user) => {
    if (err) return reject(err);
    resolve(user);
    });
});
}

// Проверка пароля
async function verifyPassword(user, password) {
return await bcrypt.compare(password, user.password);
}

module.exports = { createUser, findByUsername, findById, verifyPassword };
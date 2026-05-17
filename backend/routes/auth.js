// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const { createUser, findByUsername, findById, verifyPassword } = require('../models/User');
const auth = require('../middleware/auth');

const SECRET = process.env.JWT_SECRET;

// Регистрация
router.post('/register', async (req, res) => {
try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
    return res.status(400).json({ message: 'Все поля обязательны' });
    }
    
    const user = await createUser(username, email, password);
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ token });
} catch (err) {
    if (err.message.includes('UNIQUE')) {
    return res.status(400).json({ message: 'Пользователь уже существует' });
    }
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
}
});

// Вход
router.post('/login', async (req, res) => {
try {
    const { username, password } = req.body;
    
    if (!username || !password) {
    return res.status(400).json({ message: 'Введите логин и пароль' });
    }
    
    const user = await findByUsername(username);
    if (!user) {
    return res.status(400).json({ message: 'Неверные данные' });
    }
    
    const valid = await verifyPassword(user, password);
    if (!valid) {
    return res.status(400).json({ message: 'Неверные данные' });
    }
    
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '7d' });
    res.json({ token });
} catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
}
});

// Получение данных текущего пользователя
router.get('/me', auth, async (req, res) => {
try {
    const user = await findById(req.userId);
    if (!user) {
    return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json(user);
} catch (err) {
    console.error('Ошибка получения профиля:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
}
});

module.exports = router;
// middleware/auth.js
const jwt = require('jsonwebtoken');

// Секрет из переменных окружения
const SECRET = process.env.JWT_SECRET;

function auth(req, res, next) {
  // В продакшене SECRET обязателен!
if (!SECRET && process.env.NODE_ENV === 'production') {
    return res.status(500).json({ message: 'JWT_SECRET не настроен' });
}

const token = req.headers.authorization?.split(' ')[1];

if (!token) {
    return res.status(401).json({ message: 'Нет токена' });
}

try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    req.username = decoded.username;
    next();
} catch (err) {
    res.status(401).json({ message: 'Неверный токен' });
}
}

module.exports = auth;
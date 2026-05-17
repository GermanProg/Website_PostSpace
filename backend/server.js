// server.js — ТОЧКА ВХОДА
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const { initTables } = require('./config/database');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

const app = express();
const PORT = process.env.PORT || 3000;

// === MIDDLEWARE ===
app.use(helmet());                    // Защита заголовков
app.use(cors());                      // Разрешаем CORS
app.use(express.json());              // Парсим JSON
app.use(express.static(path.join(__dirname, '../public'))); // Раздаём статику

// === ЗАПУСК СЕРВЕРА ===
async function startServer() {
try {
    // 1. Инициализируем БД
    await initTables();
    
    // 2. Подключаем маршруты
    // 🔥 ВАЖНО: префиксы определяют итоговые пути!
    app.use('/api/auth', authRoutes);   // → /api/auth/register, /api/auth/login, /api/auth/me
    app.use('/api/posts', postRoutes);  // → /api/posts, /api/posts/:id, /api/posts/top ✅
    
    // 3. Обработка 404
    app.use((req, res) => {
    res.status(404).json({ message: 'Маршрут не найден' });
    });
    
    // 4. Глобальная обработка ошибок
    app.use((err, req, res, next) => {
    console.error('❌ Ошибка:', err);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    });
    
    // 5. Запускаем сервер
    app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
    console.log(`📚 API документация:`);
    console.log(`   • Авторизация: /api/auth/*`);
    console.log(`   • Посты: /api/posts/*`);
    console.log(`   • 🔥 Топ-посты: GET /api/posts/top`);
    });
    
} catch (err) {
    console.error('❌ Не удалось запустить сервер:', err);
    process.exit(1);
}
}

startServer();
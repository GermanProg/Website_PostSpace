// routes/posts.js
const express = require('express');
const router = express.Router();

const {
getAllPosts,
createPost,
updatePost,
deletePost,
toggleLike,
toggleDislike,
  getTopPosts  // 🔥 Импортируем функцию топ-постов
} = require('../models/Post');
const auth = require('../middleware/auth');

// === ПОЛУЧЕНИЕ ВСЕХ ПОСТОВ ===
router.get('/', async (req, res) => {
try {
    const posts = await getAllPosts();
    res.json(posts);
} catch (err) {
    console.error('Ошибка получения постов:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
}
});

// === СОЗДАНИЕ ПОСТА ===
router.post('/', auth, async (req, res) => {
try {
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
    return res.status(400).json({ message: 'Пост не может быть пустым' });
    }
    
    const result = await createPost(req.userId, content);
    res.status(201).json(result);
} catch (err) {
    console.error('Ошибка создания поста:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
}
});

// === РЕДАКТИРОВАНИЕ ПОСТА ===
router.put('/:id', auth, async (req, res) => {
try {
    const { content } = req.body;
    const postId = req.params.id;
    
    if (!content || content.trim() === '') {
    return res.status(400).json({ message: 'Пост не может быть пустым' });
    }
    
    await updatePost(postId, req.userId, content);
    res.json({ message: 'Пост обновлён', id: postId });
} catch (err) {
    if (err.message === 'Нет прав') {
    return res.status(403).json({ message: 'Нет прав на редактирование' });
    }
    console.error('Ошибка обновления поста:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
}
});

// === УДАЛЕНИЕ ПОСТА ===
router.delete('/:id', auth, async (req, res) => {
try {
    const postId = req.params.id;
    await deletePost(postId, req.userId);
    res.json({ message: 'Пост удалён', id: postId });
} catch (err) {
    if (err.message === 'Нет прав') {
    return res.status(403).json({ message: 'Нет прав на удаление' });
    }
    console.error('Ошибка удаления поста:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
}
});

// === ЛАЙК ПОСТА ===
router.post('/:id/like', auth, async (req, res) => {
try {
    await toggleLike(req.params.id, req.userId);
    res.sendStatus(200);
} catch (err) {
    console.error('Ошибка лайка:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
}
});

// === ДИЗЛАЙК ПОСТА ===
router.post('/:id/dislike', auth, async (req, res) => {
try {
    await toggleDislike(req.params.id, req.userId);
    res.sendStatus(200);
} catch (err) {
    console.error('Ошибка дизлайка:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
}
});

// 🔥 ТОП-3 ПОСТА ПО ЛАЙКАМ — ПРАВИЛЬНЫЙ ПУТЬ!
// При подключении в server.js: app.use('/api/posts', postRoutes)
// Этот маршрут станет: GET /api/posts/top
router.get('/top', async (req, res) => {
try {
    const topPosts = await getTopPosts(3);
    res.json(topPosts);
} catch (err) {
    console.error('Ошибка получения топ-постов:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
}
});

module.exports = router;
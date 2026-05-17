// models/Post.js
const { db } = require('../config/database');

// Получение всех постов
function getAllPosts() {
return new Promise((resolve, reject) => {
    const query = `
    SELECT p.id, p.content, p.created_at, p.edited_at, 
            u.username as author, p.user_id,
            (SELECT GROUP_CONCAT(user_id) FROM likes WHERE post_id = p.id) as likes,
            (SELECT GROUP_CONCAT(user_id) FROM dislikes WHERE post_id = p.id) as dislikes
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
    `;
    
    db.all(query, (err, rows) => {
    if (err) return reject(err);
    
    const posts = rows.map(row => ({
        ...row,
        likes: row.likes ? row.likes.split(',').map(Number) : [],
        dislikes: row.dislikes ? row.dislikes.split(',').map(Number) : []
    }));
    resolve(posts);
    });
});
}

// Создание поста
function createPost(userId, content) {
return new Promise((resolve, reject) => {
    db.run(
    `INSERT INTO posts (user_id, content) VALUES (?, ?)`,
    [userId, content],
    function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
    }
    );
});
}

// Получение поста по ID
function getPostById(postId) {
return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM posts WHERE id = ?`, [postId], (err, post) => {
    if (err) return reject(err);
    resolve(post);
    });
});
}

// Проверка: является ли пользователь автором поста
function isPostOwner(postId, userId) {
return new Promise((resolve, reject) => {
    db.get(
    `SELECT id FROM posts WHERE id = ? AND user_id = ?`,
    [postId, userId],
    (err, post) => {
        if (err) return reject(err);
        resolve(!!post);
    }
    );
});
}

// Обновление поста
function updatePost(postId, userId, content) {
return new Promise(async (resolve, reject) => {
    const isOwner = await isPostOwner(postId, userId);
    if (!isOwner) return reject(new Error('Нет прав'));
    
    db.run(
    `UPDATE posts SET content = ?, edited_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [content, postId],
    function (err) {
        if (err) return reject(err);
        resolve({ id: postId });
    }
    );
});
}

// Удаление поста
function deletePost(postId, userId) {
return new Promise(async (resolve, reject) => {
    const isOwner = await isPostOwner(postId, userId);
    if (!isOwner) return reject(new Error('Нет прав'));
    
    db.run(`DELETE FROM posts WHERE id = ?`, [postId], function (err) {
    if (err) return reject(err);
    resolve({ id: postId });
    });
});
}

// === ЛАЙКИ / ДИЗЛАЙКИ ===

// Переключение лайка (удаляет дизлайк если есть)
function toggleLike(postId, userId) {
return new Promise((resolve, reject) => {
    db.run(`DELETE FROM dislikes WHERE post_id = ? AND user_id = ?`, [postId, userId], () => {
      db.get(`SELECT * FROM likes WHERE post_id = ? AND user_id = ?`, [postId, userId], (err, like) => {
        if (err) return reject(err);
        
        if (like) {
        db.run(`DELETE FROM likes WHERE post_id = ? AND user_id = ?`, [postId, userId], (err) => {
            if (err) return reject(err);
            resolve({ action: 'removed' });
        });
        } else {
        db.run(`INSERT INTO likes (post_id, user_id) VALUES (?, ?)`, [postId, userId], (err) => {
            if (err) return reject(err);
            resolve({ action: 'added' });
        });
        }
    });
    });
});
}

// Переключение дизлайка (удаляет лайк если есть)
function toggleDislike(postId, userId) {
return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM dislikes WHERE post_id = ? AND user_id = ?`, [postId, userId], (err, dislike) => {
    if (err) return reject(err);
    
    if (dislike) {
        db.run(`DELETE FROM dislikes WHERE post_id = ? AND user_id = ?`, [postId, userId], (err) => {
        if (err) return reject(err);
        resolve({ action: 'removed' });
        });
    } else {
        db.run(`DELETE FROM likes WHERE post_id = ? AND user_id = ?`, [postId, userId], () => {
        db.run(`INSERT INTO dislikes (post_id, user_id) VALUES (?, ?)`, [postId, userId], (err) => {
            if (err) return reject(err);
            resolve({ action: 'added' });
        });
        });
    }
    });
});
}

// 🔥 ТОП-3 ПОСТА ПО ЛАЙКАМ (исправленный путь!)
function getTopPosts(limit = 3) {
return new Promise((resolve, reject) => {
    const query = `
    SELECT 
        p.id, p.content, p.created_at,
        u.username as author, p.user_id,
        COUNT(l.user_id) as likes_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN likes l ON l.post_id = p.id
    GROUP BY p.id
    ORDER BY likes_count DESC, p.created_at DESC
    LIMIT ?
    `;
    
    db.all(query, [limit], (err, rows) => {
    if (err) return reject(err);
    
    const topPosts = rows.map(row => ({
        id: row.id,
        content: row.content,
        author: row.author,
        likes: row.likes_count,
        created_at: row.created_at
    }));
    resolve(topPosts);
    });
});
}

module.exports = {
getAllPosts,
createPost,
getPostById,
updatePost,
deletePost,
toggleLike,
toggleDislike,
getTopPosts,
isPostOwner
};
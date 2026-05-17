const commentsList = document.getElementById('commentsList');
const API_URL = 'http://localhost:3000/api/posts/top';  // ← ПРАВИЛЬНО ✅

// 🥇🥈🥉 Медали для мест
const MEDALS = ['🥇', '🥈', '🥉'];

async function fetchTopPosts() {
try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Ошибка сети');
    return await response.json();
} catch (error) {
    console.error('Не удалось загрузить топ:', error);
    return []; // Возвращаем пустой массив при ошибке
}
}

function renderComments(posts) {
  commentsList.innerHTML = ''; // Очищаем список

if (posts.length === 0) {
    commentsList.innerHTML = '<div style="text-align:center;color:#888;font-size:13px;padding:10px;">Пока нет топовых комментариев 🔍</div>';
    return;
}

posts.forEach((post, index) => {
    const div = document.createElement('div');
    div.className = 'comment-item';
    div.style.animationDelay = `${index * 0.1}s`;

    // Обрезаем текст, если слишком длинный
    const shortText = post.content.length > 50 
    ? post.content.slice(0, 50) + '...' 
    : post.content;

    div.innerHTML = `
    <div class="star-container">
    <span class="material-symbols-outlined ${index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'}">star</span>
    </div>
    <div class="comment-content">
    <span class="comment-author">@${post.author} • ${post.likes} 👍</span>
    "${shortText}"
    </div>
`;
    commentsList.appendChild(div);
    });
}

// 🔄 Загружаем топ при загрузке страницы
fetchTopPosts().then(renderComments);

// 🔄 Обновляем каждые 10 секунд (реальное время)
setInterval(() => {
  fetchTopPosts().then(renderComments);
}, 10000);
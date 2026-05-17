// Глобальные переменные для редактирования и удаления
let editingPostId = null;        // null = создаём, не null = редактируем этот пост
let originalButtonText = 'Отправить'; // Запомним текст кнопки
let deletedPost = null;          // Для функции Undo при удалении
let undoTimeout = null;          // Таймер для авто-удаления
let currentUser = null;

function generateAvatar(initial) {
  return `<svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="#333"/>
    <text x="50" y="60" font-size="40" text-anchor="middle" fill="white" font-family="Arial">${initial.toUpperCase()}</text>
  </svg>`;
}

async function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  const res = await fetch('/api/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!res.ok) {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
    return;
  }

  currentUser = await res.json();
  document.getElementById('user-name').textContent = currentUser.username;
  document.getElementById('user-avatar').innerHTML = generateAvatar(currentUser.username[0]);
  loadPosts();
}

async function loadPosts() {
  const res = await fetch('/api/posts');
  const posts = await res.json();
  const postsDiv = document.getElementById('posts');
  postsDiv.innerHTML = '';

  posts.forEach(post => {
    const liked = post.likes.includes(currentUser.id);
    const disLiked = post.dislikes.includes(currentUser.id)
    const isMyPost = post.user_id === currentUser.id;

    const postEl = document.createElement('div');
    postEl.className = 'post';

    if(isMyPost){
      postEl.classList.add('my-post')
    }
    const MyPostButtons = isMyPost ?`
    <button class="edit-btn" data-id="${post.id}"><span class="material-symbols-outlined" id='edit'>edit_square</span></button>
    <button class="delete-btn" data-id="${post.id}"><span class="material-symbols-outlined" id='delete'>delete</span></button>
    `: '';

    postEl.innerHTML = `
      <p><strong>${post.author}</strong>: ${post.content}</p>
      <button class="like-btn ${liked ? 'liked' : ''}" data-id="${post.id}">
        ${liked ? `<span class="material-symbols-outlined">thumb_up</span> ${post.likes.length}` :
        `<span class="material-symbols-outlined">thumb_up</span> ${post.likes.length}`} 
      </button>
    <button class="dislike-btn ${disLiked ? 'disliked' : ''}" data-id="${post.id}">
    ${disLiked ? `<span class="material-symbols-outlined">thumb_down</span> ${post.dislikes.length}` :
    `<span class="material-symbols-outlined">thumb_down</span> ${post.dislikes.length}`}
    </button>
    ${MyPostButtons}
    `;
    postsDiv.appendChild(postEl);
  });
}

// Загружает пост в textarea для редактирования
function EditPost(postId) {
  // Находим пост в уже загруженных данных (или делаем запрос)
  const postElement = document.querySelector(`.post .edit-btn[data-id="${postId}"]`)?.closest('.post');
  if (!postElement) return;

  // Извлекаем текст (убираем "Автор: " из начала)
  const content = postElement.querySelector('p').textContent.replace(/^[^:]+:\s*/, '');
  
  // Вставляем в textarea
  const textarea = document.getElementById('postContent');
  textarea.value = content;
  textarea.focus();
  
  // Сохраняем состояние
  editingPostId = postId;
  
  // Меняем кнопку "Отправить" → "💾 Сохранить"
  const sendBtn = document.getElementById('postForm').querySelector('button[type="submit"]');
  if (sendBtn) {
    originalButtonText = sendBtn.textContent;
    sendBtn.textContent = '💾 Сохранить';
  }
  
  // Добавляем кнопку "Отмена" рядом с формой
  addCancelButton();
  
  // Скролл к полю ввода (если нужно)
  textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Кнопка "Отмена" при редактировании
function addCancelButton() {
  // Проверяем, нет ли уже кнопки
  if (document.getElementById('cancelEdit')) return;
  
  const form = document.getElementById('postForm');
  const submitBtn = form.querySelector('button[type="submit"]');
  
  const cancelBtn = document.createElement('button');
  cancelBtn.id = 'cancelEdit';
  cancelBtn.textContent = '✕ Отмена';
  cancelBtn.type = 'button';
  cancelBtn.style.cssText = `
    margin-left: 10px;
    padding: 10px 20px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    color: white;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
  `;
  
  cancelBtn.onclick = function() {
    // Сброс состояния
    editingPostId = null;
    document.getElementById('postContent').value = '';
    submitBtn.textContent = originalButtonText;
    cancelBtn.remove();
  };
  
  // Вставляем после кнопки отправки
  submitBtn.parentNode.insertBefore(cancelBtn, submitBtn.nextSibling);
}
// 🔹 Единый обработчик для всех кнопок внутри #posts
document.getElementById('posts').addEventListener('click', async (e) => {
  const token = localStorage.getItem('token');
  const btn = e.target.closest('button'); // Ищем кнопку, даже если кликнули на иконку
  if (!btn) return;

  const postId = btn.dataset.id;
  const className = btn.className;

  // === ЛАЙК ===
  if (btn.classList.contains('like-btn')) {
    await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 
                  'Content-Type': 'application/json' }
    });
loadPosts()
  }

  // === ДИЗЛАЙК ===
  if (btn.classList.contains('dislike-btn')) {
    await fetch(`/api/posts/${postId}/dislike`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'}
    });
  loadPosts()
  }

  // === УДАЛЕНИЕ ===
  if (btn.classList.contains('delete-btn')) {
      const postId = btn.dataset.id;
  const postElement = btn.closest('.post');
  const postContent = postElement?.querySelector('p')?.textContent;
  
  // Показываем кастомное уведомление вместо confirm()
  showDeleteNotification(postId, postElement, postContent);
  }

  // === РЕДАКТИРОВАНИЕ ===
  if (btn.classList.contains('edit-btn')) {
      const postId = btn.dataset.id;
      EditPost(postId); 
  }
  fixscroll()
});

document.getElementById('postForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const content = document.getElementById('postContent').value.trim();
  const token = localStorage.getItem('token');
  
  if (!content) return; // Не отправляем пустой пост

  try {
    if (editingPostId !== null) {
      // === РЕЖИМ РЕДАКТИРОВАНИЯ ===
      await fetch(`/api/posts/${editingPostId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });
      
      // Сброс состояния после сохранения
      editingPostId = null;
      const submitBtn = document.getElementById('postForm').querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.textContent = originalButtonText;
      const cancelBtn = document.getElementById('cancelEdit');
      if (cancelBtn) cancelBtn.remove();
      
    } else {
      // === РЕЖИМ СОЗДАНИЯ ===
      await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });
    }
    
    // Очистка и перезагрузка
    document.getElementById('postContent').value = '';
    loadPosts();
    
  } catch (err) {
    console.error('Ошибка:', err);
    alert('Не удалось сохранить пост');
  }
});


document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
});

checkAuth();


    const starsContainer = document.getElementById('stars');
    const starCount = 100;

    for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.classList.add('star');

    // Случайное положение
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    star.style.left = `${x}%`;
    star.style.top = `${y}%`;

    // Случайный размер (0.5px – 2px)
    const size = 0.5 + Math.random() * 1.5;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;

    // Случайная длительность мерцания (2–6 сек)
    const duration = 2 + Math.random() * 4;
    star.style.setProperty('--duration', `${duration}s`);
    // Случайная задержка
    star.style.animationDelay = `${Math.random() * 5}s`;
    starsContainer.appendChild(star);
    }


    function fixscroll(){
      const MainpostElem = document.getElementById('post');
      const postsElement = document.getElementById('posts');
      const FooterElement = document.getElementById('hero_footer');

      const footerRect = FooterElement.getBoundingClientRect();
      const postsElemHeight = postsElement.offsetHeight;
      const windowHeight = window.innerHeight;
      const MainHeight = MainpostElem.offsetHeight;


      
    console.log(footerRect.bottom)
    console.log(postsElemHeight)
    console.log(windowHeight)
    console.log(MainpostElem) 

      const overlap = windowHeight - footerRect.top;
      if(overlap > 0){
        console.log('Футер перекрывает на', overlap, 'px');
        MainpostElem.style.marginBottom = `${overlap}px`;
        MainpostElem.style.marginTop = `${overlap}px`;
      } else {
        MainpostElem.style.marginBottom = '';
        MainpostElem.style.marginTop = '';
      }
    }

    fixscroll()
window.addEventListener('resize', fixscroll);



// Показывает уведомление "Пост удалён" с кнопкой Undo
function showDeleteNotification(postId, postElement, preview) {
  // 1. Временно скрываем пост (визуальное удаление)
  if (postElement) {
    postElement.style.opacity = '0.5';
    postElement.style.pointerEvents = 'none';
  }
  
  // 2. Сохраняем данные для возможного восстановления
  deletedPost = { id: postId, element: postElement };
  
  // 3. Создаём уведомление
  const notification = document.createElement('div');
  notification.id = 'deleteNotification';
  notification.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(30, 41, 59, 0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.2);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 16px;
    animation: slideUp 0.3s ease;
  `;
  
  notification.innerHTML = `
    <span>🗑️ Пост удалён</span>
    <button id="undoBtn" style="
      background: #3B82F6;
      border: none;
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    ">Отменить</button>
  `;
  
  document.body.appendChild(notification);
  
  // 4. Обработчик Undo
  document.getElementById('undoBtn').onclick = async function() {
    clearTimeout(undoTimeout);
    
    // Восстанавливаем визуально
    if (postElement) {
      postElement.style.opacity = '1';
      postElement.style.pointerEvents = 'auto';
    }
    
    // Отменяем удаление на сервере (опционально: можно не делать запрос, если просто вернули визуал)
    // Но лучше отправить запрос на "восстановление", если бэкенд поддерживает
    // Или просто перезагрузить ленту:
    hideDeleteNotification();
    loadPosts();
    
    deletedPost = null;
  };
  
  // 5. Авто-удаление через 5 секунд
  undoTimeout = setTimeout(async () => {
    if (deletedPost) {
      const token = localStorage.getItem('token');
      await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Финальное удаление из DOM
      if (postElement) postElement.remove();
      hideDeleteNotification();
      deletedPost = null;
    }
  }, 5000);
}

function hideDeleteNotification() {
  const notification = document.getElementById('deleteNotification');
  if (notification) notification.remove();
}

// CSS-анимация (добавь в <style> или CSS файл)
if (!document.getElementById('deleteAnimationStyle')) {
  const style = document.createElement('style');
  style.id = 'deleteAnimationStyle';
  style.textContent = `
    @keyframes slideUp {
      from { opacity: 0; transform: translateX(-50%) translateY(20px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
  `;
  document.head.appendChild(style);
}


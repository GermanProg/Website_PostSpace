

class LoginForm {
  constructor(formSelector) {
    this.form = document.querySelector(formSelector);
    if (!this.form) {
      throw new Error(`Форма с селектором "${formSelector}" не найдена`);
    }
    this.init();
  }

  init() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
  }

  async handleSubmit(event) {
    event.preventDefault();

    const username = this.form.querySelector('#username')?.value.trim();
    const password = this.form.querySelector('#password')?.value;

    if (!username || !password) {
      this.showError('Пожалуйста, заполните все поля');
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard.html';
      } else {
        this.showError(data.message || 'Ошибка входа');
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
      this.showError('Не удалось подключиться к серверу');
    }
  }

  showError(message) {
    // Можно улучшить: показывать ошибку под формой, а не через alert
    alert(message);
  }
}

new LoginForm("#loginForm")


    // функция создающая звезды , буду дорабатывать до идеала
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


const passwordInput = document.querySelector('#password');
const errorPassword = document.querySelector("#error-password");


function validatePassword(password){// функция для проверки правильности пароля
  const regexp = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;
  return regexp.test(password)
}


async function checkForm(){// функция создающая блок ошибки с проверкой
const password = passwordInput.value;
const symbols = "@!>.[]Aa12"


  if (password === "") {// если значение инпута пустое
  let errorEvents = document.querySelector(".error-events");
  if (errorEvents != null) {
    errorEvents.remove();
  }
  return;
};
  if (!validatePassword(password)) {
  let div = document.createElement("div");
  div.className = 'error-events';
  div.style.cssText = 'color: #ff6b6b; font-size: 14px;margin-top:10px;padding-top:10px; text-align: center;';
  div.innerHTML = `
  <span class="error-span">Неправильное заполнение пароля, используйте ${symbols} символы </span>
  `
  errorPassword.append(div);
}
}
passwordInput?.addEventListener('blur',() => {
  checkForm()
});

































// document.getElementById('loginForm').addEventListener('submit', async (e) => {
//   e.preventDefault();
//   const username = document.getElementById('username').value;
//   const password = document.getElementById('password').value;
  
//   const res = await fetch('/api/login', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ username, password })
//   });

//   const data = await res.json();
//   if (res.ok) {
//     localStorage.setItem('token', data.token);
//     window.location.href = '/dashboard.html';
//   } else {
//     alert(data.message || 'Ошибка входа');
//   }
// });
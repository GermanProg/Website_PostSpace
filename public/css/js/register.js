document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });

  const data = await res.json();
  if (res.ok) {
    alert('Регистрация успешна! Перенаправляем на вход.');
    window.location.href = '/dashboard.html';
  } else {
    alert(data.message || 'Ошибка регистрации');
  }
});

// Анимация звездного неба
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


const passwordInput = document.querySelector("#password");
const inputError = document.querySelector("#input-error");
function validIspassword(password){
  let reg = /^(?=.*[a-zA-z])(?=.*[0-9]).{8,}$/
  return reg.test(password)
}

function CheckRegister(){
  const password = passwordInput.value;
  const symbols = "@!>.[]";

  if(password === ""){
  let errorPassword = document.querySelector('.error-password');
    if(errorPassword != null){
      errorPassword.remove()
    }
    return
  }
  if(!validIspassword(password)){
    const div = document.createElement("div");
    div.className = 'error-password';
    div.style.cssText = 'color: #ff6b6b; font-size: 14px;margin-top:10px;padding-top:10px; text-align: center;';
    div.innerHTML = `
    <span class="error-span">Пароль должен содержать не менее 8 символов, и спецсимволы ${symbols}</span>
    `;
    inputError.append(div);
  }
}
passwordInput?.addEventListener("blur",()=> {
  CheckRegister()
})




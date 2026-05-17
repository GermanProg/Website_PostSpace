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
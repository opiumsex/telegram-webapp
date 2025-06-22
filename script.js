// Конфигурация
const ADMIN_ACCOUNTS = [
  { username: "admin1", avatar: "https://i.imgur.com/J6l19dX.png" },
  { username: "admin2", avatar: "https://i.imgur.com/J6l19dX.png" },
  { username: "admin3", avatar: "https://i.imgur.com/J6l19dX.png" },
  { username: "admin4", avatar: "https://i.imgur.com/J6l19dX.png" },
  { username: "admin5", avatar: "https://i.imgur.com/J6l19dX.png" }
];

// Данные (вместо базы данных)
let postsData = {
  builds: [],
  redesigns: []
};

let currentUser = null;

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  initUI();
  loadDemoData();
  loadSection('builds');
});

function initUI() {
  // Инициализация меню и навигации (как в предыдущем коде)
  // ...

  // Упрощенная авторизация
  const adminList = document.createElement('div');
  adminList.className = 'admin-list';
  adminList.innerHTML = `
    <h3>Выберите администратора:</h3>
    ${ADMIN_ACCOUNTS.map(admin => `
      <div class="admin-account" data-username="${admin.username}">
        <img src="${admin.avatar}" alt="${admin.username}" width="50">
        <span>${admin.username}</span>
      </div>
    `).join('')}
    <div class="admin-account guest">
      <span>Продолжить как гость</span>
    </div>
  `;

  document.getElementById('authModal').querySelector('.modal-content').prepend(adminList);

  // Обработчики выбора администратора
  document.querySelectorAll('.admin-account').forEach(account => {
    account.addEventListener('click', () => {
      if (account.classList.contains('guest')) {
        currentUser = { username: "Гость", isAdmin: false };
      } else {
        const username = account.getAttribute('data-username');
        const avatar = account.querySelector('img').src;
        currentUser = { username, avatar, isAdmin: true };
      }
      
      document.getElementById('authModal').classList.remove('active');
      updateUI();
      loadSection('builds');
    });
  });
}

function loadDemoData() {
  // Пример данных (в реальном приложении будут загружаться с Яндекс.Диска)
  postsData = {
    builds: [
      {
        id: '1',
        image: 'https://storage.yandexcloud.net/your-bucket/build1.jpg',
        description: 'Пример сборки 1',
        fileUrl: 'https://disk.yandex.ru/d/12345/build1.zip',
        fileName: 'build1.zip'
      }
    ],
    redesigns: [
      {
        id: '2',
        image: 'https://storage.yandexcloud.net/your-bucket/redesign1.jpg',
        description: 'Пример редизайна 1',
        fileUrl: 'https://disk.yandex.ru/d/12345/redesign1.zip',
        fileName: 'redesign1.zip'
      }
    ]
  };
}

// Загрузка файлов на Яндекс.Диск (упрощенный пример)
async function uploadToYandexDisk(file, callback) {
  // В реальном приложении нужно использовать Яндекс.Диск API
  // Это примерная реализация:
  console.log('Загружаем файл на Яндекс.Диск:', file.name);
  
  // Здесь должен быть реальный код загрузки:
  // 1. Получение OAuth-токена
  // 2. Загрузка файла через API Яндекс.Диска
  // 3. Возврат публичной ссылки
  
  // Временная заглушка:
  setTimeout(() => {
    const fakeUrl = `https://disk.yandex.ru/d/12345/${Date.now()}_${file.name}`;
    callback(fakeUrl);
  }, 1000);
}

// Скачивание файлов
function downloadFile(url, filename) {
  // Для Яндекс.Диска просто открываем ссылку
  window.open(url, '_blank');
}

// Остальные функции (renderPosts, openPostModal и т.д.) остаются аналогичными,
// но используют функции для работы с Яндекс.Диском

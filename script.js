// Основной файл приложения
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация приложения
    initApp();
});

function initApp() {
    // Инициализация Firebase
    initializeFirebase();
    
    // Загрузка постов при загрузке страницы
    loadPosts('builds');
    
    // Настройка навигации
    setupNavigation();
    
    // Настройка поиска
    setupSearch();
    
    // Проверка прав администратора
    checkAdminStatus();
}

function initializeFirebase() {
    // Инициализация Firebase происходит в firebase-config.js
    console.log("Firebase initialized");
}

function loadPosts(category) {
    const mainElement = document.getElementById('app-main');
    mainElement.innerHTML = '<div class="loading">Загрузка постов...</div>';
    
    // Здесь будет загрузка постов из Firestore
    // Временно используем mock данные
    setTimeout(() => {
        displayMockPosts(category, mainElement);
    }, 500);
}

function displayMockPosts(category, element) {
    // Это временная функция для демонстрации
    // В реальном приложении данные будут загружаться из Firestore
    
    let posts = [];
    if (category === 'builds') {
        posts = [
            {
                id: '1',
                title: 'Сборка Windows 11 Pro',
                description: 'Оптимизированная сборка Windows 11 Pro с обновлениями на июнь 2023 года.',
                bannerUrl: 'https://via.placeholder.com/600x300?text=Windows+11+Pro',
                fileUrl: '#',
                category: 'builds'
            },
            {
                id: '2',
                title: 'Сборка macOS Ventura',
                description: 'Чистая сборка macOS Ventura для Hackintosh.',
                bannerUrl: 'https://via.placeholder.com/600x300?text=macOS+Ventura',
                fileUrl: '#',
                category: 'builds'
            }
        ];
    } else if (category === 'redesigns') {
        posts = [
            {
                id: '3',
                title: 'Редизайн интерфейса Telegram',
                description: 'Темный редизайн Telegram с новыми иконками.',
                bannerUrl: 'https://via.placeholder.com/600x300?text=Telegram+Redesign',
                fileUrl: '#',
                category: 'redesigns'
            }
        ];
    }
    
    element.innerHTML = '';
    
    if (posts.length === 0) {
        element.innerHTML = '<div class="no-posts">Постов в этой категории пока нет.</div>';
        return;
    }
    
    posts.forEach(post => {
        const postElement = createPostElement(post);
        element.appendChild(postElement);
    });
}

function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.dataset.id = post.id;
    
    postElement.innerHTML = `
        <img src="${post.bannerUrl}" alt="${post.title}" class="post-banner">
        <div class="post-content">
            <h3 class="post-title">${post.title}</h3>
            <p class="post-description">${post.description}</p>
            <a href="${post.fileUrl}" class="download-button">Скачать</a>
        </div>
    `;
    
    return postElement;
}

function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-button');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tab = this.dataset.tab;
            
            // Убираем активный класс у всех кнопок
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // Добавляем активный класс текущей кнопке
            this.classList.add('active');
            
            // Обработка перехода на админ-панель
            if (tab === 'admin') {
                if (!isAdmin) {
                    showAdminLoginModal();
                    return;
                } else {
                    showAdminPanel();
                    return;
                }
            }
            
            // Загружаем посты для выбранной категории
            loadPosts(tab);
        });
    });
}

function setupSearch() {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

function performSearch() {
    const searchTerm = document.getElementById('search-input').value.trim();
    if (searchTerm === '') return;
    
    // Здесь будет реализация поиска по постам
    alert(`Поиск: ${searchTerm}`);
    // В реальном приложении нужно сделать запрос к Firestore
}

// Временные переменные для демонстрации
let isAdmin = false;

function checkAdminStatus() {
    // В реальном приложении статус администратора будет проверяться
    // через аутентификацию Firebase
    isAdmin = localStorage.getItem('isAdmin') === 'true';
}

function showAdminLoginModal() {
    const modal = document.getElementById('admin-login-modal');
    modal.style.display = 'flex';
    
    const closeButton = modal.querySelector('.close-modal');
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
        // Возвращаемся на предыдущую вкладку
        document.querySelector('.nav-button.active').click();
    });
}

function showAdminPanel() {
    const mainElement = document.getElementById('app-main');
    mainElement.innerHTML = `
        <div class="admin-panel">
            <h2>Админ панель</h2>
            <div class="admin-actions">
                <button id="create-post-button">Создать пост</button>
                <button id="edit-posts-button">Редактировать посты</button>
            </div>
            <div id="admin-content"></div>
        </div>
    `;
    
    document.getElementById('create-post-button').addEventListener('click', showCreatePostModal);
    document.getElementById('edit-posts-button').addEventListener('click', showEditPostsPanel);
}

function showCreatePostModal() {
    const modal = document.getElementById('create-post-modal');
    modal.style.display = 'flex';
    
    const closeButton = modal.querySelector('.close-modal');
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Настройка обработчиков для модального окна создания поста
    setupPostCreation();
}

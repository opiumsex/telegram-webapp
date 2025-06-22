// Данные приложения
const appData = {
    currentSection: 'builds',
    isAdmin: false,
    adminAccounts: [
        { username: 'admin1', password: 'pass1', level: 3 },
        { username: 'admin2', password: 'pass2', level: 3 },
        { username: 'admin3', password: 'pass3', level: 3 },
        { username: 'admin4', password: 'pass4', level: 3 },
        { username: 'dev1', password: 'devpass1', level: 3 },
        { username: 'dev2', password: 'devpass2', level: 3 }
    ],
    posts: {
        builds: [
            {
                id: 1,
                description: 'Пример сборки Telegram с улучшенным интерфейсом',
                imageUrl: 'https://via.placeholder.com/500x300?text=Telegram+Build',
                fileUrl: 'https://example.com/files/build1.zip',
                fileName: 'telegram_build_v1.0.zip',
                author: 'dev1',
                date: '2023-05-15'
            }
        ],
        redesigns: [
            {
                id: 1,
                description: 'Редизайн Telegram в стиле Material You',
                imageUrl: 'https://via.placeholder.com/500x300?text=Telegram+Redesign',
                fileUrl: 'https://example.com/files/redesign1.zip',
                fileName: 'telegram_redesign_material.zip',
                author: 'dev2',
                date: '2023-05-10'
            }
        ]
    }
};

// DOM элементы
const elements = {
    appContent: document.getElementById('appContent'),
    navItems: document.querySelectorAll('.nav-item'),
    navIndicator: document.querySelector('.nav-indicator'),
    loginModal: document.getElementById('loginModal'),
    postModal: document.getElementById('postModal'),
    loginForm: document.getElementById('loginForm'),
    postForm: document.getElementById('postForm'),
    createPostBtn: null
};

// Инициализация приложения
function initApp() {
    // Загрузка данных из localStorage
    loadData();
    
    // Установка обработчиков событий
    setupEventListeners();
    
    // Загрузка начального раздела
    loadSection(appData.currentSection);
}

// Загрузка данных из localStorage
function loadData() {
    const savedData = localStorage.getItem('telegramFilesAppData');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.posts) {
            appData.posts = parsedData.posts;
        }
    }
}

// Сохранение данных в localStorage
function saveData() {
    localStorage.setItem('telegramFilesAppData', JSON.stringify({
        posts: appData.posts
    }));
}

// Установка обработчиков событий
function setupEventListeners() {
    // Навигация
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.getAttribute('data-section');
            if (section === 'admin' && !appData.isAdmin) {
                showLoginModal();
            } else {
                appData.currentSection = section;
                loadSection(section);
                updateNavIndicator();
            }
        });
    });
    
    // Форма входа
    elements.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin();
    });
    
    // Форма создания поста
    elements.postForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handlePostCreation();
    });
    
    // Закрытие модальных окон
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // Закрытие модальных окон при клике вне их
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Обновление индикатора навигации
function updateNavIndicator() {
    const activeIndex = Array.from(elements.navItems).findIndex(
        item => item.getAttribute('data-section') === appData.currentSection
    );
    
    elements.navIndicator.style.left = `${activeIndex * 33.33}%`;
    
    elements.navItems.forEach(item => {
        if (item.getAttribute('data-section') === appData.currentSection) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Загрузка раздела
function loadSection(section) {
    elements.appContent.innerHTML = '';
    
    // Показываем прелоадер
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = '<div class="spinner"></div>';
    elements.appContent.appendChild(loader);
    
    // Имитация загрузки
    setTimeout(() => {
        elements.appContent.innerHTML = '';
        
        if (section === 'admin') {
            renderAdminPanel();
        } else {
            renderPosts(section);
            
            // Показываем кнопку создания поста только админам
            if (appData.isAdmin) {
                showCreatePostButton();
            }
        }
    }, 500);
}

// Рендер постов
function renderPosts(section) {
    const posts = appData.posts[section] || [];
    
    if (posts.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'Пока нет постов в этом разделе';
        elements.appContent.appendChild(emptyMessage);
        return;
    }
    
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post fade-in';
        
        postElement.innerHTML = `
            <img src="${post.imageUrl}" alt="Изображение поста" class="post-image">
            <p class="post-description">${post.description}</p>
            <button class="download-btn" data-url="${post.fileUrl}" data-name="${post.fileName}">Скачать</button>
        `;
        
        elements.appContent.appendChild(postElement);
    });
    
    // Добавляем обработчики для кнопок скачивания
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const url = e.target.getAttribute('data-url');
            const fileName = e.target.getAttribute('data-name');
            downloadFile(url, fileName);
        });
    });
}

// Рендер админ панели
function renderAdminPanel() {
    const adminPanel = document.createElement('div');
    adminPanel.className = 'admin-panel';
    
    adminPanel.innerHTML = '<h2>Админ панель</h2>';
    
    // Создаем табы для разделов
    const tabs = document.createElement('div');
    tabs.className = 'admin-tabs';
    
    const buildsTab = document.createElement('button');
    buildsTab.className = 'admin-tab active';
    buildsTab.textContent = 'Сборки';
    buildsTab.addEventListener('click', () => renderAdminPosts('builds'));
    
    const redesignsTab = document.createElement('button');
    redesignsTab.className = 'admin-tab';
    redesignsTab.textContent = 'Редизайны';
    redesignsTab.addEventListener('click', () => renderAdminPosts('redesigns'));
    
    tabs.appendChild(buildsTab);
    tabs.appendChild(redesignsTab);
    adminPanel.appendChild(tabs);
    
    // Контейнер для постов
    const postsContainer = document.createElement('div');
    postsContainer.id = 'adminPostsContainer';
    adminPanel.appendChild(postsContainer);
    
    elements.appContent.appendChild(adminPanel);
    
    // Загружаем посты для первого таба
    renderAdminPosts('builds');
    
    // Обработчики для табов
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
}

// Рендер постов в админ панели
function renderAdminPosts(section) {
    const postsContainer = document.getElementById('adminPostsContainer');
    postsContainer.innerHTML = '';
    
    const posts = appData.posts[section] || [];
    
    if (posts.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'Пока нет постов в этом разделе';
        postsContainer.appendChild(emptyMessage);
        return;
    }
    
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'admin-post fade-in';
        
        postElement.innerHTML = `
            <div class="post-info">
                <h3>${post.description}</h3>
                <small>Автор: ${post.author} | Дата: ${post.date}</small>
            </div>
            <div class="admin-actions">
                <button class="admin-btn edit-btn" data-id="${post.id}" data-section="${section}">Редактировать</button>
                <button class="admin-btn delete-btn" data-id="${post.id}" data-section="${section}">Удалить</button>
            </div>
        `;
        
        postsContainer.appendChild(postElement);
    });
    
    // Обработчики для кнопок
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            const section = e.target.getAttribute('data-section');
            editPost(id, section);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            const section = e.target.getAttribute('data-section');
            deletePost(id, section);
        });
    });
}

// Показать кнопку создания поста
function showCreatePostButton() {
    if (elements.createPostBtn) {
        elements.createPostBtn.remove();
    }
    
    elements.createPostBtn = document.createElement('div');
    elements.createPostBtn.className = 'create-post-btn';
    elements.createPostBtn.innerHTML = '<i class="fas fa-plus"></i>';
    elements.createPostBtn.addEventListener('click', showPostModal);
    
    document.body.appendChild(elements.createPostBtn);
}

// Показать модальное окно входа
function showLoginModal() {
    elements.loginModal.style.display = 'flex';
    document.getElementById('loginError').textContent = '';
}

// Показать модальное окно создания поста
function showPostModal() {
    // Сброс формы
    elements.postForm.reset();
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('fileInfo').innerHTML = '';
    
    // Обработчик для предпросмотра изображения
    document.getElementById('postImage').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                document.getElementById('imagePreview').innerHTML = `
                    <img src="${event.target.result}" alt="Предпросмотр" style="max-width: 100%; margin-top: 10px; border-radius: 5px;">
                `;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Обработчик для информации о файле
    document.getElementById('postFile').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            document.getElementById('fileInfo').innerHTML = `
                <p style="margin-top: 10px;">Файл: ${file.name}</p>
                <p>Размер: ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
            `;
        }
    });
    
    elements.postModal.style.display = 'flex';
}

// Обработка входа
function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const account = appData.adminAccounts.find(
        acc => acc.username === username && acc.password === password
    );
    
    if (account) {
        appData.isAdmin = true;
        elements.loginModal.style.display = 'none';
        loadSection('admin');
    } else {
        document.getElementById('loginError').textContent = 'Неверный никнейм или пароль';
    }
}

// Обработка создания поста
function handlePostCreation() {
    const description = document.getElementById('postDescription').value;
    const imageFile = document.getElementById('postImage').files[0];
    const file = document.getElementById('postFile').files[0];
    
    if (!description || !imageFile || !file) {
        alert('Заполните все поля!');
        return;
    }
    
    // В реальном приложении здесь бы была загрузка файлов на сервер
    // Для демонстрации используем заглушки
    
    const newPost = {
        id: Date.now(),
        description: description,
        imageUrl: URL.createObjectURL(imageFile),
        fileUrl: URL.createObjectURL(file),
        fileName: file.name,
        author: 'admin',
        date: new Date().toISOString().split('T')[0]
    };
    
    // Добавляем пост в соответствующий раздел
    appData.posts[appData.currentSection].unshift(newPost);
    saveData();
    
    // Закрываем модальное окно и обновляем раздел
    elements.postModal.style.display = 'none';
    loadSection(appData.currentSection);
}

// Редактирование поста
function editPost(id, section) {
    const post = appData.posts[section].find(p => p.id === id);
    if (!post) return;
    
    showPostModal();
    
    // Заполняем форму данными поста
    document.getElementById('postDescription').value = post.description;
    
    // В реальном приложении нужно было бы загрузить файлы
    document.getElementById('imagePreview').innerHTML = `
        <img src="${post.imageUrl}" alt="Текущее изображение" style="max-width: 100%; margin-top: 10px; border-radius: 5px;">
    `;
    
    document.getElementById('fileInfo').innerHTML = `
        <p style="margin-top: 10px;">Текущий файл: ${post.fileName}</p>
    `;
    
    // Изменяем обработчик отправки формы для редактирования
    const form = document.getElementById('postForm');
    form.removeEventListener('submit', handlePostCreation);
    
    form.addEventListener('submit', function handleEdit(e) {
        e.preventDefault();
        
        const description = document.getElementById('postDescription').value;
        const imageFile = document.getElementById('postImage').files[0];
        const file = document.getElementById('postFile').files[0];
        
        // Обновляем пост
        post.description = description;
        
        if (imageFile) {
            post.imageUrl = URL.createObjectURL(imageFile);
        }
        
        if (file) {
            post.fileUrl = URL.createObjectURL(file);
            post.fileName = file.name;
        }
        
        saveData();
        elements.postModal.style.display = 'none';
        renderAdminPosts(section);
        
        // Возвращаем стандартный обработчик
        form.removeEventListener('submit', handleEdit);
        form.addEventListener('submit', handlePostCreation);
    });
}

// Удаление поста
function deletePost(id, section) {
    if (confirm('Вы уверены, что хотите удалить этот пост?')) {
        appData.posts[section] = appData.posts[section].filter(p => p.id !== id);
        saveData();
        renderAdminPosts(section);
    }
}

// Скачивание файла
function downloadFile(url, fileName) {
    // В реальном приложении здесь бы было скачивание с сервера
    // Для демонстрации создаем временную ссылку
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Для интеграции с Яндекс.Диском в реальном проекте нужно:
    // 1. Зарегистрировать приложение на Яндекс.Диске
    // 2. Получить OAuth-токен
    // 3. Использовать API Яндекс.Диска для загрузки/скачивания
    // Пример запроса для скачивания:
    /*
    fetch(`https://cloud-api.yandex.net/v1/disk/resources/download?path=${encodeURIComponent(filePath)}`, {
        headers: {
            'Authorization': `OAuth ${YOUR_OAUTH_TOKEN}`
        }
    })
    .then(response => response.json())
    .then(data => {
        window.location.href = data.href;
    });
    */
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', initApp);

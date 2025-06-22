// Конфигурация приложения
const CONFIG = {
    // 5 паролей администраторов (замените на свои)
    ADMIN_PASSWORDS: [
        "AlphaAdmin123!",
        "BetaSecure456@",
        "GammaAccess789#",
        "DeltaControl000$",
        "EpsilonPower111%"
    ],
    GITHUB: {
        REPO: 'opiumsex/telegram-webapp', // Замените на свой
        BRANCH: 'main',
        TOKEN: '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' // Замените на свой
    },
    STORAGE_KEY: 'telegram_files_data'
};

// Состояние приложения
const state = {
    currentSection: 'builds',
    isAdmin: false,
    posts: {
        builds: [],
        redesigns: []
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
function init() {
    loadFromLocalStorage();
    setupEventListeners();
    loadSection(state.currentSection);
    
    // Пример начальных данных (можно удалить)
    if (state.posts.builds.length === 0 && state.posts.redesigns.length === 0) {
        state.posts.builds.push({
            id: 1,
            description: 'Пример сборки Telegram',
            imageUrl: 'https://via.placeholder.com/500x300?text=Example+Build',
            fileUrl: 'https://github.com/ваш_логин/ваш_репозиторий/raw/main/assembly/files/example.zip',
            fileName: 'example_build.zip',
            author: 'system',
            date: new Date().toISOString().split('T')[0]
        });
        saveToLocalStorage();
    }
}

// Работа с локальным хранилищем
function loadFromLocalStorage() {
    const savedData = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (savedData) {
        Object.assign(state, JSON.parse(savedData));
    }
}

function saveToLocalStorage() {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify({
        posts: state.posts,
        isAdmin: state.isAdmin
    }));
}

// Настройка событий
function setupEventListeners() {
    // Навигация
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.getAttribute('data-section');
            if (section === 'admin' && !state.isAdmin) {
                showLoginModal();
            } else {
                state.currentSection = section;
                loadSection(section);
                updateNavIndicator();
            }
        });
    });
    
    // Формы
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.postForm.addEventListener('submit', handlePostSubmit);
    
    // Модальные окна
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
}

// Навигация
function updateNavIndicator() {
    const activeIndex = Array.from(elements.navItems).findIndex(
        item => item.getAttribute('data-section') === state.currentSection
    );
    
    elements.navIndicator.style.left = `${activeIndex * 33.33}%`;
    elements.navItems.forEach(item => {
        item.classList.toggle('active', 
            item.getAttribute('data-section') === state.currentSection);
    });
}

// Загрузка разделов
function loadSection(section) {
    showLoader();
    
    setTimeout(() => {
        clearContent();
        
        if (section === 'admin') {
            renderAdminPanel();
        } else {
            renderPosts(section);
            if (state.isAdmin) {
                showCreatePostButton();
            }
        }
    }, 300);
}

function showLoader() {
    elements.appContent.innerHTML = `
        <div class="loader">
            <div class="spinner"></div>
        </div>
    `;
}

function clearContent() {
    elements.appContent.innerHTML = '';
}

// Рендер постов
function renderPosts(section) {
    const posts = state.posts[section] || [];
    
    if (posts.length === 0) {
        elements.appContent.innerHTML = `
            <div class="empty-message">
                Пока нет постов в этом разделе
            </div>
        `;
        return;
    }
    
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post fade-in';
        postElement.innerHTML = `
            <img src="${post.imageUrl}" alt="Изображение поста" class="post-image">
            <p class="post-description">${post.description}</p>
            <button class="download-btn" 
                    data-url="${post.fileUrl}" 
                    data-name="${post.fileName}">
                Скачать
            </button>
        `;
        elements.appContent.appendChild(postElement);
    });
    
    // Обработчики скачивания
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const url = e.target.getAttribute('data-url');
            const name = e.target.getAttribute('data-name');
            downloadFile(url, name);
        });
    });
}

// Админ панель
function renderAdminPanel() {
    elements.appContent.innerHTML = `
        <div class="admin-panel">
            <h2>Админ панель</h2>
            <div class="admin-tabs">
                <button class="admin-tab active" data-section="builds">Сборки</button>
                <button class="admin-tab" data-section="redesigns">Редизайны</button>
            </div>
            <div id="adminPostsContainer"></div>
        </div>
    `;
    
    // Табы
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderAdminPosts(tab.getAttribute('data-section'));
        });
    });
    
    renderAdminPosts('builds');
}

function renderAdminPosts(section) {
    const container = document.getElementById('adminPostsContainer');
    const posts = state.posts[section] || [];
    
    if (posts.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                Пока нет постов в этом разделе
            </div>
        `;
        return;
    }
    
    container.innerHTML = posts.map(post => `
        <div class="admin-post fade-in">
            <div class="post-info">
                <h3>${post.description}</h3>
                <small>Автор: ${post.author} | Дата: ${post.date}</small>
            </div>
            <div class="admin-actions">
                <button class="admin-btn edit-btn" 
                        data-id="${post.id}" 
                        data-section="${section}">
                    Редактировать
                </button>
                <button class="admin-btn delete-btn" 
                        data-id="${post.id}" 
                        data-section="${section}">
                    Удалить
                </button>
            </div>
        </div>
    `).join('');
    
    // Обработчики действий
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEditPost);
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDeletePost);
    });
}

// Кнопка создания поста
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

// Модальные окна
function showLoginModal() {
    elements.loginModal.style.display = 'flex';
    document.getElementById('loginError').textContent = '';
}

function showPostModal() {
    resetPostForm();
    setupFilePreview('postImage', 'imagePreview');
    setupFilePreview('postFile', 'fileInfo');
    elements.postModal.style.display = 'flex';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

function resetPostForm() {
    elements.postForm.reset();
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('fileInfo').innerHTML = '';
}

function setupFilePreview(inputId, previewId) {
    document.getElementById(inputId).addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const preview = document.getElementById(previewId);
            if (inputId === 'postImage') {
                preview.innerHTML = `
                    <img src="${event.target.result}" 
                         alt="Предпросмотр" 
                         style="max-width: 100%; margin-top: 10px; border-radius: 5px;">
                `;
            } else {
                preview.innerHTML = `
                    <p style="margin-top: 10px;">Файл: ${file.name}</p>
                    <p>Размер: ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
                `;
            }
        };
        reader.readAsDataURL(file);
    });
}

// Обработчики форм
function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('password').value;
    
    if (CONFIG.ADMIN_PASSWORDS.includes(password)) {
        state.isAdmin = true;
        saveToLocalStorage();
        closeAllModals();
        loadSection('admin');
    } else {
        document.getElementById('loginError').textContent = 'Неверный пароль';
    }
}

async function handlePostSubmit(e) {
    e.preventDefault();
    
    const description = document.getElementById('postDescription').value;
    const imageFile = document.getElementById('postImage').files[0];
    const file = document.getElementById('postFile').files[0];
    const section = state.currentSection;
    
    if (!description || !imageFile || !file) {
        alert('Заполните все поля!');
        return;
    }
    
    try {
        const [imageUrl, fileUrl] = await Promise.all([
            uploadToGitHub(imageFile, 'images'),
            uploadToGitHub(file, 'files')
        ]);
        
        const newPost = {
            id: Date.now(),
            description,
            imageUrl,
            fileUrl,
            fileName: file.name,
            author: 'admin',
            date: new Date().toISOString().split('T')[0]
        };
        
        if (!state.posts[section]) state.posts[section] = [];
        state.posts[section].unshift(newPost);
        saveToLocalStorage();
        
        closeAllModals();
        loadSection(section);
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при загрузке файлов');
    }
}

// Работа с GitHub
async function uploadToGitHub(file, folder) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const content = e.target.result.split(',')[1];
                const filename = `${folder}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
                const apiUrl = `https://api.github.com/repos/${CONFIG.GITHUB.REPO}/contents/assembly/${filename}`;
                
                const response = await fetch(apiUrl, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${CONFIG.GITHUB.TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `Add ${filename}`,
                        content,
                        branch: CONFIG.GITHUB.BRANCH
                    })
                });
                
                const data = await response.json();
                if (data.content) {
                    resolve(data.content.download_url);
                } else {
                    reject(data.message || 'Ошибка загрузки');
                }
            } catch (error) {
                reject(error);
            }
        };
        reader.readAsDataURL(file);
    });
}

// Действия с постами
function handleEditPost(e) {
    const id = parseInt(e.target.getAttribute('data-id'));
    const section = e.target.getAttribute('data-section');
    const post = state.posts[section].find(p => p.id === id);
    
    if (!post) return;
    
    showPostModal();
    document.getElementById('postDescription').value = post.description;
    document.getElementById('imagePreview').innerHTML = `
        <img src="${post.imageUrl}" 
             alt="Текущее изображение" 
             style="max-width: 100%; margin-top: 10px; border-radius: 5px;">
    `;
    document.getElementById('fileInfo').innerHTML = `
        <p style="margin-top: 10px;">Текущий файл: ${post.fileName}</p>
    `;
    
    const form = document.getElementById('postForm');
    form.removeEventListener('submit', handlePostSubmit);
    
    form.addEventListener('submit', async function handleEdit(e) {
        e.preventDefault();
        
        const description = document.getElementById('postDescription').value;
        const imageFile = document.getElementById('postImage').files[0];
        const newFile = document.getElementById('postFile').files[0];
        
        try {
            const updates = await Promise.all([
                imageFile ? uploadToGitHub(imageFile, 'images').then(url => {
                    post.imageUrl = url;
                }) : Promise.resolve(),
                
                newFile ? uploadToGitHub(newFile, 'files').then(url => {
                    post.fileUrl = url;
                    post.fileName = newFile.name;
                }) : Promise.resolve()
            ]);
            
            post.description = description;
            saveToLocalStorage();
            
            closeAllModals();
            renderAdminPosts(section);
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка при обновлении');
        } finally {
            form.removeEventListener('submit', handleEdit);
            form.addEventListener('submit', handlePostSubmit);
        }
    });
}

function handleDeletePost(e) {
    if (!confirm('Вы уверены, что хотите удалить этот пост?')) return;
    
    const id = parseInt(e.target.getAttribute('data-id'));
    const section = e.target.getAttribute('data-section');
    
    state.posts[section] = state.posts[section].filter(p => p.id !== id);
    saveToLocalStorage();
    renderAdminPosts(section);
}

// Вспомогательные функции
function downloadFile(url, fileName) {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);

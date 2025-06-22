// Данные приложения
const appData = {
    currentSection: 'builds',
    isAdmin: false,
    // Пароль для входа в админку (ЗАМЕНИТЕ НА СВОЙ)
    adminPassword: "As12fr90hswjHipGGGll1891488",
    adminPassword: "Slf1488farGGHHeEwUUid770oo",
    adminPassword: "Gjtspmhgs1325963hhsuysqqqqq",
    adminPassword: "fHoy652s00mhsjjHhhKKHGgGjjjj",
    adminPassword: "Sgpyedgbvajll345nbsja78AdFGa22",
    posts: {
        builds: [],
        redesigns: []
    },
    // Настройки GitHub (ЗАМЕНИТЕ НА СВОИ)
    github: {
        repo: 'telegram-webapp', // Ваш репозиторий
        branch: 'main',
        token: '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' // GitHub Personal Access Token
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
    loadData();
    setupEventListeners();
    loadSection(appData.currentSection);
}

function loadData() {
    const savedData = localStorage.getItem('telegramFilesAppData');
    if (savedData) {
        appData.posts = JSON.parse(savedData).posts || {
            builds: [],
            redesigns: []
        };
    }
}

function saveData() {
    localStorage.setItem('telegramFilesAppData', JSON.stringify({
        posts: appData.posts
    }));
}

function setupEventListeners() {
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
    
    elements.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin();
    });
    
    elements.postForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handlePostCreation();
    });
    
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

function updateNavIndicator() {
    const activeIndex = Array.from(elements.navItems).findIndex(
        item => item.getAttribute('data-section') === appData.currentSection
    );
    
    elements.navIndicator.style.left = `${activeIndex * 33.33}%`;
    
    elements.navItems.forEach(item => {
        item.classList.toggle('active', 
            item.getAttribute('data-section') === appData.currentSection);
    });
}

function loadSection(section) {
    elements.appContent.innerHTML = '';
    
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = '<div class="spinner"></div>';
    elements.appContent.appendChild(loader);
    
    setTimeout(() => {
        elements.appContent.innerHTML = '';
        
        if (section === 'admin') {
            renderAdminPanel();
        } else {
            renderPosts(section);
            if (appData.isAdmin) showCreatePostButton();
        }
    }, 500);
}

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
    
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const url = e.target.getAttribute('data-url');
            const fileName = e.target.getAttribute('data-name');
            downloadFile(url, fileName);
        });
    });
}

function renderAdminPanel() {
    const adminPanel = document.createElement('div');
    adminPanel.className = 'admin-panel';
    adminPanel.innerHTML = '<h2>Админ панель</h2>';
    
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
    
    tabs.append(buildsTab, redesignsTab);
    adminPanel.appendChild(tabs);
    
    const postsContainer = document.createElement('div');
    postsContainer.id = 'adminPostsContainer';
    adminPanel.appendChild(postsContainer);
    
    elements.appContent.appendChild(adminPanel);
    renderAdminPosts('builds');
    
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
}

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

function showCreatePostButton() {
    if (elements.createPostBtn) elements.createPostBtn.remove();
    
    elements.createPostBtn = document.createElement('div');
    elements.createPostBtn.className = 'create-post-btn';
    elements.createPostBtn.innerHTML = '<i class="fas fa-plus"></i>';
    elements.createPostBtn.addEventListener('click', showPostModal);
    document.body.appendChild(elements.createPostBtn);
}

function showLoginModal() {
    elements.loginModal.style.display = 'flex';
    document.getElementById('loginError').textContent = '';
}

function showPostModal() {
    elements.postForm.reset();
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('fileInfo').innerHTML = '';
    
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

function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('password').value;
    
    if (password === appData.adminPassword) {
        appData.isAdmin = true;
        elements.loginModal.style.display = 'none';
        loadSection('admin');
    } else {
        document.getElementById('loginError').textContent = 'Неверный пароль';
    }
}

async function handlePostCreation() {
    const description = document.getElementById('postDescription').value;
    const imageFile = document.getElementById('postImage').files[0];
    const file = document.getElementById('postFile').files[0];
    const section = appData.currentSection;
    
    if (!description || !imageFile || !file) {
        alert('Заполните все поля!');
        return;
    }
    
    try {
        const imageUrl = await uploadToGitHub(imageFile, 'images');
        const fileUrl = await uploadToGitHub(file, 'files');
        
        const newPost = {
            id: Date.now(),
            description,
            imageUrl,
            fileUrl,
            fileName: file.name,
            author: 'admin',
            date: new Date().toISOString().split('T')[0]
        };
        
        if (!appData.posts[section]) appData.posts[section] = [];
        appData.posts[section].unshift(newPost);
        saveData();
        
        elements.postModal.style.display = 'none';
        loadSection(section);
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при загрузке файлов');
    }
}

async function uploadToGitHub(file, folder) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function(e) {
            const content = e.target.result.split(',')[1];
            const filename = `${folder}/${Date.now()}_${file.name}`;
            const apiUrl = `https://api.github.com/repos/${appData.github.repo}/contents/assembly/${filename}`;
            
            try {
                const response = await fetch(apiUrl, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${appData.github.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `Add ${filename}`,
                        content,
                        branch: appData.github.branch
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

function editPost(id, section) {
    const post = appData.posts[section].find(p => p.id === id);
    if (!post) return;
    
    showPostModal();
    document.getElementById('postDescription').value = post.description;
    document.getElementById('imagePreview').innerHTML = `
        <img src="${post.imageUrl}" alt="Текущее изображение" style="max-width: 100%; margin-top: 10px; border-radius: 5px;">
    `;
    document.getElementById('fileInfo').innerHTML = `
        <p style="margin-top: 10px;">Текущий файл: ${post.fileName}</p>
    `;
    
    const form = document.getElementById('postForm');
    form.removeEventListener('submit', handlePostCreation);
    
    form.addEventListener('submit', function handleEdit(e) {
        e.preventDefault();
        
        const description = document.getElementById('postDescription').value;
        const imageFile = document.getElementById('postImage').files[0];
        const newFile = document.getElementById('postFile').files[0];
        
        post.description = description;
        
        const updateFile = (file, type) => {
            if (!file) return Promise.resolve();
            return uploadToGitHub(file, type === 'image' ? 'images' : 'files')
                .then(url => {
                    if (type === 'image') post.imageUrl = url;
                    else {
                        post.fileUrl = url;
                        post.fileName = newFile.name;
                    }
                });
        };
        
        Promise.all([
            updateFile(imageFile, 'image'),
            updateFile(newFile, 'file')
        ]).then(() => {
            saveData();
            elements.postModal.style.display = 'none';
            renderAdminPosts(section);
            form.removeEventListener('submit', handleEdit);
            form.addEventListener('submit', handlePostCreation);
        }).catch(error => {
            console.error('Ошибка:', error);
            alert('Ошибка при обновлении');
        });
    });
}

function deletePost(id, section) {
    if (confirm('Вы уверены, что хотите удалить этот пост?')) {
        appData.posts[section] = appData.posts[section].filter(p => p.id !== id);
        saveData();
        renderAdminPosts(section);
    }
}

function downloadFile(url, fileName) {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

document.addEventListener('DOMContentLoaded', initApp);

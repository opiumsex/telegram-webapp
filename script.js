// Основной файл приложения
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация хранилища
    if (!localStorage.getItem('initialized')) {
        initStorage();
        localStorage.setItem('initialized', 'true');
    }
    
    // Проверка аутентификации
    checkAuth();
    
    // Инициализация UI
    initUI();
    
    // Загрузка начального раздела
    loadSection('builds');
});

function initUI() {
    // Боковое меню
    const menuToggle = document.getElementById('menuToggle');
    const sideMenu = document.getElementById('sideMenu');
    const sideMenuOverlay = document.getElementById('sideMenuOverlay');
    
    menuToggle.addEventListener('click', () => {
        sideMenu.classList.toggle('active');
        sideMenuOverlay.classList.toggle('active');
    });
    
    sideMenuOverlay.addEventListener('click', () => {
        sideMenu.classList.remove('active');
        sideMenuOverlay.classList.remove('active');
    });
    
    // Навигация
    const navButtons = document.querySelectorAll('.nav-btn');
    const navIndicator = document.querySelector('.nav-indicator');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.getAttribute('data-section');
            
            // Обновление активной кнопки
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Анимация индикатора
            const buttonIndex = Array.from(navButtons).indexOf(button);
            navIndicator.style.transform = `translateX(${buttonIndex * 100}%)`;
            
            // Загрузка раздела
            loadSection(section);
        });
    });
    
    // Профиль пользователя
    const avatarUpload = document.getElementById('avatarUpload');
    const profilePic = document.getElementById('profilePic');
    const usernameInput = document.getElementById('usernameInput');
    const saveUsernameBtn = document.getElementById('saveUsername');
    const logoutBtn = document.getElementById('logoutBtn');
    
    avatarUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                profilePic.src = event.target.result;
                updateUserAvatar(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
    
    saveUsernameBtn.addEventListener('click', () => {
        const newUsername = usernameInput.value.trim();
        if (newUsername) {
            updateUsername(newUsername);
            usernameInput.value = '';
        }
    });
    
    logoutBtn.addEventListener('click', () => {
        logout();
    });
}

function loadSection(section) {
    const mainContent = document.getElementById('mainContent');
    
    switch (section) {
        case 'builds':
            renderPostsSection('Сборки', 'builds');
            break;
        case 'redesigns':
            renderPostsSection('Редизайны', 'redesigns');
            break;
        case 'admin':
            renderAdminSection();
            break;
        default:
            renderPostsSection('Сборки', 'builds');
    }
}

function renderPostsSection(title, section) {
    const mainContent = document.getElementById('mainContent');
    const currentUser = getCurrentUser();
    
    let html = `
        <div class="section-title">
            <h2>${title}</h2>
    `;
    
    // Кнопка добавления поста только для админов
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'developer' || 
        (currentUser.role === 'poster' && section === 'builds') || 
        (currentUser.role === 'poster' && section === 'redesigns'))) {
        html += `<button class="add-post-btn" id="addPostBtn">Пост</button>`;
    }
    
    html += `</div><div class="posts-grid" id="postsGrid"></div>`;
    
    mainContent.innerHTML = html;
    
    // Загрузка постов
    loadPosts(section);
    
    // Обработчик кнопки добавления поста
    const addPostBtn = document.getElementById('addPostBtn');
    if (addPostBtn) {
        addPostBtn.addEventListener('click', () => {
            openPostModal(section);
        });
    }
}

function loadPosts(section) {
    const postsGrid = document.getElementById('postsGrid');
    const posts = getPostsBySection(section);
    
    if (posts.length === 0) {
        postsGrid.innerHTML = '<p>Пока нет постов в этом разделе.</p>';
        return;
    }
    
    postsGrid.innerHTML = '';
    
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post-card';
        postElement.innerHTML = `
            <img src="${post.image}" alt="Изображение поста" class="post-image">
            <div class="post-content">
                <p class="post-description">${post.description}</p>
                <a href="${post.file}" download class="download-btn">Скачать</a>
            </div>
        `;
        postsGrid.appendChild(postElement);
    });
}

function renderAdminSection() {
    const mainContent = document.getElementById('mainContent');
    const currentUser = getCurrentUser();
    
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'developer')) {
        mainContent.innerHTML = '<h2 class="admin-message">Вы не администратор, доступ запрещён</h2>';
        return;
    }
    
    mainContent.innerHTML = `
        <h2>Админ панель</h2>
        <button id="openAdminModal" class="add-post-btn">Управление</button>
    `;
    
    document.getElementById('openAdminModal').addEventListener('click', openAdminModal);
}

function openPostModal(section) {
    const postModal = document.getElementById('postModal');
    const postImage = document.getElementById('postImage');
    const postFile = document.getElementById('postFile');
    const postDescription = document.getElementById('postDescription');
    const cancelPost = document.getElementById('cancelPost');
    const submitPost = document.getElementById('submitPost');
    
    let imageFile = null;
    let fileToUpload = null;
    
    postImage.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            imageFile = file;
        }
    });
    
    postFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            fileToUpload = file;
        }
    });
    
    cancelPost.addEventListener('click', () => {
        postModal.classList.remove('active');
        postDescription.value = '';
        postImage.value = '';
        postFile.value = '';
        imageFile = null;
        fileToUpload = null;
    });
    
    submitPost.addEventListener('click', () => {
        const description = postDescription.value.trim();
        
        if (!description) {
            alert('Введите описание поста');
            return;
        }
        
        if (!imageFile) {
            alert('Выберите изображение для поста');
            return;
        }
        
        if (!fileToUpload) {
            alert('Выберите файл для загрузки');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageDataUrl = e.target.result;
            
            const fileReader = new FileReader();
            fileReader.onload = (e) => {
                const fileDataUrl = e.target.result;
                
                // Создание поста
                createPost({
                    section,
                    description,
                    image: imageDataUrl,
                    file: fileDataUrl,
                    fileName: fileToUpload.name,
                    author: getCurrentUser().username,
                    date: new Date().toISOString()
                });
                
                postModal.classList.remove('active');
                postDescription.value = '';
                postImage.value = '';
                postFile.value = '';
                imageFile = null;
                fileToUpload = null;
                
                // Обновление списка постов
                loadSection(section);
            };
            fileReader.readAsDataURL(fileToUpload);
        };
        reader.readAsDataURL(imageFile);
    });
    
    postModal.classList.add('active');
}

function openAdminModal() {
    const adminModal = document.getElementById('adminModal');
    const adminTabs = document.querySelectorAll('.admin-tab');
    const adminTabContents = document.querySelectorAll('.admin-tab-content');
    
    adminTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            
            adminTabs.forEach(t => t.classList.remove('active'));
            adminTabContents.forEach(content => content.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${tabName}Tab`).classList.add('active');
            
            if (tabName === 'users') {
                renderUsersList();
            } else if (tabName === 'posts') {
                renderPostsList();
            }
        });
    });
    
    // Инициализация
    renderUsersList();
    adminModal.classList.add('active');
}

function renderUsersList() {
    const usersList = document.getElementById('usersList');
    const currentUser = getCurrentUser();
    const users = getAllUsers();
    
    usersList.innerHTML = '';
    
    users.forEach(user => {
        if (user.username === currentUser.username) return;
        
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        
        let roleBadge = '';
        switch (user.role) {
            case 'admin':
                roleBadge = 'Админ';
                break;
            case 'developer':
                roleBadge = 'Разработчик';
                break;
            case 'poster':
                roleBadge = 'Сборкадел';
                break;
            default:
                roleBadge = 'Пользователь';
        }
        
        userItem.innerHTML = `
            <div>
                <strong>${user.username}</strong>
                <span>(${roleBadge})</span>
            </div>
            <div class="user-actions">
        `;
        
        if (currentUser.role === 'developer') {
            if (user.role === 'user') {
                userItem.innerHTML += `
                    <button class="action-btn make-poster" data-username="${user.username}">Сборкадел</button>
                    <button class="action-btn make-admin" data-username="${user.username}">Админ</button>
                `;
            } else if (user.role === 'poster') {
                userItem.innerHTML += `
                    <button class="action-btn make-user" data-username="${user.username}">Убрать роль</button>
                    <button class="action-btn make-admin" data-username="${user.username}">Админ</button>
                `;
            } else if (user.role === 'admin') {
                userItem.innerHTML += `
                    <button class="action-btn make-user" data-username="${user.username}">Убрать роль</button>
                `;
            }
        } else if (currentUser.role === 'admin' && user.role === 'user') {
            userItem.innerHTML += `
                <button class="action-btn make-poster" data-username="${user.username}">Сборкадел</button>
            `;
        }
        
        userItem.innerHTML += `</div>`;
        usersList.appendChild(userItem);
    });
    
    // Обработчики для кнопок изменения ролей
    document.querySelectorAll('.make-user').forEach(btn => {
        btn.addEventListener('click', (e) => {
            updateUserRole(e.target.getAttribute('data-username'), 'user');
            renderUsersList();
        });
    });
    
    document.querySelectorAll('.make-poster').forEach(btn => {
        btn.addEventListener('click', (e) => {
            updateUserRole(e.target.getAttribute('data-username'), 'poster');
            renderUsersList();
        });
    });
    
    document.querySelectorAll('.make-admin').forEach(btn => {
        btn.addEventListener('click', (e) => {
            updateUserRole(e.target.getAttribute('data-username'), 'admin');
            renderUsersList();
        });
    });
}

function renderPostsList() {
    const postsList = document.getElementById('postsList');
    const sectionFilter = document.getElementById('postsSectionFilter');
    const currentUser = getCurrentUser();
    
    postsList.innerHTML = '';
    
    sectionFilter.addEventListener('change', () => {
        renderPostsList();
    });
    
    let posts = getAllPosts();
    const filterValue = sectionFilter.value;
    
    if (filterValue !== 'all') {
        posts = posts.filter(post => post.section === filterValue);
    }
    
    if (posts.length === 0) {
        postsList.innerHTML = '<p>Нет постов для отображения</p>';
        return;
    }
    
    posts.forEach(post => {
        const postItem = document.createElement('div');
        postItem.className = 'post-item';
        
        let sectionName = '';
        switch (post.section) {
            case 'builds':
                sectionName = 'Сборки';
                break;
            case 'redesigns':
                sectionName = 'Редизайны';
                break;
        }
        
        postItem.innerHTML = `
            <div>
                <strong>${sectionName}</strong>
                <p>${post.description}</p>
                <small>Автор: ${post.author}, ${new Date(post.date).toLocaleString()}</small>
            </div>
        `;
        
        if (currentUser.role === 'developer') {
            postItem.innerHTML += `
                <div class="post-actions">
                    <button class="action-btn delete-post" data-id="${post.id}">Удалить</button>
                </div>
            `;
        }
        
        postsList.appendChild(postItem);
    });
    
    // Обработчики для кнопок удаления постов
    document.querySelectorAll('.delete-post').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (confirm('Вы уверены, что хотите удалить этот пост?')) {
                deletePost(e.target.getAttribute('data-id'));
                renderPostsList();
            }
        });
    });
}

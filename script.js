// Основной файл приложения
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    // Загрузка постов при загрузке страницы
    loadPosts('builds');
    
    // Настройка навигации
    setupNavigation();
    
    // Настройка поиска
    setupSearch();
}

async function loadPosts(category) {
    const mainElement = document.getElementById('app-main');
    mainElement.innerHTML = '<div class="loading">Загрузка постов...</div>';
    
    try {
        const posts = await getPosts(category);
        displayPosts(posts, mainElement);
    } catch (error) {
        mainElement.innerHTML = '<div class="error">Ошибка загрузки постов</div>';
        console.error(error);
    }
}

function displayPosts(posts, element) {
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
    
    postElement.innerHTML = `
        <img src="${post[2]}" alt="${post[0]}" class="post-banner">
        <div class="post-content">
            <h3 class="post-title">${post[0]}</h3>
            <p class="post-description">${post[1]}</p>
            ${post[3] ? `<a href="${post[3]}" class="download-button">Скачать</a>` : ''}
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

async function performSearch() {
    const searchTerm = document.getElementById('search-input').value.trim();
    if (searchTerm === '') return;
    
    try {
        const allPosts = await getPosts();
        const filteredPosts = allPosts.filter(post => 
            post[0].toLowerCase().includes(searchTerm.toLowerCase()) || 
            post[1].toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        const mainElement = document.getElementById('app-main');
        displayPosts(filteredPosts, mainElement);
    } catch (error) {
        console.error('Search error:', error);
        alert('Ошибка при выполнении поиска');
    }
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
    
    setupPostCreation();
}

function setupPostCreation() {
    const selectBannerButton = document.getElementById('select-banner');
    const bannerInput = document.getElementById('post-banner');
    const bannerPreview = document.getElementById('banner-preview');
    
    const selectFileButton = document.getElementById('select-file');
    const fileInput = document.getElementById('post-file');
    const fileInfo = document.getElementById('file-info');
    
    const previewButton = document.getElementById('preview-post');
    const publishButton = document.getElementById('publish-post');
    const postPreview = document.getElementById('post-preview');
    
    let bannerFile = null;
    let postFile = null;
    
    // Выбор баннера
    selectBannerButton.addEventListener('click', function() {
        bannerInput.click();
    });
    
    bannerInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            bannerFile = e.target.files[0];
            
            // Показываем превью
            const reader = new FileReader();
            reader.onload = function(event) {
                bannerPreview.innerHTML = `<img src="${event.target.result}" alt="Превью баннера">`;
                bannerPreview.style.display = 'block';
            };
            reader.readAsDataURL(bannerFile);
        }
    });
    
    // Выбор файла
    selectFileButton.addEventListener('click', function() {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            postFile = e.target.files[0];
            fileInfo.textContent = `Выбран файл: ${postFile.name} (${(postFile.size / 1024 / 1024).toFixed(2)} MB)`;
        }
    });
    
    // Превью поста
    previewButton.addEventListener('click', function() {
        const title = document.getElementById('post-title').value;
        const description = document.getElementById('post-description').value;
        const activeTab = document.querySelector('.nav-button.active').dataset.tab;
        
        if (!title || !description || !bannerFile) {
            alert('Заполните все обязательные поля: название, описание и баннер');
            return;
        }
        
        // Создаем превью поста
        postPreview.innerHTML = `
            <div class="post">
                <img src="${URL.createObjectURL(bannerFile)}" alt="${title}" class="post-banner">
                <div class="post-content">
                    <h3 class="post-title">${title}</h3>
                    <p class="post-description">${description}</p>
                    ${postFile ? '<a href="#" class="download-button">Скачать</a>' : ''}
                </div>
            </div>
            <p class="preview-note">Это предварительный просмотр. После публикации пост будет доступен всем пользователям.</p>
        `;
        
        postPreview.style.display = 'block';
        publishButton.disabled = false;
    });
    
    // Публикация поста
    publishButton.addEventListener('click', async function() {
        const title = document.getElementById('post-title').value;
        const description = document.getElementById('post-description').value;
        const activeTab = document.querySelector('.nav-button.active').dataset.tab;
        
        if (!title || !description || !bannerFile) {
            alert('Заполните все обязательные поля: название, описание и баннер');
            return;
        }
        
        try {
            await createPost({
                title,
                description,
                bannerFile,
                postFile,
                category: activeTab
            });
            
            alert('Пост успешно опубликован!');
            
            // Закрываем модальное окно
            document.getElementById('create-post-modal').style.display = 'none';
            
            // Очищаем форму
            resetPostForm();
            
            // Обновляем список постов
            loadPosts(activeTab);
        } catch (error) {
            console.error('Error publishing post:', error);
            alert('Ошибка при публикации поста');
        }
    });
}

function resetPostForm() {
    document.getElementById('post-title').value = '';
    document.getElementById('post-description').value = '';
    document.getElementById('banner-preview').innerHTML = '';
    document.getElementById('banner-preview').style.display = 'none';
    document.getElementById('file-info').textContent = '';
    document.getElementById('post-preview').innerHTML = '';
    document.getElementById('post-preview').style.display = 'none';
    document.getElementById('publish-post').disabled = true;
    
    bannerFile = null;
    postFile = null;
}

function showEditPostsPanel() {
    const adminContent = document.getElementById('admin-content');
    adminContent.innerHTML = '<div class="loading">Загрузка списка постов для редактирования...</div>';
    
    loadPostsForEditing(adminContent);
}

async function loadPostsForEditing(element) {
    try {
        const posts = await getPosts();
        displayPostsForEditing(posts, element);
    } catch (error) {
        console.error('Error loading posts for editing:', error);
        element.innerHTML = '<div class="error">Ошибка загрузки постов</div>';
    }
}

function displayPostsForEditing(posts, element) {
    let html = `
        <h3>Редактирование постов</h3>
        <table class="posts-table">
            <thead>
                <tr>
                    <th>Название</th>
                    <th>Категория</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    posts.forEach(post => {
        html += `
            <tr>
                <td>${post[0]}</td>
                <td>${post[4] === 'builds' ? 'Сборки' : 'Редизайны'}</td>
                <td>
                    <button class="edit-post" data-id="${post[2].split('id=')[1].split('&')[0]}">✏️</button>
                    <button class="delete-post" data-id="${post[2].split('id=')[1].split('&')[0]}">🗑️</button>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    element.innerHTML = html;
    
    // Настройка обработчиков для кнопок редактирования и удаления
    document.querySelectorAll('.edit-post').forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.dataset.id;
            editPost(postId);
        });
    });
    
    document.querySelectorAll('.delete-post').forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.dataset.id;
            if (confirm('Вы уверены, что хотите удалить этот пост?')) {
                deletePost(postId);
            }
        });
    });
}

async function editPost(postId) {
    // Здесь будет логика редактирования поста
    alert(`Редактирование поста с ID: ${postId}`);
    // В реальном приложении нужно загрузить данные поста и заполнить форму редактирования
}

async function deletePost(postId) {
    try {
        await deletePostFromDrive(postId);
        alert('Пост успешно удален!');
        
        // Обновляем список постов
        const activeTab = document.querySelector('.nav-button.active').dataset.tab;
        if (activeTab !== 'admin') {
            loadPosts(activeTab);
        } else {
            showEditPostsPanel();
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Ошибка при удалении поста');
    }
}

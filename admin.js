// Файл с логикой админ-панели
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация админских функций
    if (document.getElementById('admin-login-modal')) {
        setupAdminLogin();
    }
});

function setupAdminLogin() {
    const loginButton = document.getElementById('login-admin');
    if (!loginButton) return;
    
    loginButton.addEventListener('click', function() {
        const password = document.getElementById('admin-password').value;
        const adminPasswords = [
            'admin123',
            'securepass',
            'blackwhite',
            'postmaster',
            'telegram2023'
        ];
        
        if (adminPasswords.includes(password)) {
            // Успешный вход
            isAdmin = true;
            localStorage.setItem('isAdmin', 'true');
            
            // Закрываем модальное окно
            document.getElementById('admin-login-modal').style.display = 'none';
            
            // Показываем админ-панель
            showAdminPanel();
        } else {
            alert('Неверный пароль!');
        }
    });
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
                    <a href="#" class="download-button">Скачать</a>
                </div>
            </div>
            <p class="preview-note">Это предварительный просмотр. После публикации пост будет доступен всем пользователям.</p>
        `;
        
        postPreview.style.display = 'block';
        publishButton.disabled = false;
    });
    
    // Публикация поста
    publishButton.addEventListener('click', function() {
        const title = document.getElementById('post-title').value;
        const description = document.getElementById('post-description').value;
        const activeTab = document.querySelector('.nav-button.active').dataset.tab;
        
        if (!title || !description || !bannerFile) {
            alert('Заполните все обязательные поля: название, описание и баннер');
            return;
        }
        
        // Здесь будет код для загрузки файлов на Firebase Storage
        // и сохранения данных поста в Firestore
        
        alert(`Пост "${title}" будет опубликован в категории "${activeTab}". В реальном приложении здесь будет загрузка на Firebase.`);
        
        // Закрываем модальное окно
        document.getElementById('create-post-modal').style.display = 'none';
        
        // Очищаем форму
        resetPostForm();
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
    
    // Здесь будет загрузка постов для редактирования
    setTimeout(() => {
        displayPostsForEditing(adminContent);
    }, 500);
}

function displayPostsForEditing(element) {
    // Временные данные для демонстрации
    const posts = [
        { id: '1', title: 'Сборка Windows 11 Pro', category: 'builds', date: '2023-06-15' },
        { id: '2', title: 'Сборка macOS Ventura', category: 'builds', date: '2023-06-10' },
        { id: '3', title: 'Редизайн интерфейса Telegram', category: 'redesigns', date: '2023-06-05' }
    ];
    
    let html = `
        <h3>Редактирование постов</h3>
        <table class="posts-table">
            <thead>
                <tr>
                    <th>Название</th>
                    <th>Категория</th>
                    <th>Дата</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    posts.forEach(post => {
        html += `
            <tr data-id="${post.id}">
                <td>${post.title}</td>
                <td>${post.category === 'builds' ? 'Сборки' : 'Редизайны'}</td>
                <td>${post.date}</td>
                <td>
                    <button class="edit-post" data-id="${post.id}">✏️</button>
                    <button class="delete-post" data-id="${post.id}">🗑️</button>
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

function editPost(postId) {
    // Здесь будет логика редактирования поста
    alert(`Редактирование поста с ID: ${postId}`);
}

function deletePost(postId) {
    // Здесь будет логика удаления поста
    alert(`Удаление поста с ID: ${postId}`);
    // В реальном приложении нужно удалить пост из Firestore
    // и связанные файлы из Storage
}

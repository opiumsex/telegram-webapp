// Инициализация хранилища
function initStorage() {
    // Основной администратор (разработчик)
    const adminUser = {
        id: 'admin123',
        username: 'Разработчик',
        password: hashPassword('admin123'), // В реальном приложении используйте надежный пароль
        avatar: 'https://via.placeholder.com/100',
        role: 'developer',
        ip: '',
        registeredAt: new Date().toISOString()
    };
    
    // Тестовый пользователь с правами "Сборкадел"
    const posterUser = {
        id: 'poster123',
        username: 'Сборкадел',
        password: hashPassword('poster123'),
        avatar: 'https://via.placeholder.com/100',
        role: 'poster',
        ip: '',
        registeredAt: new Date().toISOString()
    };
    
    // Тестовый пользователь
    const testUser = {
        id: 'user123',
        username: 'Пользователь',
        password: hashPassword('user123'),
        avatar: 'https://via.placeholder.com/100',
        role: 'user',
        ip: '',
        registeredAt: new Date().toISOString()
    };
    
    localStorage.setItem('users', JSON.stringify([adminUser, posterUser, testUser]));
    
    // Тестовые посты
    const testPosts = [
        {
            id: 'post1',
            section: 'builds',
            description: 'Тестовая сборка для демонстрации',
            image: 'https://via.placeholder.com/400x200',
            file: 'https://example.com/testfile.zip',
            fileName: 'testfile.zip',
            author: 'Разработчик',
            date: new Date().toISOString()
        },
        {
            id: 'post2',
            section: 'redesigns',
            description: 'Пример редизайна интерфейса',
            image: 'https://via.placeholder.com/400x200',
            file: 'https://example.com/redesign.zip',
            fileName: 'redesign.zip',
            author: 'Сборкадел',
            date: new Date().toISOString()
        }
    ];
    
    localStorage.setItem('posts', JSON.stringify(testPosts));
}

// Вспомогательная функция для хэширования пароля (повторно используем из auth.js)
function hashPassword(password) {
    return password.split('').reverse().join('') + password.length;
}

// Вспомогательная функция для генерации ID (повторно используем из auth.js)
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Система аутентификации
function checkAuth() {
    const authModal = document.getElementById('authModal');
    const loginModal = document.getElementById('loginModal');
    
    // Проверка, зарегистрирован ли пользователь
    if (!localStorage.getItem('users')) {
        // Первый вход - показываем регистрацию
        authModal.classList.add('active');
        setupRegistration();
    } else {
        // Проверка, авторизован ли пользователь
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            // Показываем вход
            loginModal.classList.add('active');
            setupLogin();
        } else {
            // Пользователь авторизован - обновляем UI
            updateUserUI(currentUser);
        }
    }
}

function setupRegistration() {
    const registerBtn = document.getElementById('registerBtn');
    const registerAvatar = document.getElementById('registerAvatar');
    const avatarPreview = document.getElementById('avatarPreview');
    const registerUsername = document.getElementById('registerUsername');
    const registerPassword = document.getElementById('registerPassword');
    const registerConfirmPassword = document.getElementById('registerConfirmPassword');
    
    registerAvatar.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                avatarPreview.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    registerBtn.addEventListener('click', () => {
        const username = registerUsername.value.trim();
        const password = registerPassword.value.trim();
        const confirmPassword = registerConfirmPassword.value.trim();
        const avatarFile = registerAvatar.files[0];
        
        if (!username || !password || !confirmPassword) {
            alert('Заполните все поля');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }
        
        if (password.length < 6) {
            alert('Пароль должен содержать минимум 6 символов');
            return;
        }
        
        if (!avatarFile) {
            alert('Выберите аватар');
            return;
        }
        
        // Проверка, существует ли пользователь
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some(user => user.username === username)) {
            alert('Пользователь с таким именем уже существует');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const newUser = {
                id: generateId(),
                username,
                password: hashPassword(password),
                avatar: event.target.result,
                role: 'user',
                ip: '', // Будет установлено при входе
                registeredAt: new Date().toISOString()
            };
            
            // Добавление пользователя
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Авторизация пользователя
            loginUser(newUser);
            
            // Закрытие модального окна
            document.getElementById('authModal').classList.remove('active');
        };
        reader.readAsDataURL(avatarFile);
    });
}

function setupLogin() {
    const loginBtn = document.getElementById('loginBtn');
    const loginUsername = document.getElementById('loginUsername');
    const loginPassword = document.getElementById('loginPassword');
    
    loginBtn.addEventListener('click', () => {
        const username = loginUsername.value.trim();
        const password = loginPassword.value.trim();
        
        if (!username || !password) {
            alert('Заполните все поля');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users'));
        const user = users.find(u => u.username === username);
        
        if (!user) {
            alert('Пользователь не найден');
            return;
        }
        
        if (user.password !== hashPassword(password)) {
            alert('Неверный пароль');
            return;
        }
        
        // Авторизация пользователя
        loginUser(user);
        
        // Закрытие модального окна
        document.getElementById('loginModal').classList.remove('active');
    });
}

function loginUser(user) {
    // Получение IP пользователя (упрощенный вариант)
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            user.ip = data.ip;
            
            // Сохранение текущего пользователя
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Обновление UI
            updateUserUI(user);
        })
        .catch(() => {
            // Если не удалось получить IP, сохраняем без него
            localStorage.setItem('currentUser', JSON.stringify(user));
            updateUserUI(user);
        });
}

function logout() {
    localStorage.removeItem('currentUser');
    document.getElementById('sideMenu').classList.remove('active');
    document.getElementById('sideMenuOverlay').classList.remove('active');
    
    // Показываем окно входа
    document.getElementById('loginModal').classList.add('active');
    setupLogin();
    
    // Сброс UI
    document.getElementById('profilePic').src = '';
    document.getElementById('usernameDisplay').textContent = 'Гость';
}

function updateUserUI(user) {
    document.getElementById('profilePic').src = user.avatar;
    document.getElementById('usernameDisplay').textContent = user.username;
}

function updateUsername(newUsername) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users'));
    
    // Проверка на уникальность имени
    if (users.some(user => user.username === newUsername && user.id !== currentUser.id)) {
        alert('Пользователь с таким именем уже существует');
        return;
    }
    
    // Обновление текущего пользователя
    currentUser.username = newUsername;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    document.getElementById('usernameDisplay').textContent = newUsername;
    
    // Обновление в списке пользователей
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].username = newUsername;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

function updateUserAvatar(newAvatar) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users'));
    
    // Обновление текущего пользователя
    currentUser.avatar = newAvatar;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Обновление в списке пользователей
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].avatar = newAvatar;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function hashPassword(password) {
    // Упрощенная "хэш"-функция (в реальном приложении используйте bcrypt или аналоги)
    return password.split('').reverse().join('') + password.length;
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

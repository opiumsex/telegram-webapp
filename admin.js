// Админ-панель
function getAllUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function updateUserRole(username, newRole) {
    const users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex !== -1) {
        users[userIndex].role = newRole;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Обновление текущего пользователя, если это он
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.username === username) {
            currentUser.role = newRole;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        return true;
    }
    
    return false;
}

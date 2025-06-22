// Аутентификация администратора
const adminPasswords = ['admin1', 'admin2', 'admin3', 'admin4', 'admin5'];
let isAdmin = false;

function checkAdminAuth() {
  // В реальном приложении используйте более надежную аутентификацию
  return isAdmin;
}

function showAdminLogin() {
  const modalOverlay = document.getElementById('modal-overlay');
  const modalContainer = document.querySelector('.modal-container');
  
  modalContainer.innerHTML = `
    <h2 class="modal-title">Вход в админ-панель</h2>
    <div class="form-group">
      <label for="admin-password" class="form-label">Пароль:</label>
      <input type="password" id="admin-password" class="form-input" placeholder="Введите пароль">
    </div>
    <button class="submit-button" id="login-admin">Войти</button>
  `;
  
  modalOverlay.style.display = 'flex';
  
  document.getElementById('login-admin').addEventListener('click', () => {
    const password = document.getElementById('admin-password').value;
    
    if (adminPasswords.includes(password)) {
      isAdmin = true;
      modalOverlay.style.display = 'none';
      renderContent();
    } else {
      alert('Неверный пароль!');
    }
  });
}

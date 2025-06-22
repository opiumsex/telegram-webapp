// Основные переменные
let currentSection = 'builds';
let posts = { builds: [], redesigns: [] };

// Инициализация приложения
async function initApp() {
  try {
    posts = await loadPostsFromGitHub();
    setupNavigation();
    setupSearch();
    renderContent();
    updateNavIndicator();
    setupModalClose();
  } catch (error) {
    console.error('Ошибка инициализации:', error);
    document.getElementById('app-content').innerHTML = `
      <div class="error">
        Ошибка загрузки данных. Пожалуйста, попробуйте позже.
      </div>
    `;
  }
}

// Остальные функции из предыдущего примера
// ... (setupNavigation, renderContent, setupDownloadButtons и т.д.)

// В функциях создания/обновления постов замените все вызовы savePostsToStorage() на:
await savePostsToGitHub(posts);

// Добавьте эту строку в конец файла для инициализации
document.addEventListener('DOMContentLoaded', initApp);

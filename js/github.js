// Конфигурация GitHub
const githubConfig = {
  repoOwner: 'opiumsex',
  repoName: 'telegram-webapp',
  branch: 'main',
  folder: 'assembly',
  token: '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'
};

// Загрузка данных из GitHub
async function loadPostsFromGitHub() {
  try {
    const url = `https://api.github.com/repos/${githubConfig.repoOwner}/${githubConfig.repoName}/contents/${githubConfig.folder}/posts.json?ref=${githubConfig.branch}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${githubConfig.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) throw new Error('Ошибка загрузки данных');
    
    const data = await response.json();
    const content = JSON.parse(atob(data.content));
    return content;
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    return { builds: [], redesigns: [] };
  }
}

// Сохранение данных в GitHub
async function savePostsToGitHub(posts) {
  try {
    // Получаем текущий SHA файла
    const getUrl = `https://api.github.com/repos/${githubConfig.repoOwner}/${githubConfig.repoName}/contents/${githubConfig.folder}/posts.json?ref=${githubConfig.branch}`;
    const getResponse = await fetch(getUrl, {
      headers: {
        'Authorization': `token ${githubConfig.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    const fileData = await getResponse.json();
    const sha = fileData.sha;
    
    // Обновляем файл
    const updateUrl = `https://api.github.com/repos/${githubConfig.repoOwner}/${githubConfig.repoName}/contents/${githubConfig.folder}/posts.json`;
    const content = btoa(JSON.stringify(posts, null, 2));
    
    const response = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${githubConfig.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Обновление постов',
        content: content,
        sha: sha,
        branch: githubConfig.branch
      })
    });
    
    if (!response.ok) throw new Error('Ошибка сохранения');
    return true;
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    throw error;
  }
}

// Загрузка файла на GitHub
async function uploadFileToGitHub(file, filename) {
  const reader = new FileReader();
  
  return new Promise((resolve, reject) => {
    reader.onload = async function(event) {
      const content = event.target.result.split(',')[1];
      
      const url = `https://api.github.com/repos/${githubConfig.repoOwner}/${githubConfig.repoName}/contents/${githubConfig.folder}/${filename}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubConfig.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Добавлен файл ${filename}`,
          content: content,
          branch: githubConfig.branch
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка загрузки файла');
      }
      
      resolve(filename);
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

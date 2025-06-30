
let currentTab = 'builds';
let isAdmin = false;
let userNick = '';

function switchTab(tab) {
  currentTab = tab;
  document.getElementById('content').innerHTML = '';
  document.getElementById('tab-indicator').style.left = tab === 'builds' ? '0%' : tab === 'redesigns' ? '33.3%' : '66.6%';
  loadPosts();
}

function toggleMenu() {
  document.getElementById('side-menu').classList.toggle('active');
}

function openLogin() {
  document.getElementById('login-modal').style.display = 'flex';
}

function closeLogin() {
  document.getElementById('login-modal').style.display = 'none';
}

function login() {
  const nick = document.getElementById('login-nick').value;
  const pass = document.getElementById('login-password').value;

  firebase.firestore().collection("admins").doc("main").get().then(doc => {
    if (doc.exists && doc.data().password === pass) {
      isAdmin = true;
      userNick = nick;
      document.getElementById('username').innerText = nick;
      document.getElementById('add-post-btn').style.display = 'block';
      document.querySelectorAll('.admin-only').forEach(e => e.style.display = 'inline-block');
      closeLogin();
    } else {
      alert("Неверный пароль");
    }
  });
}

function openCreatePost() {
  document.getElementById('create-modal').style.display = 'flex';
}

function closeCreatePost() {
  document.getElementById('create-modal').style.display = 'none';
}

async function createPost() {
  const title = document.getElementById('post-title').value;
  const desc = document.getElementById('post-desc').value;
  const image = document.getElementById('post-image').files[0];
  const file = document.getElementById('post-file').files[0];
  const tab = currentTab;
  const date = new Date().toLocaleDateString('ru-RU');

  if (!title || !desc || !image || !file) {
    alert("Заполните все поля и выберите файлы");
    return;
  }

  const imgRef = storage.ref().child('images/' + Date.now() + '_' + image.name);
  const fileRef = storage.ref().child('files/' + Date.now() + '_' + file.name);

  await imgRef.put(image);
  await fileRef.put(file);

  const imgURL = await imgRef.getDownloadURL();
  const fileURL = await fileRef.getDownloadURL();

  await db.collection(tab).add({
    title,
    desc,
    imgURL,
    fileURL,
    author: userNick,
    date
  });

  alert("Пост создан");
  closeCreatePost();
  loadPosts();
}

function loadPosts() {
  const container = document.getElementById('content');
  container.innerHTML = '<h2>' + (currentTab === 'builds' ? 'Сборки на Black Russia' : currentTab === 'redesigns' ? 'Редизайны лаунчеров' : 'Админ панель') + '</h2>';

  if (currentTab === 'admin') {
    ['builds', 'redesigns'].forEach(col => {
      db.collection(col).get().then(snapshot => {
        snapshot.forEach(doc => {
          const d = doc.data();
          container.innerHTML += `
            <div class="post">
              <img src="${d.imgURL}" style="width:100%;border-radius:10px;" />
              <h3>${d.title}</h3>
              <p>${d.desc}</p>
              <a href="${d.fileURL}" download>Скачать</a>
              <div style="display:flex;justify-content:space-between;font-size:12px;">
                <span>${d.author}</span>
                <span>${d.date}</span>
              </div>
              <button onclick="deletePost('${col}', '${doc.id}')">Удалить</button>
            </div>`;
        });
      });
    });
  } else {
    db.collection(currentTab).get().then(snapshot => {
      snapshot.forEach(doc => {
        const d = doc.data();
        container.innerHTML += `
          <div class="post">
            <img src="${d.imgURL}" style="width:100%;border-radius:10px;" />
            <h3>${d.title}</h3>
            <p>${d.desc}</p>
            <a href="${d.fileURL}" download>Скачать</a>
            <div style="display:flex;justify-content:space-between;font-size:12px;">
              <span>${d.author}</span>
              <span>${d.date}</span>
            </div>
          </div>`;
      });
    });
  }
}

function deletePost(col, id) {
  if (confirm("Удалить пост?")) {
    db.collection(col).doc(id).delete().then(() => {
      alert("Удалено");
      loadPosts();
    });
  }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  switchTab('builds');
});

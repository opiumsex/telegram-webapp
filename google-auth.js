// Конфигурация Google API
const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY';
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const ADMIN_SHEET_ID = 'YOUR_GOOGLE_SHEET_ID';
const POSTS_FOLDER_ID = 'YOUR_GOOGLE_DRIVE_FOLDER_ID_FOR_POSTS';

let gapiInited = false;
let gisInited = false;
let tokenClient;
let isAdmin = false;

// Инициализация Google API
function initializeGoogleAuth() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: GOOGLE_API_KEY,
        discoveryDocs: [
            'https://sheets.googleapis.com/$discovery/rest?version=v4',
            'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
        ],
    });
    gapiInited = true;
    maybeEnableAuth();
}

function initializeGIS() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive.file',
        callback: '', // Определяется позже
    });
    gisInited = true;
    maybeEnableAuth();
}

function maybeEnableAuth() {
    if (gapiInited && gisInited) {
        document.getElementById('login-admin').disabled = false;
    }
}

// Аутентификация администратора
async function authenticateAdmin() {
    const password = document.getElementById('admin-password').value;
    
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw resp;
        }
        await checkAdminPassword(password);
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({prompt: ''});
    } else {
        tokenClient.requestAccessToken({prompt: ''});
    }
}

// Проверка пароля администратора
async function checkAdminPassword(password) {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: ADMIN_SHEET_ID,
            range: 'Admins!A2:A',
        });
        
        const adminPasswords = response.data.values.flat();
        isAdmin = adminPasswords.includes(password);
        
        if (isAdmin) {
            document.getElementById('admin-login-modal').style.display = 'none';
            showAdminPanel();
        } else {
            alert('Неверный пароль администратора');
        }
    } catch (err) {
        console.error('Error checking admin password:', err);
        alert('Ошибка при проверке пароля');
    }
}

// Инициализация при загрузке
window.onload = function() {
    initializeGoogleAuth();
    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: initializeGIS
    });
};

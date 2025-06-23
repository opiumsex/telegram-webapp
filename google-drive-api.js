// Работа с Google Drive API

// Загрузка файла на Google Drive
async function uploadFileToDrive(file, folderId) {
    const metadata = {
        name: file.name,
        mimeType: file.type,
        parents: [folderId]
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
    formData.append('file', file);

    try {
        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + gapi.client.getToken().access_token
            },
            body: formData
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

// Создание поста
async function createPost(postData) {
    try {
        // 1. Загружаем баннер
        const bannerResponse = await uploadFileToDrive(postData.bannerFile, POSTS_FOLDER_ID);
        const bannerUrl = `https://drive.google.com/uc?export=view&id=${bannerResponse.id}`;
        
        // 2. Загружаем файл (если есть)
        let fileUrl = '';
        if (postData.postFile) {
            const fileResponse = await uploadFileToDrive(postData.postFile, POSTS_FOLDER_ID);
            fileUrl = `https://drive.google.com/uc?export=download&id=${fileResponse.id}`;
        }
        
        // 3. Сохраняем данные поста в Google Sheet
        await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: ADMIN_SHEET_ID,
            range: 'Posts!A2:E',
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [[
                    postData.title,
                    postData.description,
                    bannerUrl,
                    fileUrl,
                    postData.category
                ]]
            }
        });
        
        return true;
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
}

// Получение списка постов
async function getPosts(category) {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: ADMIN_SHEET_ID,
            range: 'Posts!A2:E',
        });
        
        const allPosts = response.data.values || [];
        
        // Фильтруем по категории, если указана
        if (category) {
            return allPosts.filter(post => post[4] === category);
        }
        
        return allPosts;
    } catch (error) {
        console.error('Error getting posts:', error);
        throw error;
    }
}

// Удаление поста
async function deletePost(postId) {
    try {
        // Удаляем файлы из Drive
        await gapi.client.drive.files.delete({
            fileId: postId
        });
        
        // Удаляем запись из таблицы
        // (Здесь нужно реализовать логику поиска и удаления строки)
        
        return true;
    } catch (error) {
        console.error('Error deleting post:', error);
        throw error;
    }
}

// Управление постами
function getPostsBySection(section) {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    return posts.filter(post => post.section === section);
}

function getAllPosts() {
    return JSON.parse(localStorage.getItem('posts')) || [];
}

function createPost(postData) {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    const newPost = {
        id: generateId(),
        ...postData
    };
    posts.push(newPost);
    localStorage.setItem('posts', JSON.stringify(posts));
    return newPost;
}

function deletePost(postId) {
    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    posts = posts.filter(post => post.id !== postId);
    localStorage.setItem('posts', JSON.stringify(posts));
}

function updatePost(postId, updatedData) {
    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    const postIndex = posts.findIndex(post => post.id === postId);
    
    if (postIndex !== -1) {
        posts[postIndex] = { ...posts[postIndex], ...updatedData };
        localStorage.setItem('posts', JSON.stringify(posts));
        return true;
    }
    
    return false;
}

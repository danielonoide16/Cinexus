const API = 'http://localhost:3000/api';

function getToken() {
    return localStorage.getItem('token');
}

function ajax(method, url, body, cb) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, API + url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    const token = getToken();
    if (token) xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.onload = function () { cb(JSON.parse(xhr.responseText), xhr.status); };
    xhr.send(body ? JSON.stringify(body) : null);
}

function requireAuth() {
    if (!getToken()) window.location.href = 'login-register.html';
}

function logout() {
    localStorage.clear();
    window.location.href = 'login-register.html';
}

function getInitials(name) {
    return (name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('') || '??';
}

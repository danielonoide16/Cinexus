const API = 'http://localhost:3000/api';

function getToken() {
    return localStorage.getItem('token');
}

function ajax(method, url, body, cb) {
    const xhr = new XMLHttpRequest();

    if (window.AppLoading) {
        window.AppLoading.requestStarted('Loading data...');
    }

    xhr.open(method, API + url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    const token = getToken();
    if (token) xhr.setRequestHeader('Authorization', 'Bearer ' + token);

    xhr.onload = function () {
        let payload = null;

        if (xhr.responseText) {
            try {
                payload = JSON.parse(xhr.responseText);
            } catch (error) {
                payload = { error: 'Invalid JSON response' };
            }
        }

        if (window.AppLoading) {
            window.AppLoading.requestFinished();
        }

        cb(payload, xhr.status);
    };

    xhr.onerror = function () {
        if (window.AppLoading) {
            window.AppLoading.requestFinished();
        }

        cb({ error: 'Network error' }, xhr.status || 0);
    };

    xhr.onabort = function () {
        if (window.AppLoading) {
            window.AppLoading.requestFinished();
        }

        cb({ error: 'Request aborted' }, xhr.status || 0);
    };

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

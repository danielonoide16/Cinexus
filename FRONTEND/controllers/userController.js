function loadProfile() {
    ajax('GET', '/users/me', null, function (data, status) {
        if (status !== 200) { localStorage.clear(); window.location.href = 'login-register.html'; return; }
        localStorage.setItem('user', JSON.stringify(data));
        document.getElementById('profileName').textContent = data.name;
        document.getElementById('profileEmail').textContent = data.email;
        document.getElementById('profileBio').textContent = data.bio || 'No bio yet.';
        document.getElementById('inputName').value = data.name;
        document.getElementById('inputEmail').value = data.email;
        document.getElementById('inputBio').value = data.bio || '';
        renderAvatar(document.getElementById('navAvatar'), data);
        renderAvatar(document.querySelector('#personal-info .avatar'), data);
    });
}

function renderAvatar(el, user) {
    if (user.avatarUrl) {
        el.innerHTML = `<img src="${API.replace('/api','') + user.avatarUrl}" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    } else {
        el.textContent = getInitials(user.name);
    }
}

function saveProfile() {
    const name = document.getElementById('inputName').value.trim();
    const email = document.getElementById('inputEmail').value.trim();
    const bio = document.getElementById('inputBio').value.trim();
    const fileInput = document.getElementById('inputAvatar');
    const file = fileInput.files[0];

    function updateProfile(avatarUrl) {
        const body = { name, email, bio };
        if (avatarUrl !== undefined) body.avatarUrl = avatarUrl;
        ajax('PUT', '/users/me', body, function (data, status) {
            if (status === 200) {
                localStorage.setItem('user', JSON.stringify(data));
                document.getElementById('profileName').textContent = data.name;
                document.getElementById('profileEmail').textContent = data.email;
                document.getElementById('profileBio').textContent = data.bio || 'No bio yet.';
                renderAvatar(document.getElementById('navAvatar'), data);
                renderAvatar(document.querySelector('#personal-info .avatar'), data);
                fileInput.value = '';
                bootstrap.Modal.getInstance(document.getElementById('editProfileModal')).hide();
            } else {
                alert(data.error);
            }
        });
    }

    if (file) {
        const formData = new FormData();
        formData.append('avatar', file);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', API + '/users/me/avatar');
        xhr.setRequestHeader('Authorization', 'Bearer ' + getToken());
        xhr.onload = function () {
            const res = JSON.parse(xhr.responseText);
            if (xhr.status === 200) {
                updateProfile(res.avatarUrl);
            } else {
                alert(res.error || 'Upload failed');
            }
        };
        xhr.send(formData);
    } else {
        updateProfile();
    }
}

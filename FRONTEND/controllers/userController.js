function loadProfile() {
    ajax('GET', '/user', null, function (data, status) {
        if (status !== 200) { localStorage.clear(); window.location.href = 'login-register.html'; return; }
        document.getElementById('navAvatar').textContent = getInitials(data.name);
        document.getElementById('profileName').textContent = data.name;
        document.getElementById('profileEmail').textContent = data.email;
        document.getElementById('profileBio').textContent = data.bio || 'No bio yet.';
        document.querySelector('#personal-info .avatar').textContent = getInitials(data.name);
        document.getElementById('inputName').value = data.name;
        document.getElementById('inputEmail').value = data.email;
        document.getElementById('inputBio').value = data.bio || '';
    });
}

function saveProfile() {
    const name = document.getElementById('inputName').value.trim();
    const email = document.getElementById('inputEmail').value.trim();
    const bio = document.getElementById('inputBio').value.trim();

    ajax('PUT', '/user', { name, email, bio }, function (data, status) {
        if (status === 200) {
            localStorage.setItem('user', JSON.stringify(data));
            document.getElementById('profileName').textContent = data.name;
            document.getElementById('profileEmail').textContent = data.email;
            document.getElementById('profileBio').textContent = data.bio || 'No bio yet.';
            document.getElementById('navAvatar').textContent = getInitials(data.name);
            document.querySelector('#personal-info .avatar').textContent = getInitials(data.name);
            bootstrap.Modal.getInstance(document.getElementById('editProfileModal')).hide();
        } else {
            alert(data.error);
        }
    });
}

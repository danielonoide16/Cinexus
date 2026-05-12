function loadProfile() {
    ajax('GET', '/users/me', null, function (data, status) {
        if (status !== 200) { localStorage.clear(); window.location.href = 'login-register.html'; return; }
        localStorage.setItem('user', JSON.stringify(data));
        document.getElementById('profileName').textContent = data.name;
        document.getElementById('profileEmail').textContent = data.email;
        document.getElementById('profileBio').textContent = data.bio || 'No bio yet.';
        document.getElementById('inputName').value = data.name;
        //document.getElementById('inputEmail').value = data.email;
        document.getElementById('inputBio').value = data.bio || '';
        renderAvatar(document.getElementById('navAvatar'), data);
        renderAvatar(document.querySelector('#personal-info .avatar'), data);
    });
}


function loadPublicProfile(userId) {

    ajax('GET', '/users/public/' + userId, null, function(data, status) {

        if (status !== 200) {
            alert('User not found');
            window.location.href = 'home.html';
            return;
        }

        const user = data.user;

        document.getElementById('profileName').textContent = user.name || '';
        document.getElementById('profileEmail').textContent = user.email || '';
        document.getElementById('profileBio').textContent = user.bio || '';

        // avatar principal
        const avatar = document.querySelector('#personal-info .avatar');

        if (user.avatarUrl) {
            avatar.innerHTML = `
                <img
                    src="${API.replace('/api','') + user.avatarUrl}"
                    alt="avatar"
                    style="width:100%;height:100%;object-fit:cover;border-radius:50%;"
                >
            `;
        } else {
            avatar.textContent = getInitials(user.name);
        }

        // ocultar botón edit
        const editButton = document.querySelector('#personal-info .btn-primary');

        if (editButton) {
            editButton.style.display = 'none';
        }

        // ocultar botón new list
        const newListButton = document.querySelector('[data-bs-target="#newListModal"]');

        if (newListButton) {
            newListButton.style.display = 'none';
        }

        // ocultar botón friends
        const friendsButton = document.getElementById('friendsNavbarButton');

        if (friendsButton) {
            friendsButton.style.display = 'none';
        }

        // cambiar títulos
        document.querySelector('#my-activity h2').textContent =
            `${user.name}'s Activity`;

        document.querySelectorAll('.tabs li')[0].textContent =
            'Reviews';

        document.querySelectorAll('.tabs li')[1].textContent =
            'Lists';


        // mostrar amigos públicos
        const publicFriendsSection = document.getElementById('public-friends-section');
        const publicFriendsContainer = document.getElementById('publicFriendsContainer');

        if (user.friends && user.friends.length > 0) {

            publicFriendsSection.classList.remove('d-none');

            publicFriendsContainer.innerHTML = user.friends.map(friend => `
                <div class="tarjeta-usuario d-flex align-items-center gap-3">

                    ${
                        friend.avatarUrl
                        ?
                        `
                        <div
                            class="avatar is-clickable"
                            style="overflow:hidden;cursor:pointer;"
                            onclick="goToUserProfile('${friend._id}')"
                        >
                            <img
                                src="${API.replace('/api','') + friend.avatarUrl}"
                                style="width:100%;height:100%;object-fit:cover;border-radius:50%;"
                            >
                        </div>
                        `
                        :
                        `
                        <div
                            class="avatar is-clickable"
                            style="cursor:pointer;"
                            onclick="goToUserProfile('${friend._id}')"
                        >
                            ${getInitials(friend.name)}
                        </div>
                        `
                    }

                    <div class="flex-grow-1">
                        <strong
                            class="text-white"
                            style="cursor:pointer;"
                            onclick="goToUserProfile('${friend._id}')"
                        >
                            ${friend.name}
                        </strong>

                        <p class="text-secondary user-bio mb-0">
                            ${friend.bio || ''}
                        </p>
                    </div>
                </div>
            `).join('');

        } else {

            publicFriendsSection.classList.remove('d-none');

            publicFriendsContainer.innerHTML = `
                <p class="text-secondary mb-0">
                    This user has no friends added yet.
                </p>
            `;
        }

        //mostrar avatar del usuario que inició sesión en el navbar
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        renderAvatar(document.getElementById('navAvatar'), loggedInUser);

        // mostrar reviews y listas del perfil público

        renderPublicReviews(data.reviews || []);
        renderPublicLists(data.lists || []);
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
    const password = document.getElementById('inputPassword').value.trim();
    const bio = document.getElementById('inputBio').value.trim();
    const fileInput = document.getElementById('inputAvatar');
    const file = fileInput.files[0];

    function updateProfile(avatarUrl) {
        const body = { name, bio };
        if (password) body.password = password;
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
                document.getElementById('inputPassword').value = '';
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

        if (window.AppLoading) {
            window.AppLoading.requestStarted('Uploading image...');
        }

        xhr.open('POST', API + '/users/me/avatar');
        xhr.setRequestHeader('Authorization', 'Bearer ' + getToken());
        xhr.onload = function () {
            let res = {};

            if (xhr.responseText) {
                try {
                    res = JSON.parse(xhr.responseText);
                } catch (error) {
                    res = { error: 'Invalid upload response' };
                }
            }

            if (window.AppLoading) {
                window.AppLoading.requestFinished();
            }

            if (xhr.status === 200) {
                updateProfile(res.avatarUrl);
            } else {
                alert(res.error || 'Upload failed');
            }
        };
        xhr.onerror = function () {
            if (window.AppLoading) {
                window.AppLoading.requestFinished();
            }

            alert('Upload failed');
        };
        xhr.send(formData);
    } else {
        updateProfile();
    }
}

function deleteAccount() {
    const deleteButton = document.getElementById('confirmDeleteAccountButton');

    if (deleteButton) {
        deleteButton.disabled = true;
        deleteButton.textContent = 'Deleting...';
    }

    ajax('DELETE', '/users/me', null, function (data, status) {
        if (deleteButton) {
            deleteButton.disabled = false;
            deleteButton.textContent = 'Confirm Account Deletion';
        }

        if (status === 200) {
            const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteAccountModal'));
            const editModal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));

            if (deleteModal) deleteModal.hide();
            if (editModal) editModal.hide();

            localStorage.clear();
            window.location.href = 'login-register.html';
        } else {
            alert(data.error || 'Unable to delete account');
        }
    });
}

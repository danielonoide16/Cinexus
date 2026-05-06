let sentRequests = [];
let myFriends = [];

function getUserId(user) {
    return String(user?.id || user?._id || user || '');
}

function loadFriendsData(callback) {
    let pendingRequestsLoaded = false;
    let friendsLoaded = false;

    function finish() {
        if (pendingRequestsLoaded && friendsLoaded && typeof callback === 'function') {
            callback();
        }
    }

    ajax('GET', '/friends/sent', null, function (data) {
        sentRequests = (data || []).map(getUserId);
        pendingRequestsLoaded = true;
        finish();
    });

    ajax('GET', '/friends', null, function (data) {
        myFriends = data || [];
        friendsLoaded = true;
        finish();
    });
}

function buscarUsuarios() {
    const busqueda = document.getElementById('inputBusqueda').value.trim();
    ajax('GET', '/users/search?q=' + encodeURIComponent(busqueda), null, function (results) {
        const contenedor = document.getElementById('resultadosBusqueda');
        const visibles = (results || []).filter(u => {
            const userId = getUserId(u);
            const isFriend = myFriends.some(f => getUserId(f) === userId);
            const isSent = sentRequests.includes(userId);
            return !isFriend && !isSent;
        });

        if (!visibles.length) { contenedor.innerHTML = '<p class="text-secondary">No users found.</p>'; return; }

        contenedor.innerHTML = visibles.map(u => {
            let boton = `<button class="btn btn-sm btn-morado" onclick="enviarSolicitud('${getUserId(u)}')">Add Friend</button>`;
            return tarjetaUsuario(u, boton);
        }).join('');
    });
}

function enviarSolicitud(toId) {
    ajax('POST', '/friends/request', { toId }, function (data, status) {
        if (status === 201) {
            sentRequests.push(getUserId(toId));
            loadFriendsData(buscarUsuarios);
        } else {
            alert(data.error || 'Unable to send friend request');
        }
    });
}

function mostrarSolicitudes() {
    ajax('GET', '/friends/requests', null, function (pending) {
        const contenedor = document.getElementById('listaSolicitudes');
        document.getElementById('contadorSolicitudes').textContent = pending.length || '';
        if (!pending.length) { contenedor.innerHTML = '<p class="text-secondary">No pending requests.</p>'; return; }

        contenedor.innerHTML = pending.map(u => {
            const boton = `
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-morado" onclick="responderSolicitud('${u.id}', 'accept')">Accept</button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="responderSolicitud('${u.id}', 'decline')">Decline</button>
                </div>`;
            return tarjetaUsuario(u, boton);
        }).join('');
    });
}

function responderSolicitud(fromId, action) {
    ajax('PUT', '/friends/request/' + fromId, { action }, function () {
        mostrarSolicitudes();
        loadFriendsData(buscarUsuarios);
    });
}

function mostrarAmigos() {
    ajax('GET', '/friends', null, function (friends) {
        myFriends = friends;
        const contenedor = document.getElementById('listaAmigos');
        if (!friends.length) { contenedor.innerHTML = '<p class="text-secondary">No friends yet.</p>'; return; }
        contenedor.innerHTML = friends.map(u => {
            const boton = `
                <div class="d-flex gap-2">
                    <span class="badge bg-success align-self-center">Friends</span>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarAmigo('${getUserId(u)}')">Remove</button>
                </div>`;
            return tarjetaUsuario(u, boton);
        }).join('');
    });
}

function eliminarAmigo(friendId) {
    ajax('DELETE', '/friends/' + friendId, null, function (data, status) {
        if (status === 200) {
            loadFriendsData(function () {
                mostrarAmigos();
                buscarUsuarios();
            });
        } else {
            alert(data.error || 'Unable to remove friend');
        }
    });
}

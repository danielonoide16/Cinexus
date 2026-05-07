let sentRequests = [];
let receivedRequests = [];
let myFriends = [];
let dataReady = false;

function getUserId(user) {
    return String(user?.id || user?._id || user || '');
}

function loadFriendsData(callback) {
    let pending = 3;

    function done() {
        pending -= 1;
        if (pending === 0) {
            dataReady = true;
            if (typeof callback === 'function') {
                callback();
            }
        }
    }

    ajax('GET', '/friends/sent', null, function (data) {
        sentRequests = (data || []).map(getUserId);
        done();
    });

    ajax('GET', '/friends/received', null, function (data) {
        receivedRequests = (data || []).map(getUserId);
        done();
    });

    ajax('GET', '/friends', null, function (data) {
        myFriends = data || [];
        done();
    });
}

function buscarUsuarios() {
    if (!dataReady) return;

    const busqueda = document.getElementById('inputBusqueda').value.trim();
    ajax('GET', '/users/search?q=' + encodeURIComponent(busqueda), null, function (results) {
        const contenedor = document.getElementById('resultadosBusqueda');
        const usuarios = (results || []).filter(function (u) {
            const userId = getUserId(u);
            const isFriend = myFriends.some(friend => getUserId(friend) === userId);
            const isSent = sentRequests.includes(userId);
            const isReceived = receivedRequests.includes(userId);

            return !isFriend && !isSent && !isReceived;
        });

        if (!usuarios.length) {
            contenedor.innerHTML = '<p class="text-secondary">No users found.</p>';
            return;
        }

        contenedor.innerHTML = usuarios.map(function (u) {
            const userId = getUserId(u);
            const boton = `<button class="btn btn-sm btn-morado" onclick="enviarSolicitud('${userId}')">Add Friend</button>`;

            return tarjetaUsuario(u, boton);
        }).join('');
    });
}

function enviarSolicitud(toId) {
    ajax('POST', '/friends/request', { toId }, function (data, status) {
        if (status === 201) {
            loadFriendsData(buscarUsuarios);
        } else {
            alert(data.error || 'Unable to send friend request');
        }
    });
}

function mostrarSolicitudes() {
    ajax('GET', '/friends/requests', null, function (pending) {
        const contenedor = document.getElementById('listaSolicitudes');
        const solicitudes = pending || [];

        document.getElementById('contadorSolicitudes').textContent = solicitudes.length || '';

        if (!solicitudes.length) {
            contenedor.innerHTML = '<p class="text-secondary">No pending requests.</p>';
            return;
        }

        contenedor.innerHTML = solicitudes.map(function (u) {
            const boton = `
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-morado" onclick="responderSolicitud('${getUserId(u)}', 'accept')">Accept</button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="responderSolicitud('${getUserId(u)}', 'decline')">Decline</button>
                </div>`;

            return tarjetaUsuario(u, boton);
        }).join('');
    });
}

function responderSolicitud(fromId, action) {
    ajax('PUT', '/friends/request/' + fromId, { action }, function (data, status) {
        if (status !== 200) {
            alert(data.error || 'Unable to respond to friend request');
            return;
        }

        loadFriendsData(function () {
            mostrarSolicitudes();
            mostrarAmigos();
            buscarUsuarios();
        });
    });
}

function mostrarAmigos() {
    ajax('GET', '/friends', null, function (friends) {
        myFriends = friends || [];

        const contenedor = document.getElementById('listaAmigos');
        if (!myFriends.length) {
            contenedor.innerHTML = '<p class="text-secondary">No friends yet.</p>';
            return;
        }

        contenedor.innerHTML = myFriends.map(function (u) {
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

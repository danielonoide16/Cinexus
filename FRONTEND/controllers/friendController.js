let sentRequests = [];
let receivedRequests = [];
let myFriends = [];
let dataReady = false;

function getUserId(user) {
    return String(user?.id || user?._id || user || '');
}

function loadFriendsData(cbcallback) {
    let pending = 3;
    function done() { if (--pending === 0) { dataReady = true; if (cb) cb(); } }
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
    done(); });
    ajax('GET', '/friends/received', null, function (data) { receivedRequests = data; done(); });

    ajax('GET', '/friends', null, function (data) {
        myFriends = data || [];
        friendsLoaded = true;
        finish();
    done(); });
}

function buscarUsuarios() {
    if (!dataReady) return;
    const busqueda = document.getElementById('inputBusqueda').value.trim();
    ajax('GET', '/users/search?q=' + encodeURIComponent(busqueda), null, function (results) {
        const contenedor = document.getElementById('resultadosBusqueda');
        if (!results.length) { contenedor.innerHTML = '<p class="text-secondary">No users found.</p>'; return; }

        contenedor.innerHTML = results.map(u => {
            const isFriend = myFriends.some(f => f.id === u.id);
            const isSent = sentRequests.includes(u.id);
            const isReceived = receivedRequests.includes(u.id);
            let boton;
            if (isFriend) {
                boton = `<span class="badge bg-success">Friends</span>`;
            } else if (isReceived) {
                boton = `<div class="d-flex gap-2">
                    <button class="btn btn-sm btn-morado" onclick="responderSolicitud('${u.id}', 'accept')">Accept</button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="responderSolicitud('${u.id}', 'decline')">Decline</button>
                </div>`;
            } else if (isSent) {
                boton = `<button class="btn btn-sm btn-secondary" disabled>Request sent</button>`;
            } else {
                boton = `<button class="btn btn-sm btn-morado" onclick="enviarSolicitud('${u.id}')">Add Friend</button>`;
            }
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
        receivedRequests = receivedRequests.filter(id => id !== fromId);
        if (action === 'accept') {
            ajax('GET', '/friends', null, function (data) {
                myFriends = data;
                mostrarSolicitudes();
                buscarUsuarios();
            });
        } else {
            mostrarSolicitudes();
            buscarUsuarios();
        }
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

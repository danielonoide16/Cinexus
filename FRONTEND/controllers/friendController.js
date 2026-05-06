let sentRequests = [];
let myFriends = [];

function loadFriendsData() {
    ajax('GET', '/friends/sent', null, function (data) { sentRequests = data; });
    ajax('GET', '/friends', null, function (data) { myFriends = data; });
}

function buscarUsuarios() {
    const busqueda = document.getElementById('inputBusqueda').value.trim();
    ajax('GET', '/users/search?q=' + encodeURIComponent(busqueda), null, function (results) {
        const contenedor = document.getElementById('resultadosBusqueda');
        if (!results.length) { contenedor.innerHTML = '<p class="text-secondary">No users found.</p>'; return; }

        contenedor.innerHTML = results.map(u => {
            const isFriend = myFriends.some(f => f.id === u.id);
            const isSent = sentRequests.includes(u.id);
            let boton = isFriend
                ? `<span class="badge bg-success">Friends</span>`
                : isSent
                    ? `<button class="btn btn-sm btn-secondary" disabled>Request sent</button>`
                    : `<button class="btn btn-sm btn-morado" onclick="enviarSolicitud('${u.id}')">Add Friend</button>`;
            return tarjetaUsuario(u, boton);
        }).join('');
    });
}

function enviarSolicitud(toId) {
    ajax('POST', '/friends/request', { toId }, function (data, status) {
        if (status === 201) {
            sentRequests.push(toId);
            buscarUsuarios();
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
        ajax('GET', '/friends', null, function (data) { myFriends = data; });
    });
}

function mostrarAmigos() {
    ajax('GET', '/friends', null, function (friends) {
        myFriends = friends;
        const contenedor = document.getElementById('listaAmigos');
        if (!friends.length) { contenedor.innerHTML = '<p class="text-secondary">No friends yet.</p>'; return; }
        contenedor.innerHTML = friends.map(u => tarjetaUsuario(u, `<span class="badge bg-success">Friends</span>`)).join('');
    });
}

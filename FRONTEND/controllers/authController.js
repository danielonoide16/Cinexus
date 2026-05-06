function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    ajax('POST', '/login', { email, password }, function (data, status) {
        if (status === 200) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'home.html';
        } else {
            alert(data.error);
        }
    });
}

function register() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;

    if (password !== confirm) { alert('Passwords do not match'); return; }

    ajax('POST', '/register', { name, email, password }, function (data, status) {
        if (status === 200) {
            alert('User registered successfully');
            toggleForms();
        } else {
            alert(data.error);
        }
    });
}

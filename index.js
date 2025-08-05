document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('loginSection');
    const registerSection = document.getElementById('registerSection');
    const adminSection = document.getElementById('adminSection');

    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    const loginMessage = document.getElementById('loginMessage');
    const registerMessage = document.getElementById('registerMessage');
    const adminMessage = document.getElementById('adminMessage');

    const tbody = document.getElementById('userTableBody');
    const selectAllCheckbox = document.getElementById('selectAll');
    const blockBtn = document.getElementById('blockUsers');
    const unblockBtn = document.getElementById('unblockUsers');
    const deleteBtn = document.getElementById('deleteUsers');
    const logoutBtn = document.getElementById('logoutBtn');

    let users = [];

    // Show Register Form
    showRegisterLink.addEventListener('click', () => {
        loginSection.classList.add('d-none');
        registerSection.classList.remove('d-none');
    });

    // Show Login Form
    showLoginLink.addEventListener('click', () => {
        registerSection.classList.add('d-none');
        loginSection.classList.remove('d-none');
    });

    // LOGIN
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginMessage.textContent = 'Logging in...';
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('https://task4-gous.onrender.com/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                loginMessage.textContent = 'Login successful.';
                showAdminPanel();
            } else {
                loginMessage.textContent = data.message || 'Login failed.';
            }
        } catch (error) {
            loginMessage.textContent = 'Server error.';
        }
    });

    // REGISTER
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        registerMessage.textContent = 'Registering...';
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const response = await fetch('https://task4-gous.onrender.com/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                registerMessage.textContent = 'Registration successful. Please log in.';
                setTimeout(() => {
                    registerSection.classList.add('d-none');
                    loginSection.classList.remove('d-none');
                }, 1000);
            } else {
                registerMessage.textContent = data.message || 'Registration failed.';
            }
        } catch (error) {
            registerMessage.textContent = 'Server error.';
        }
    });

    function showAdminPanel() {
        loginSection.classList.add('d-none');
        registerSection.classList.add('d-none');
        adminSection.classList.remove('d-none');
        loadUsers();
    }

    // Logout
    logoutBtn.addEventListener('click', () => {
        adminSection.classList.add('d-none');
        loginSection.classList.remove('d-none');
        loginForm.reset();
        registerForm.reset();
        document.getElementById('filterInput').value = '';
    });

    // Load users
    async function loadUsers() {
        try {
            const response = await fetch('https://task4-gous.onrender.com/api/users');
            const data = await response.json();

            if (response.ok) {
                users = data;
                renderUsers();
            } else {
                adminMessage.textContent = data.message || 'Failed to load users.';
            }
        } catch (err) {
            adminMessage.textContent = 'Server error.';
        }
    }

    // Render table
    function renderUsers(filteredUsers = users) {
        tbody.innerHTML = '';
        filteredUsers.forEach(user => {
            tbody.innerHTML += `
                <tr>
                    <td><input type="checkbox" class="userCheckbox" value="${user.id}"></td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>
                        ${user.last_login ? formatTime(user.last_login) : 'N/A'}
                        ${user.last_login ? `<div class="activity-bar ms-2"></div>` : ''}
                    </td>
                    <td>${user.is_blocked ? 'Blocked' : 'Active'}</td>
                </tr>
            `;
        });
    }

    // Format timestamp
    function formatTime(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleString();
    }

    // Filtro de usuarios
    document.getElementById('filterInput').addEventListener('input', (e) => {
        const search = e.target.value.toLowerCase();
        const filtered = users.filter(user =>
            user.name.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search)
        );
        renderUsers(filtered);
    });

    // Select all
    selectAllCheckbox.addEventListener('change', () => {
        document.querySelectorAll('.userCheckbox').forEach(cb => cb.checked = selectAllCheckbox.checked);
    });

    function getSelectedUserIds() {
        return [...document.querySelectorAll('.userCheckbox:checked')].map(cb => cb.value);
    }

    async function performAction(action) {
        const selectedIds = getSelectedUserIds();
        if (selectedIds.length === 0) {
            adminMessage.textContent = 'Please select users first.';
            return;
        }

        try {
            const response = await fetch(`https://task4-gous.onrender.com/api/users/${action}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIds: selectedIds })
            });

            const data = await response.json();

            if (response.ok) {
                adminMessage.textContent = `Users ${action}ed successfully.`;
                loadUsers();
            } else {
                adminMessage.textContent = data.message || `Failed to ${action} users.`;
            }
        } catch (err) {
            adminMessage.textContent = `Error while trying to ${action} users.`;
        }
    }

    // Actions
    blockBtn.addEventListener('click', () => performAction('block'));
    unblockBtn.addEventListener('click', () => performAction('unblock'));

    deleteBtn.addEventListener('click', async () => {
        const selectedIds = getSelectedUserIds();
        if (selectedIds.length === 0) {
            adminMessage.textContent = 'Please select users first.';
            return;
        }

        try {
            const response = await fetch(`https://task4-gous.onrender.com/api/users/delete`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIds: selectedIds })
            });

            const data = await response.json();

            if (response.ok) {
                adminMessage.textContent = 'Users deleted successfully.';
                loadUsers();
            } else {
                adminMessage.textContent = data.message || 'Failed to delete users.';
            }
        } catch (err) {
            adminMessage.textContent = 'Error deleting users.';
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.querySelector('#userTable tbody');
    const selectAllCheckbox = document.getElementById('selectAll');
    const blockBtn = document.getElementById('blockBtn');
    const unblockBtn = document.getElementById('unblockBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const statusMessage = document.getElementById('statusMessage');

    let users = [];

    async function loadUsers() {
        try {
            const response = await fetch('https://task4-gous.onrender.com/api/users');
            const data = await response.json();

            if (response.ok) {
                users = data;
                renderUsers();
            } else {
                statusMessage.textContent = data.message || 'Failed to load users.';
            }
        } catch (err) {
            console.error(err);
            statusMessage.textContent = 'Error connecting to server.';
        }
    }

    function renderUsers() {
        tbody.innerHTML = '';

        users.forEach(user => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td><input type="checkbox" class="userCheckbox" value="${user.id}"></td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.last_login || 'N/A'}</td>
                <td>${user.is_blocked ? 'Blocked' : 'Active'}</td>
            `;

            tbody.appendChild(tr);
        });
    }

    // Select all checkboxes
    selectAllCheckbox.addEventListener('change', () => {
        const checkboxes = document.querySelectorAll('.userCheckbox');
        checkboxes.forEach(checkbox => checkbox.checked = selectAllCheckbox.checked);
    });

    function getSelectedUserIds() {
        return [...document.querySelectorAll('.userCheckbox:checked')]
            .map(checkbox => checkbox.value);
    }

    // Perform block/unblock
    async function performAction(action) {
        const selectedIds = getSelectedUserIds();

        if (selectedIds.length === 0) {
            statusMessage.textContent = 'Please select at least one user.';
            return;
        }

        try {
            const response = await fetch(`https://task4-gous.onrender.com/api/users/${action}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds })  // ✅ FIXED
            });

            const data = await response.json();

            if (response.ok) {
                statusMessage.textContent = `Users ${action}ed successfully.`;
                await loadUsers(); // reload
            } else {
                statusMessage.textContent = data.message || `Failed to ${action} users.`;
            }
        } catch (err) {
            console.error(err);
            statusMessage.textContent = `Error trying to ${action} users.`;
        }
    }

    blockBtn.addEventListener('click', () => performAction('block'));
    unblockBtn.addEventListener('click', () => performAction('unblock'));

    // Delete action
    deleteBtn.addEventListener('click', async () => {
        const selectedIds = getSelectedUserIds();

        if (selectedIds.length === 0) {
            statusMessage.textContent = 'Please select at least one user.';
            return;
        }

        try {
            const response = await fetch('https://task4-gous.onrender.com/api/users/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds })  // ✅ FIXED
            });

            const data = await response.json();

            if (response.ok) {
                statusMessage.textContent = 'Users deleted successfully.';
                await loadUsers(); // reload
            } else {
                statusMessage.textContent = data.message || 'Failed to delete users.';
            }
        } catch (err) {
            console.error(err);
            statusMessage.textContent = 'Error trying to delete users.';
        }
    });

    loadUsers(); // Load when page is ready
});

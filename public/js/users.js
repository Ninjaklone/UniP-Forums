class UserManager {
    constructor() {
        this.bindEvents();
    }

    bindEvents() {
        // Bind event listeners for the user management page
        document.addEventListener('click', (e) => {
            const target = e.target;

            // Check if we're on the user management page
            if (!document.querySelector('.user-management')) return;

            // Handle different button clicks
            if (target.closest('[onclick*="editUser"]')) {
                e.preventDefault();
                const userId = target.closest('[data-user-id]').dataset.userId;
                this.editUser(userId);
            } else if (target.closest('[onclick*="toggleUserStatus"]')) {
                e.preventDefault();
                const userEl = target.closest('[data-user-id]');
                const userId = userEl.dataset.userId;
                const isActive = userEl.dataset.active === 'true';
                this.toggleUserStatus(userId, isActive);
            } else if (target.closest('[onclick*="deleteUser"]')) {
                e.preventDefault();
                const userId = target.closest('[data-user-id]').dataset.userId;
                this.deleteUser(userId);
            }
        });

        // Bind form submit events
        const inviteForm = document.getElementById('inviteUserForm');
        if (inviteForm) {
            inviteForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendInvite();
            });
        }

        const exportForm = document.getElementById('exportUsersForm');
        if (exportForm) {
            exportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.exportUsers();
            });
        }
    }

    async editUser(userId) {
        // Implement user editing functionality
        console.log('Edit user:', userId);
    }

    async toggleUserStatus(userId, currentStatus) {
        if (confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
            try {
                const response = await fetch(`/admin/users/${userId}/toggle-status`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to update user status');
                }

                location.reload();
            } catch (error) {
                alert(error.message);
            }
        }
    }

    async deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                const response = await fetch(`/admin/users/${userId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to delete user');
                }

                location.reload();
            } catch (error) {
                alert(error.message);
            }
        }
    }

    async sendInvite() {
        const email = document.getElementById('inviteEmail').value;
        const role = document.getElementById('inviteRole').value;

        try {
            const response = await fetch('/admin/users/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, role })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to send invitation');
            }

            alert('Invitation sent successfully');
            location.reload();
        } catch (error) {
            alert(error.message);
        }
    }

    async exportUsers() {
        const format = document.querySelector('input[name="exportFormat"]:checked').value;
        const options = {
            basic: document.getElementById('exportBasic').checked,
            activity: document.getElementById('exportActivity').checked,
            stats: document.getElementById('exportStats').checked
        };

        try {
            const response = await fetch('/admin/users/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ format, options })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to export users');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `users_export.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert(error.message);
        }
    }
}

// Initialize the user manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UserManager();
});
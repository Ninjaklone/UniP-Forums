class ThreadManager {
    constructor() {
        console.log('ThreadManager initialized');
        this.bindEvents();
    }

    bindEvents() {
        console.log('Binding events');
        // Use event delegation for post management
        document.addEventListener('click', (e) => {
            console.log('Click event:', e.target.className);
            if (e.target.matches('.edit-post-btn')) {
                console.log('Edit button clicked');
                this.handleEditClick(e);
            } else if (e.target.matches('.delete-post-btn')) {
                console.log('Delete button clicked');
                this.handleDeleteClick(e);
            } else if (e.target.matches('.cancel-edit-btn')) {
                console.log('Cancel button clicked');
                this.handleCancelEdit(e);
            }
        });

        // Handle form submissions through event delegation
        document.addEventListener('submit', (e) => {
            if (e.target.matches('.edit-post-form')) {
                e.preventDefault();
                this.handleSaveEdit(e);
            }
        });

        // Admin thread management
        const toggleStickyBtn = document.getElementById('toggleStickyBtn');
        const toggleClosedBtn = document.getElementById('toggleClosedBtn');
        const deleteThreadBtn = document.getElementById('deleteThreadBtn');

        if (toggleStickyBtn) {
            toggleStickyBtn.addEventListener('click', () => this.handleToggleSticky());
        }
        if (toggleClosedBtn) {
            toggleClosedBtn.addEventListener('click', () => this.handleToggleClosed());
        }
        if (deleteThreadBtn) {
            deleteThreadBtn.addEventListener('click', () => this.handleDeleteThread());
        }
    }

    handleEditClick(e) {
        const postId = e.target.dataset.postId;
        const postDiv = document.querySelector(`#post-${postId} .post-content`);
        const content = postDiv.textContent.trim();
        
        postDiv.innerHTML = `
            <form class="edit-post-form" data-post-id="${postId}">
                <textarea class="form-control mb-2" rows="4" required>${content}</textarea>
                <div class="text-end">
                    <button type="button" class="btn btn-sm btn-secondary cancel-edit-btn" 
                            data-post-id="${postId}" 
                            data-content="${encodeURIComponent(content)}">
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-sm btn-primary ms-2">
                        Save Changes
                    </button>
                </div>
            </form>
        `;
    }

    handleCancelEdit(e) {
        const postId = e.target.dataset.postId;
        const content = decodeURIComponent(e.target.dataset.content);
        const postDiv = document.querySelector(`#post-${postId} .post-content`);
        postDiv.textContent = content;
    }

    async handleSaveEdit(e) {
        const form = e.target;
        const postId = form.dataset.postId;
        const submitButton = form.querySelector('button[type="submit"]');
        const content = form.querySelector('textarea').value;

        submitButton.disabled = true;
        submitButton.textContent = 'Saving...';

        try {
            const response = await fetch(`/posts/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to save changes');
            }

            location.reload();
        } catch (error) {
            alert(error.message);
            submitButton.disabled = false;
            submitButton.textContent = 'Save Changes';
        }
    }

    async handleDeleteClick(e) {
        const postId = e.target.dataset.postId;
        if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete post');
            }

            location.reload();
        } catch (error) {
            alert(error.message);
        }
    }

    async handleToggleSticky() {
        const threadId = document.querySelector('[data-thread-id]').dataset.threadId;
        if (!confirm('Are you sure you want to toggle sticky status for this thread?')) {
            return;
        }

        try {
            const response = await fetch(`/threads/${threadId}/sticky`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error('Failed to toggle sticky status');
            location.reload();
        } catch (error) {
            alert(error.message);   
        }
    }

    async handleToggleClosed() {
        const threadId = document.querySelector('[data-thread-id]').dataset.threadId;
        if (!confirm('Are you sure you want to toggle closed status for this thread?')) {
            return;
        }

        try {
            const response = await fetch(`/threads/${threadId}/close`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error('Failed to toggle closed status');
            location.reload();
        } catch (error) {
            alert(error.message);
        }
    }

    async handleDeleteThread() {
        const threadId = document.querySelector('[data-thread-id]').dataset.threadId;
        const forumId = document.querySelector('[data-forum-id]').dataset.forumId;
        
        if (!confirm('Are you sure you want to delete this thread? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/threads/${threadId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error('Failed to delete thread');
            window.location.href = `/forums/${forumId}`;
        } catch (error) {
            alert(error.message);
        }
    }
}

// Initialize the thread manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing ThreadManager');
    new ThreadManager();
}); 
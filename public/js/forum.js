

document.addEventListener('DOMContentLoaded', () => {
    const deleteForumBtn = document.getElementById('deleteForumBtn');
    if (deleteForumBtn) {
        deleteForumBtn.addEventListener('click', async () => {
            if (!confirm('Are you sure you want to delete this forum? This will delete all threads and posts within it. This action cannot be undone.')) {
                return;
            }

            try {
                const forumId = document.querySelector('[data-forum-id]').dataset.forumId;
                const response = await fetch(`/forums/${forumId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to delete forum');
                }

                window.location.href = '/forums';
            } catch (error) {
                alert(error.message);
            }
        });
    }
});

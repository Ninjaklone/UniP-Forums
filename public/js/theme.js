class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        // Apply saved theme
        this.applyTheme(this.theme);
        
        // Bind event listeners
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Update button icon
        this.updateButtonIcon();
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.theme = theme;
        this.updateButtonIcon();
    }

    toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    updateButtonIcon() {
        const button = document.getElementById('themeToggle');
        if (button) {
            const icon = button.querySelector('i');
            if (this.theme === 'dark') {
                icon.classList.remove('bi-moon');
                icon.classList.add('bi-sun');
                button.setAttribute('title', 'Switch to light mode');
            } else {
                icon.classList.remove('bi-sun');
                icon.classList.add('bi-moon');
                button.setAttribute('title', 'Switch to dark mode');
            }
        }
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
}); 
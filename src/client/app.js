class WebsiteChecker {
    constructor() {
        this.form = document.getElementById('checkForm');
        this.urlInput = document.getElementById('urlInput');
        this.loader = document.getElementById('loader');
        this.result = document.getElementById('result');
        this.statusBadge = document.getElementById('statusBadge');
        this.details = document.getElementById('details');
        this.history = document.getElementById('history');
        this.historyList = document.getElementById('historyList');
        this.darkModeToggle = document.getElementById('darkModeToggle');
        
        this.initializeEventListeners();
        this.loadHistory();
        this.initializeDarkMode();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
    }

    initializeDarkMode() {
        // Check if user previously enabled dark mode
        if (localStorage.getItem('darkMode') === 'true') {
            document.documentElement.classList.add('dark');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // If no preference is stored but system prefers dark mode
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        }
    }

    toggleDarkMode() {
        const html = document.documentElement;
        html.classList.toggle('dark');
        localStorage.setItem('darkMode', html.classList.contains('dark'));
    }

    async handleSubmit(e) {
        e.preventDefault();
        const url = this.urlInput.value;

        this.showLoader();
        try {
            const result = await this.checkWebsite(url);
            this.displayResult(result);
            this.saveToHistory(result);
        } catch (error) {
            this.displayError(error);
        }
        this.hideLoader();
    }

    async checkWebsite(url) {
        // Replace this line in the checkWebsite method:
        const response = await fetch('/api/check', {  // Remove 'http://localhost:3000'
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    }

    displayResult(result) {
        this.result.classList.remove('hidden');
        
        const statusEmoji = result.status === 'UP' ? '✅' : '🔴';
        this.statusBadge.innerHTML = `${statusEmoji} Website is ${result.status}`;
        this.statusBadge.className = result.status === 'UP' ? 'status-up' : 'status-down';

        this.details.innerHTML = `
            <p>URL: ${result.url}</p>
            <p>Status Code: ${result.statusCode}</p>
            <p>Response Time: ${result.responseTime}ms</p>
            <p>Timestamp: ${new Date(result.timestamp).toLocaleString()}</p>
        `;
    }

    displayError(error) {
        this.result.classList.remove('hidden');
        this.statusBadge.innerHTML = '⚠️ Error';
        this.statusBadge.className = 'text-yellow-500';
        this.details.innerHTML = `<p>Error: ${error.message}</p>`;
    }

    saveToHistory(result) {
        const history = this.getHistory();
        history.unshift(result);
        localStorage.setItem('checkHistory', JSON.stringify(history.slice(0, 10)));
        this.displayHistory();
    }

    getHistory() {
        try {
            return JSON.parse(localStorage.getItem('checkHistory')) || [];
        } catch {
            return [];
        }
    }

    loadHistory() {
        const history = this.getHistory();
        if (history.length > 0) {
            this.history.classList.remove('hidden');
            this.displayHistory();
        }
    }

    displayHistory() {
        const history = this.getHistory();
        this.history.classList.remove('hidden');
        
        this.historyList.innerHTML = history.map(item => `
            <div class="history-item p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="flex items-center justify-between">
                    <span class="${item.status === 'UP' ? 'status-up' : 'status-down'}">
                        ${item.status === 'UP' ? '✅' : '🔴'} ${item.url}
                    </span>
                    <span class="text-sm text-gray-500 dark:text-gray-400">
                        ${new Date(item.timestamp).toLocaleString()}
                    </span>
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-300">
                    Status Code: ${item.statusCode} | Response Time: ${item.responseTime}ms
                </div>
            </div>
        `).join('');
    }

    showLoader() {
        this.loader.classList.remove('hidden');
        this.result.classList.add('hidden');
    }

    hideLoader() {
        this.loader.classList.add('hidden');
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new WebsiteChecker();
});
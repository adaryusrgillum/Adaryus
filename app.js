// Adaryus AI News Aggregator
// Main application logic

class AINewsAggregator {
    constructor() {
        this.newsData = [];
        this.modelsData = [];
        this.init();
    }

    init() {
        this.setupTabs();
        this.setupEventListeners();
        this.loadInitialData();
    }

    // Tab Management
    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Update buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    // Event Listeners
    setupEventListeners() {
        document.getElementById('refresh-news').addEventListener('click', () => {
            this.loadNews();
        });

        document.getElementById('refresh-models').addEventListener('click', () => {
            this.loadModels();
        });

        document.getElementById('chat-send').addEventListener('click', () => {
            this.sendChatMessage();
        });

        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
    }

    // Load Initial Data
    loadInitialData() {
        this.loadNews();
        this.loadModels();
    }

    // News API Integration
    async loadNews() {
        const newsContainer = document.getElementById('news-container');
        const loadingElement = document.getElementById('news-loading');
        const refreshBtn = document.getElementById('refresh-news');

        newsContainer.innerHTML = '';
        loadingElement.style.display = 'block';
        refreshBtn.disabled = true;

        try {
            // Using a CORS proxy for demonstration - in production, use server-side API calls
            // Option 1: Try RSS feeds first (free, no API key needed)
            await this.loadRSSFeeds();
            
            // Option 2: Fallback to mock data if RSS fails
            if (this.newsData.length === 0) {
                this.loadMockNews();
            }

            this.displayNews();
        } catch (error) {
            console.error('Error loading news:', error);
            newsContainer.innerHTML = `
                <div class="error-message">
                    Unable to fetch live news. Showing sample data. 
                    To enable live data, add API keys or configure CORS proxy.
                </div>
            `;
            this.loadMockNews();
            this.displayNews();
        } finally {
            loadingElement.style.display = 'none';
            refreshBtn.disabled = false;
        }
    }

    async loadRSSFeeds() {
        // Simulate RSS feed aggregation
        // In production, use rss-parser library or server-side RSS parsing
        const rssSources = [
            { name: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml' },
            { name: 'Anthropic', url: 'https://www.anthropic.com/news/rss.xml' },
            { name: 'arXiv AI', url: 'https://arxiv.org/rss/cs.AI' }
        ];

        // For now, use mock data
        // In production, implement actual RSS parsing
        this.loadMockNews();
    }

    loadMockNews() {
        const now = Date.now();
        this.newsData = [
            {
                title: 'GPT-5 Development Announced',
                description: 'OpenAI hints at next-generation language model with improved reasoning capabilities and reduced hallucinations.',
                source: 'OpenAI Blog',
                url: 'https://openai.com/blog',
                date: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
                category: 'Model Release'
            },
            {
                title: 'Claude 3.5 Sonnet Reaches New Benchmarks',
                description: 'Anthropic\'s latest model shows significant improvements in coding tasks and maintains strong safety standards.',
                source: 'Anthropic',
                url: 'https://www.anthropic.com',
                date: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
                category: 'Research'
            },
            {
                title: 'Breakthrough in Diffusion Models for Video Generation',
                description: 'New research from MIT demonstrates improved temporal consistency in AI-generated videos using novel diffusion techniques.',
                source: 'arXiv',
                url: 'https://arxiv.org',
                date: new Date(now - 8 * 60 * 60 * 1000).toISOString(),
                category: 'Research'
            },
            {
                title: 'Open Source LLM Reaches 70B Parameters',
                description: 'Meta releases Llama 3.1 with expanded context window and improved multilingual capabilities.',
                source: 'Hugging Face',
                url: 'https://huggingface.co',
                date: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
                category: 'Model Release'
            },
            {
                title: 'Google DeepMind Announces AlphaFold 3',
                description: 'Enhanced protein structure prediction with new capabilities for drug discovery and molecular biology.',
                source: 'TechCrunch',
                url: 'https://techcrunch.com',
                date: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
                category: 'Breakthrough'
            },
            {
                title: 'AI Safety Summit Addresses Alignment Challenges',
                description: 'Leading AI researchers gather to discuss frameworks for ensuring safe and beneficial AI development.',
                source: 'r/MachineLearning',
                url: 'https://reddit.com/r/MachineLearning',
                date: new Date(now - 36 * 60 * 60 * 1000).toISOString(),
                category: 'Industry News'
            }
        ];
    }

    displayNews() {
        const newsContainer = document.getElementById('news-container');
        
        if (this.newsData.length === 0) {
            newsContainer.innerHTML = `
                <div class="empty-state">
                    <p>No news available at the moment. Please try again later.</p>
                </div>
            `;
            return;
        }

        newsContainer.innerHTML = this.newsData.map(news => `
            <div class="news-card">
                <span class="source">${this.escapeHtml(news.source)}</span>
                <h3>${this.escapeHtml(news.title)}</h3>
                <p class="date">${this.formatDate(news.date)}</p>
                <p class="description">${this.escapeHtml(news.description)}</p>
                <a href="${this.escapeHtml(news.url)}" target="_blank" rel="noopener noreferrer">Read more →</a>
            </div>
        `).join('');
    }

    // Hugging Face Models Integration
    async loadModels() {
        const modelsContainer = document.getElementById('models-container');
        const loadingElement = document.getElementById('models-loading');
        const refreshBtn = document.getElementById('refresh-models');

        modelsContainer.innerHTML = '';
        loadingElement.style.display = 'block';
        refreshBtn.disabled = true;

        try {
            // Try to fetch from Hugging Face API
            const response = await fetch('https://huggingface.co/api/models?sort=lastModified&direction=-1&limit=12');
            
            if (response.ok) {
                const models = await response.json();
                this.modelsData = models.map(model => ({
                    id: model.id,
                    author: model.author || model.id.split('/')[0],
                    name: model.id.split('/').pop(),
                    downloads: model.downloads || 0,
                    likes: model.likes || 0,
                    tags: model.tags || [],
                    url: `https://huggingface.co/${model.id}`
                }));
            } else {
                throw new Error('Failed to fetch from Hugging Face');
            }
        } catch (error) {
            console.error('Error loading models:', error);
            // Use mock data as fallback
            this.loadMockModels();
        } finally {
            this.displayModels();
            loadingElement.style.display = 'none';
            refreshBtn.disabled = false;
        }
    }

    loadMockModels() {
        this.modelsData = [
            {
                id: 'meta-llama/Llama-3.1-70B',
                author: 'meta-llama',
                name: 'Llama-3.1-70B',
                downloads: 2500000,
                likes: 15230,
                tags: ['text-generation', 'transformers', 'llama'],
                url: 'https://huggingface.co/meta-llama/Llama-3.1-70B'
            },
            {
                id: 'mistralai/Mixtral-8x7B-v0.1',
                author: 'mistralai',
                name: 'Mixtral-8x7B-v0.1',
                downloads: 1800000,
                likes: 12450,
                tags: ['text-generation', 'mixture-of-experts'],
                url: 'https://huggingface.co/mistralai/Mixtral-8x7B-v0.1'
            },
            {
                id: 'stabilityai/stable-diffusion-xl-base-1.0',
                author: 'stabilityai',
                name: 'stable-diffusion-xl-base-1.0',
                downloads: 3200000,
                likes: 18900,
                tags: ['text-to-image', 'diffusion', 'sdxl'],
                url: 'https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0'
            },
            {
                id: 'openai/whisper-large-v3',
                author: 'openai',
                name: 'whisper-large-v3',
                downloads: 1500000,
                likes: 9870,
                tags: ['speech-recognition', 'audio'],
                url: 'https://huggingface.co/openai/whisper-large-v3'
            },
            {
                id: 'google/gemma-7b',
                author: 'google',
                name: 'gemma-7b',
                downloads: 890000,
                likes: 7650,
                tags: ['text-generation', 'google', 'gemma'],
                url: 'https://huggingface.co/google/gemma-7b'
            },
            {
                id: 'microsoft/phi-2',
                author: 'microsoft',
                name: 'phi-2',
                downloads: 650000,
                likes: 5430,
                tags: ['text-generation', 'small-model'],
                url: 'https://huggingface.co/microsoft/phi-2'
            }
        ];
    }

    displayModels() {
        const modelsContainer = document.getElementById('models-container');
        
        if (this.modelsData.length === 0) {
            modelsContainer.innerHTML = `
                <div class="empty-state">
                    <p>No models available at the moment. Please try again later.</p>
                </div>
            `;
            return;
        }

        modelsContainer.innerHTML = this.modelsData.map(model => `
            <div class="model-card">
                <h3>${this.escapeHtml(model.name)}</h3>
                <p class="author">by ${this.escapeHtml(model.author)}</p>
                <div class="stats">
                    <span>⬇️ ${this.formatNumber(model.downloads)}</span>
                    <span>❤️ ${this.formatNumber(model.likes)}</span>
                </div>
                <div class="tags">
                    ${model.tags.slice(0, 3).map(tag => 
                        `<span class="tag">${this.escapeHtml(tag)}</span>`
                    ).join('')}
                </div>
                <a href="${this.escapeHtml(model.url)}" target="_blank" rel="noopener noreferrer">View on Hugging Face →</a>
            </div>
        `).join('');
    }

    // Chat Interface
    sendChatMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;

        this.addChatMessage('user', message);
        input.value = '';

        // Disable input while processing
        input.disabled = true;
        document.getElementById('chat-send').disabled = true;

        // Simulate AI response
        setTimeout(() => {
            this.processUserQuery(message);
            input.disabled = false;
            document.getElementById('chat-send').disabled = false;
            input.focus();
        }, 1000);
    }

    addChatMessage(type, content) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        if (type === 'user') {
            // User input is always escaped to prevent XSS
            messageDiv.innerHTML = `<strong>You:</strong> ${this.escapeHtml(content)}`;
        } else {
            // Bot responses are generated by our code and include intentional HTML formatting
            // Any user content included in bot responses is escaped in the response generation functions
            messageDiv.innerHTML = `<strong>AI Assistant:</strong> ${content}`;
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    processUserQuery(query) {
        const lowerQuery = query.toLowerCase();
        
        // Simple keyword-based responses
        if (lowerQuery.includes('latest') || lowerQuery.includes('recent') || lowerQuery.includes('news')) {
            if (lowerQuery.includes('model')) {
                this.respondWithModels();
            } else {
                this.respondWithNews();
            }
        } else if (lowerQuery.includes('hugging face') || lowerQuery.includes('models')) {
            this.respondWithModels();
        } else if (lowerQuery.includes('openai') || lowerQuery.includes('gpt')) {
            this.respondAboutOpenAI();
        } else if (lowerQuery.includes('anthropic') || lowerQuery.includes('claude')) {
            this.respondAboutAnthropic();
        } else if (lowerQuery.includes('help') || lowerQuery.includes('what can you')) {
            this.respondWithHelp();
        } else {
            this.respondWithGeneral(query);
        }
    }

    respondWithNews() {
        if (this.newsData.length === 0) {
            this.addChatMessage('bot', 'I don\'t have any news loaded yet. Please check the "Latest News" tab.');
            return;
        }

        const topNews = this.newsData.slice(0, 3);
        let response = 'Here are the latest AI news headlines:<ul>';
        topNews.forEach(news => {
            response += `<li><strong>${this.escapeHtml(news.title)}</strong> - ${this.escapeHtml(news.source)}</li>`;
        });
        response += '</ul>Switch to the "Latest News" tab to see more details!';
        this.addChatMessage('bot', response);
    }

    respondWithModels() {
        if (this.modelsData.length === 0) {
            this.addChatMessage('bot', 'I don\'t have any models loaded yet. Please check the "Model Releases" tab.');
            return;
        }

        const topModels = this.modelsData.slice(0, 3);
        let response = 'Here are some recently updated models on Hugging Face:<ul>';
        topModels.forEach(model => {
            response += `<li><strong>${this.escapeHtml(model.name)}</strong> by ${this.escapeHtml(model.author)} - ${this.formatNumber(model.downloads)} downloads</li>`;
        });
        response += '</ul>Check the "Model Releases" tab for more!';
        this.addChatMessage('bot', response);
    }

    respondAboutOpenAI() {
        const openAINews = this.newsData.filter(n => n.source.toLowerCase().includes('openai'));
        if (openAINews.length > 0) {
            let response = 'Latest from OpenAI:<ul>';
            openAINews.forEach(news => {
                response += `<li>${this.escapeHtml(news.title)}</li>`;
            });
            response += '</ul>';
            this.addChatMessage('bot', response);
        } else {
            this.addChatMessage('bot', 'I don\'t have recent OpenAI news at the moment. Check the Latest News tab or try refreshing.');
        }
    }

    respondAboutAnthropic() {
        const anthropicNews = this.newsData.filter(n => n.source.toLowerCase().includes('anthropic'));
        if (anthropicNews.length > 0) {
            let response = 'Latest from Anthropic:<ul>';
            anthropicNews.forEach(news => {
                response += `<li>${this.escapeHtml(news.title)}</li>`;
            });
            response += '</ul>';
            this.addChatMessage('bot', response);
        } else {
            this.addChatMessage('bot', 'I don\'t have recent Anthropic news at the moment. Check the Latest News tab or try refreshing.');
        }
    }

    respondWithHelp() {
        const response = `
            I can help you with:
            <ul>
                <li>Show latest AI news and developments</li>
                <li>Display recent model releases from Hugging Face</li>
                <li>Answer questions about specific AI companies (OpenAI, Anthropic, etc.)</li>
                <li>Provide information about trending AI topics</li>
            </ul>
            Try asking: "What's the latest AI news?" or "Show me recent models"
        `;
        this.addChatMessage('bot', response);
    }

    respondWithGeneral(query) {
        const responses = [
            `Interesting question about "${this.escapeHtml(query)}"! I'm focused on AI news aggregation. Try asking about latest models or news.`,
            `I'd love to help with that! For AI news and model updates, check out the tabs above or ask me about specific topics like "OpenAI" or "recent models".`,
            `That's a great topic! While I specialize in AI news aggregation, you can ask me about latest developments, model releases, or specific AI companies.`
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        this.addChatMessage('bot', randomResponse);
    }

    // Utility Functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        } else if (diffInDays < 7) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AINewsAggregator();
});

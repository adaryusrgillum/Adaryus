// API Configuration Example
// Copy this file to config.js and add your API keys
// Add config.js to .gitignore to keep your keys secret!

const API_CONFIG = {
    // NewsAPI.org - Get free API key at https://newsapi.org
    // Free tier: 100 requests/day
    newsapi: {
        enabled: false,  // Set to true when you add your key
        apiKey: 'YOUR_NEWSAPI_KEY_HERE',
        sources: 'techcrunch,wired,the-verge',
        query: 'artificial intelligence OR machine learning OR AI',
        language: 'en',
        sortBy: 'publishedAt'
    },

    // Hugging Face - No API key required for public API
    // But you can add one for higher rate limits
    huggingface: {
        enabled: true,  // Works without API key
        apiKey: '',  // Optional: Add key for higher limits
        endpoint: 'https://huggingface.co/api/models',
        limit: 12,  // Number of models to fetch
        sort: 'lastModified',
        direction: -1  // -1 for descending, 1 for ascending
    },

    // RSS Feeds - No API key needed
    rss: {
        enabled: true,
        feeds: [
            {
                name: 'OpenAI Blog',
                url: 'https://openai.com/blog/rss.xml',
                category: 'Company News'
            },
            {
                name: 'Anthropic',
                url: 'https://www.anthropic.com/news/rss.xml',
                category: 'Company News'
            },
            {
                name: 'arXiv AI',
                url: 'https://arxiv.org/rss/cs.AI',
                category: 'Research'
            },
            {
                name: 'Google AI Blog',
                url: 'https://ai.googleblog.com/feeds/posts/default',
                category: 'Company News'
            },
            {
                name: 'MIT AI News',
                url: 'https://news.mit.edu/topic/mitartificial-intelligence2-rss.xml',
                category: 'Research'
            }
        ]
    },

    // CORS Proxy - Use for development if you get CORS errors
    // For production, implement server-side API calls
    corsProxy: {
        enabled: false,
        url: 'https://api.allorigins.win/raw?url='
    },

    // Cache settings
    cache: {
        enabled: true,
        duration: 3600000  // 1 hour in milliseconds
    }
};

// How to use this config in app.js:
// 
// 1. Include this file in index.html BEFORE app.js:
//    <script src="config.js"></script>
//    <script src="app.js"></script>
//
// 2. In app.js, update loadNews() to use API_CONFIG:
//    if (API_CONFIG.newsapi.enabled) {
//        const url = `https://newsapi.org/v2/everything?q=${API_CONFIG.newsapi.query}&apiKey=${API_CONFIG.newsapi.apiKey}`;
//        const response = await fetch(url);
//        // ... process response
//    }
//
// 3. For CORS proxy (development only):
//    if (API_CONFIG.corsProxy.enabled) {
//        url = API_CONFIG.corsProxy.url + encodeURIComponent(url);
//    }

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}

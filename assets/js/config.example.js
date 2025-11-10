// Copy this file to config.local.js (gitignored) and fill in optional API keys.
window.AdaryusConfig = {
    /**
     * Optional NewsAPI.org key. Leave blank to skip NewsAPI fetching.
     * https://newsapi.org/
     */
    newsApiKey: '',
    /**
     * Provide additional RSS feeds if you want to extend the announcement grid.
     * Example: ['https://blog.google/technology/ai/rss/']
     */
    rssFeeds: [],
    /**
     * Hook up a Dialogflow CX or custom chatbot endpoint if you want to proxy
     * chat requests through server-side summarisation.
     */
    chatWebhookUrl: ''
};

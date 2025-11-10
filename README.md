# Adaryus - AI News Aggregator 🤖

A modern, responsive web application that aggregates AI news, model releases, and provides an interactive chatbot interface for staying updated with the latest developments in artificial intelligence.

## Features

### 📰 Latest AI News
- Aggregates news from multiple sources including OpenAI, Anthropic, arXiv, TechCrunch, and r/MachineLearning
- Real-time updates with refresh capability
- Clean, card-based interface with source attribution
- Responsive design for all devices

### 🚀 Model Releases
- Integration with Hugging Face API to fetch latest model releases
- Displays popular models with download and like statistics
- Tags and categorization for easy browsing
- Direct links to Hugging Face model pages

### 💬 AI News Assistant
- Interactive chatbot interface
- Natural language queries about AI news and models
- Context-aware responses based on aggregated data
- Quick access to trending topics and updates

## Technologies Used

- **Frontend**: Pure HTML5, CSS3, and Vanilla JavaScript (no frameworks required)
- **APIs**: 
  - Hugging Face API (free, no API key required)
  - NewsAPI.org (optional, for live news - free tier available)
  - RSS feeds from AI blogs and news sources
- **Design**: Modern gradient UI with responsive CSS Grid/Flexbox

## Getting Started

### Quick Start (No Installation Required)

1. Clone the repository:
```bash
git clone https://github.com/adaryusrgillum/Adaryus.git
cd Adaryus
```

2. Open `index.html` in your web browser:
```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

That's it! The application runs entirely in the browser with no build step or dependencies.

### Hosting Options

#### Option 1: GitHub Pages (Recommended - Free)
1. Go to your repository settings on GitHub
2. Navigate to "Pages" section
3. Select the branch to deploy (usually `main`)
4. Your site will be live at `https://adaryusrgillum.github.io/Adaryus/`

#### Option 2: Netlify (Free)
1. Sign up at [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Deploy with default settings
4. Your site will be live with a custom URL

#### Option 3: Vercel (Free)
1. Sign up at [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Deploy with one click
4. Get instant HTTPS and CDN

## Configuration

### Adding Live News API

To enable live news fetching (optional):

1. Sign up for a free API key at [NewsAPI.org](https://newsapi.org)
2. Update `app.js` to include your API key:

```javascript
// In the loadNews() method, replace the mock data with:
const API_KEY = 'your-api-key-here';
const response = await fetch(
  `https://newsapi.org/v2/everything?q=artificial+intelligence+OR+machine+learning&sortBy=publishedAt&apiKey=${API_KEY}`
);
```

### Adding RSS Feed Parser

For real RSS feed parsing:

1. Include the rss-parser library in `index.html`:
```html
<script src="https://cdn.jsdelivr.net/npm/rss-parser@3.13.0/dist/rss-parser.min.js"></script>
```

2. Update the RSS parsing logic in `app.js` to use the library

## Data Sources

Currently aggregating from:
- **OpenAI Blog** - Latest announcements and research
- **Anthropic** - Claude updates and safety research
- **Hugging Face** - Model releases and community updates
- **arXiv AI** - Academic research papers
- **TechCrunch AI** - Industry news and analysis
- **r/MachineLearning** - Community discussions and links

## Features Roadmap

- [ ] User preferences for news sources
- [ ] Email digest subscriptions
- [ ] Advanced filtering and search
- [ ] Bookmark and save functionality
- [ ] Dark mode toggle
- [ ] RSS feed export
- [ ] Integration with more AI platforms (Stability AI, Google AI, etc.)
- [ ] Enhanced chatbot with LLM integration

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- **No build process** - Instant load and development
- **Lightweight** - < 50KB total (HTML + CSS + JS)
- **Fast** - Direct API calls, no server middleware
- **Responsive** - Mobile-first design

## Rate Limits

When using free APIs:
- **Hugging Face API**: No authentication required, reasonable rate limits
- **NewsAPI.org** (if configured): 100 requests/day on free tier
- **RSS Feeds**: Generally no limits, respect source guidelines

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Acknowledgments

- **Hugging Face** for their excellent free API
- **NewsAPI.org** for news aggregation services
- **Open source AI community** for continuous innovation
- All the AI researchers and companies making their work accessible

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Visit [Adaryus.com](https://adaryus.com)

---

**Built with ❤️ for the AI community**
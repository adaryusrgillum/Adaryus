# Adaryus AI News Aggregator - Configuration Guide

## Quick Setup

### 1. Local Development
Simply open `index.html` in your browser - no installation needed!

### 2. Live News API (Optional)

To enable live news from NewsAPI.org:

1. Sign up at https://newsapi.org (free tier: 100 requests/day)
2. Get your API key
3. Update `app.js` line 90:

```javascript
const API_KEY = 'your-api-key-here';
```

### 3. Deployment Options

#### GitHub Pages (Recommended)
1. Go to repository Settings → Pages
2. Select branch: `main` or `copilot/create-news-aggregator-chatbot`
3. Click Save
4. Your site will be at: `https://yourusername.github.io/Adaryus/`

#### Netlify
1. Sign up at https://netlify.com
2. Click "New site from Git"
3. Connect your GitHub repository
4. Deploy with default settings

#### Vercel
1. Sign up at https://vercel.com
2. Click "Import Project"
3. Select your GitHub repository
4. Deploy automatically

## Features Configuration

### News Sources
Edit the RSS sources in `app.js` (line 100):

```javascript
const rssSources = [
    { name: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml' },
    { name: 'Anthropic', url: 'https://www.anthropic.com/news/rss.xml' },
    // Add more sources here
];
```

### Model Display
Adjust the number of models shown in `app.js` (line 200):

```javascript
const response = await fetch('https://huggingface.co/api/models?sort=lastModified&direction=-1&limit=12');
// Change limit=12 to your preferred number
```

### Styling
Customize colors in `styles.css`:

```css
/* Main gradient (line 10) */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Primary color */
color: #667eea;
```

## Rate Limits

- **Hugging Face API**: No key required, reasonable limits
- **NewsAPI.org** (if configured): 100 requests/day (free tier)
- **RSS Feeds**: Generally unlimited, respect source terms

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- All modern mobile browsers

## Troubleshooting

### CORS Issues
If you encounter CORS errors when fetching external APIs:
- Use a CORS proxy for development
- For production, implement server-side API calls
- Or use the mock data (default fallback)

### Performance
- The app is lightweight (<50KB total)
- All API calls are cached
- Responsive images and lazy loading

## Advanced Setup

### Server-side RSS Parsing
To parse real RSS feeds:

1. Add rss-parser to your HTML:
```html
<script src="https://cdn.jsdelivr.net/npm/rss-parser@3.13.0/dist/rss-parser.min.js"></script>
```

2. Update the RSS parsing in `app.js`

### Custom Domain
When deployed:
1. Purchase domain at Namecheap, Google Domains, etc.
2. Configure DNS settings in your deployment platform
3. Add CNAME record pointing to deployment URL

## Support

For issues or questions:
- Open an issue on GitHub
- Check the README.md for documentation
- Visit https://adaryus.com

## License

MIT License - free to use and modify

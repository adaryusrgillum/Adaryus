# Adaryus • AI News Radar & Automation Toolkit

**Realtime AI news aggregator, model release tracker, and conversational briefing hub built for automation teams. Now featuring a comprehensive AI Tools Directory with advanced search, live comparisons, and community reviews.**

## Getting Started

```bash
# serve the static site locally
python3 -m http.server 8080

# then open http://localhost:8080 in your browser
```

Any static file server works (`npx serve`, `http-server`, etc.).

## Project Structure

- `index.html` – SEO-optimised AI news radar with realtime feeds, podcasts, and chat assistant.
- `tools.html` – **NEW** Comprehensive AI tools directory with advanced search, filtering, live comparisons, community reviews, analytics, and personalized recommendations.
- `services.html` – detailed service catalog and engagement models.
- `projects.html` – interactive blueprint gallery with JSON exports.
- `downloads.html` – searchable resource library with instant downloads.
- `prompts.html` – prompt operating system playbooks.
- `insights.html` – modal-based technical insights and code snippets.
- `dashboard.html` – operations console with live charts.
- `assets/css/style.css` – global theme, components, and layout primitives.
- `assets/css/tools.css` – **NEW** AI tools directory specific styles.
- `assets/js/main.js` – news aggregation, feed rendering, chatbot logic, and shared controllers.
- `assets/js/tools.js` – **NEW** AI tools directory controller with filtering, comparison, and analytics.
- `assets/js/config.example.js` – sample configuration for API keys, extra RSS feeds, or custom chat webhook.

## 🔌 Configuration (Optional)

- Edit `assets/js/config.js` (defaults are empty strings) or
- Create `assets/js/config.local.js` (ignored by git) to override sensitive values using the same shape.

Fields you can supply:

- `newsApiKey` – NewsAPI.org key to enrich the community digest (client-side requests).
- `rssFeeds` – Array of extra RSS URLs (e.g. Google AI Blog, Open Source agendas).
- `chatWebhookUrl` – POST endpoint to delegate chatbot answers to Dialogflow, Botpress, Flowise, or n8n.

Without any configuration the site still works using public feeds (Hacker News, Hugging Face, Anthropic, OpenAI, Reddit).

## 🤖 Conversational Briefing

- **Location**: “Conversational Summary” section on the homepage.
- **Functionality**: Ranks aggregated items and responds with contextual links.
- **Offline Mode**: Works entirely in-browser using harvested feed data.
- **Webhook Mode**: Optional server-side summarisation via your webhook (`chatWebhookUrl`).

## Dependencies

- [Chart.js](https://www.chartjs.org/) – dashboard visualisations (lazy-loaded on demand).
- Browser Fetch API – collects JSON/RSS data from public endpoints.
- Optional: NewsAPI.org REST endpoint (requires API key if enabled).

## Development Notes

- Keep new assets in `assets/` and reference them relatively.
- Add new workflow data in `assets/js/main.js` to surface across relevant pages.
- Ensure new components remain accessible (aria attributes, keyboard support).
- Chatbot knowledge base can be expanded by editing the `docs` array in `initChatbot()`.
- All animations are GPU-accelerated with CSS transforms.

## Features

### AI Tools Directory (NEW)
✨ **Comprehensive Tool Discovery**
- Ultra-detailed metadata: pricing breakdowns, feature specs, version tracking, security certifications
- Advanced search with NLP-powered fuzzy matching
- Compound faceted filtering: category, pricing, deployment, features, compliance
- Live comparison engine for side-by-side tool evaluation
- Downloadable comparison tables and shareable URLs
- Community reviews, ratings, and Q&A
- User-generated tool submissions with moderation
- Contributor leaderboards and badges
- AI-powered personalized recommendations
- Real-time analytics and trending tools
- Interactive visualizations (charts, word clouds)
- Multi-language support and accessibility features
- Team collaboration tools (saved lists, shared collections)

### AI News Radar
✨ **Interactive Components**
- AI news digest sourced from community APIs & RSS.
- Hugging Face model release tracker with likes/downloads.
- Announcement grid for OpenAI, Anthropic, and custom feeds.
- Conversational assistant that surfaces top matches on demand.
- Integration playbook with step-by-step deployment ideas.

🎨 **Modern Design**
- Dark theme with glassmorphism accents & responsive grids.
- SEO-first structure (metadata, canonical, JSON-LD schema).
- Skeleton loaders for fast perceived performance.
- Accessible components with keyboard/ARIA support.

🔧 **Technical Stack**
- Pure HTML/CSS/JavaScript (no build required).
- Client-side feed aggregation with optional API enrichment.
- Static deployment ready for GitHub Pages / CDN edge caches.
- Shared controllers powering legacy service/blueprint pages.

## Troubleshooting

**Chatbot not showing messages?**
- Check browser console for errors
- Verify all required DOM elements exist
- Test in a fresh tab (may be cache issue)

**Animations jerky?**
- Disable hardware acceleration (developer settings)
- Check CPU usage in DevTools Performance tab
- Reduce particle count in `initParticles()`

**Modal not closing?**
- Ensure backdrop click handler is attached
- Check that modal HTML structure is correct
- Verify `data-close-modal` attribute exists

## Maintenance

- `REVIEW_REQUESTS.md` – documentation and status of PR review requests
- `scripts/close_review_requests.sh` – automation script to remove pending review requests

## Questions?

Email **build@adaryus.ai** for support or feature requests.

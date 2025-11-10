# Adaryus • Agentic AI Automation Studio

**Advanced agentic AI automation studio delivering multi-agent workflows, RAG systems, and measurable enterprise impact.**

## Getting Started

```bash
# serve the static site locally
python3 -m http.server 8080

# then open http://localhost:8080 in your browser
```

Any static file server works (`npx serve`, `http-server`, etc.).

## Project Structure

- `index.html` – homepage with hero animation, workflow visualiser, and chatbot demo.
- `services.html` – detailed service catalog and engagement models.
- `projects.html` – interactive blueprint gallery with JSON exports.
- `downloads.html` – searchable resource library with instant downloads.
- `prompts.html` – prompt operating system playbooks.
- `insights.html` – modal-based technical insights and code snippets.
- `dashboard.html` – operations console with live charts.
- `assets/css/style.css` – global theme, components, and layout primitives.
- `assets/js/main.js` – shared logic for animations, chat simulation, charts, and page controllers.

## 🤖 AI Chatbot Feature

The website includes an interactive AI chatbot powered by simulated RAG:

- **Location**: Fixed button in bottom-right corner
- **Functionality**: Answers questions about automation, RAG, guardrails, and evaluation
- **Knowledge Base**: Embedded documentation with source attribution
- **Features**:
  - Multi-turn conversation memory
  - Context-aware responses
  - Source citations
  - Smooth animations

The chatbot is fully functional without external API calls—all knowledge is embedded in the JavaScript.

## Dependencies

The site loads a few CDN libraries for animations and charts:

- [anime.js](https://animejs.com/) – workflow line animations.
- [typed.js](https://mattboldt.com/demos/typed-js/) – hero keyword rotation.
- [Chart.js](https://www.chartjs.org/) – dashboard visualisations (lazy-loaded on demand).

## Development Notes

- Keep new assets in `assets/` and reference them relatively.
- Add new workflow data in `assets/js/main.js` to surface across relevant pages.
- Ensure new components remain accessible (aria attributes, keyboard support).
- Chatbot knowledge base can be expanded by editing the `docs` array in `initChatbot()`.
- All animations are GPU-accelerated with CSS transforms.

## Features

✨ **Interactive Components**
- Workflow visualizer with animated data flows
- Multi-agent architecture demonstrations
- Real-time metrics and KPI tracking
- Modal-based code/blueprint viewers

🎨 **Modern Design**
- Dark theme with glassmorphism effects
- Smooth animations and transitions
- Fully responsive (desktop/tablet/mobile)
- Canvas-based particle background

🔧 **Technical Stack**
- Pure HTML/CSS/JavaScript (no build required)
- Embedded knowledge base for chatbot
- SVG-based visualizations
- Canvas animations for particles

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

## Questions?

Email **build@adaryus.ai** for support or feature requests.

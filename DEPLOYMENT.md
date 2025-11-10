# Quick Deployment Guide

## Deploy to GitHub Pages (Free & Easy!)

### Option 1: Via GitHub Website (Easiest)

1. Go to your repository on GitHub: `https://github.com/adaryusrgillum/Adaryus`
2. Click on **Settings** (top right)
3. Scroll down to **Pages** section (left sidebar)
4. Under "Source", select your branch (e.g., `main` or `copilot/create-news-aggregator-chatbot`)
5. Click **Save**
6. Wait 1-2 minutes
7. Your site will be live at: `https://adaryusrgillum.github.io/Adaryus/`

### Option 2: Via Command Line

```bash
# Make sure you're on the right branch
git checkout copilot/create-news-aggregator-chatbot

# Push to GitHub
git push origin copilot/create-news-aggregator-chatbot

# Then follow Option 1 to enable GitHub Pages
```

## Deploy to Netlify (Free & Fast)

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository
4. Build settings:
   - Build command: (leave empty)
   - Publish directory: `/`
5. Click "Deploy site"
6. Your site will be live in ~30 seconds!
7. Optional: Configure custom domain in Site settings

## Deploy to Vercel (Free & Global CDN)

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Framework preset: Other
5. Build settings: (leave defaults)
6. Click "Deploy"
7. Your site will be live immediately!
8. Optional: Add custom domain in Project settings

## Custom Domain Setup (Optional)

### For GitHub Pages:
1. Buy domain from Namecheap, Google Domains, etc.
2. Add a `CNAME` file to your repo with your domain name
3. Configure DNS:
   - Add CNAME record: `www` → `adaryusrgillum.github.io`
   - Add A records for root domain (check GitHub docs)

### For Netlify/Vercel:
1. Go to Site/Project settings → Domains
2. Click "Add custom domain"
3. Follow the DNS configuration instructions
4. SSL certificate is automatically provisioned

## Testing Before Deployment

Run locally:
```bash
# Simple HTTP server (Python 3)
python3 -m http.server 8000

# Then visit: http://localhost:8000
```

Or just double-click `index.html` in your file explorer!

## What Gets Deployed?

All files in your repository:
- `index.html` - Main page
- `styles.css` - Styling
- `app.js` - Application logic
- `README.md` - Documentation
- `SETUP.md` - Setup guide

No build process needed! 🚀

## Troubleshooting

**Site shows 404**
- Wait 2-3 minutes after enabling GitHub Pages
- Check that Pages is enabled in Settings
- Verify the branch is correct

**CSS/JS not loading**
- Check browser console for errors
- Verify file names match exactly (case-sensitive)
- Clear browser cache (Ctrl+Shift+R)

**API not working**
- Check browser console for CORS errors
- Hugging Face API should work without keys
- For NewsAPI, add your API key in `app.js`

## Need Help?

- Check `README.md` for detailed documentation
- See `SETUP.md` for configuration options
- Open an issue on GitHub

---

**That's it! Your AI news aggregator is now live! 🎉**

# GitHub Pages + Hostinger Domain Setup

## What Was Done ✅

1. **CNAME File Created** - Points `adaryus.com` to GitHub Pages
2. **GitHub Actions Workflow** - Automatic deployment on every push to `main`
3. **Repository Committed & Pushed** - All changes are live in GitHub

## What You Need To Do (In Hostinger)

### Update DNS Records in Hostinger Control Panel:

1. **Log into Hostinger** → Hosting → Manage Domain → DNS

2. **Remove or Update Current A Records** to point to GitHub Pages:

   **Option A: Using CNAME (Recommended)**
   - Delete current A records
   - Add new CNAME record:
     - **Name/Subdomain**: `www`
     - **Points to**: `adaryusrgillum.github.io`
     - **TTL**: 3600

3. **For Apex Domain (adaryus.com without www):**
   - Add these A records (GitHub Pages IPs):
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - Keep TTL at default (usually 3600)

### Expected Result:
```
adaryus.com                 → Points to GitHub Pages (A records)
www.adaryus.com            → adaryusrgillum.github.io (CNAME)
```

## Verify GitHub Pages is Enabled

1. Go to: https://github.com/adaryusrgillum/Adaryus/settings/pages
2. Check:
   - ✅ "Source" = Deploy from branch → main → / (root)
   - ✅ Custom domain = `adaryus.com`
   - ✅ Enforce HTTPS = ✓ (checked)

## Timeline for DNS Propagation

- **Immediate**: Domain points to GitHub Pages infrastructure
- **15 minutes - 24 hours**: Full DNS propagation globally
- **After propagation**: HTTPS certificate auto-issued by GitHub

## Testing After DNS Updates

```bash
# Test DNS resolution
nslookup adaryus.com
# Should show GitHub IP addresses

# Test HTTPS connection
curl -I https://adaryus.com
# Should return 200 OK with proper certificate
```

## Current Status

- ✅ GitHub repository ready
- ✅ GitHub Actions configured for auto-deploy
- ✅ CNAME file in place
- ⏳ **PENDING**: Hostinger DNS configuration
- ⏳ **PENDING**: GitHub Pages settings confirmation

## Next Steps

1. Update DNS records in Hostinger (see above)
2. Wait 15-24 hours for propagation
3. Verify at https://adaryus.com
4. Check browser console for any asset loading issues

**Site will be live once DNS propagates! 🚀**

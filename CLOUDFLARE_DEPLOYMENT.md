# Cloudflare Deployment Guide

This guide explains how to deploy your Hugo site to Cloudflare using Cloudflare Pages and Workers.

## Prerequisites

1. Cloudflare account with a domain (e.g., kinland.com)
2. Wrangler CLI installed: `npm install -g wrangler`
3. Cloudflare Pages and Workers enabled on your account

## Setup Instructions

### 1. Configure Your Domain

1. Add your domain to Cloudflare if not already done
2. Ensure DNS records are properly configured
3. Note your Zone ID from Cloudflare dashboard

### 2. Update Configuration Files

Update the following placeholders in your configuration files:

#### In `wrangler.toml`:
```toml
# Replace with your actual Zone ID
routes = [
  { pattern = "your-domain.com/*", zone_id = "YOUR_ZONE_ID" },
  { pattern = "www.your-domain.com/*", zone_id = "YOUR_ZONE_ID" }
]
```

#### In `cloudflare.toml`:
```toml
[env.production.vars]
HUGO_BASEURL = "https://your-domain.com"

[env.preview.vars]
HUGO_BASEURL = "https://preview.your-domain.com"
```

### 3. Set Up KV Namespaces and D1 Database

1. Create KV namespaces in Cloudflare dashboard:
   - ASSETS
   - GUESTBOOK
   - CONTACT

2. Get the namespace IDs and update `wrangler.toml`

3. Create D1 database:
   - Name: kinland-db
   - Get database ID and update `wrangler.toml`

### 4. Environment Variables

Set these environment variables in your Cloudflare dashboard:
- SITE_URL: Your site URL
- ADMIN_EMAIL: Admin email address
- CONTACT_EMAIL: Contact form email
- GUESTBOOK_ENABLED: "true" or "false"

### 5. Deploy to Cloudflare Pages

1. Go to Cloudflare Pages dashboard
2. Connect your Git repository
3. Set build settings:
   - Build command: `yarn build:cloudflare`
   - Build directory: `dist`
   - Framework preset: `None`

4. Set environment variables in Pages dashboard

### 6. Deploy Cloudflare Worker

```bash
# Authenticate wrangler
wrangler login

# Deploy worker
wrangler publish
```

### 7. Configure Edge Functions

The following edge functions are configured:
- `/contact` - Contact form handling
- `/guestbook` - Guestbook functionality

## Build Commands

### Local Development
```bash
# Start development server
yarn start

# Preview with drafts and future content
yarn preview
```

### Production Build
```bash
# Build for production
yarn build:cloudflare

# Deploy to Cloudflare
yarn deploy:cloudflare
```

## File Structure

```
├── cloudflare.toml          # Cloudflare Pages configuration
├── wrangler.toml           # Cloudflare Workers configuration
├── _redirects              # Cloudflare Pages redirects
├── _headers                # Cloudflare Pages security headers
├── site/                   # Hugo site source
│   └── config.toml        # Hugo configuration
├── src/                    # Frontend source
├── dist/                   # Built files (output)
└── netlify/               # Netlify functions (legacy)
```

## Troubleshooting

### Common Issues

1. **Build fails with Hugo version error**
   - Check `HUGO_VERSION` in `cloudflare.toml`
   - Ensure Hugo binary is available

2. **Worker deployment fails**
   - Check KV namespace IDs in `wrangler.toml`
   - Verify D1 database configuration
   - Check environment variables

3. **Pages deployment fails**
   - Verify build command: `yarn build:cloudflare`
   - Check build directory: `dist`
   - Ensure all dependencies are installed

### Debug Commands

```bash
# Test worker locally
wrangler dev

# Check build output
yarn build:cloudflare

# Validate configuration
wrangler validate
```

## Performance Optimization

The configuration includes several performance optimizations:

1. **Asset Caching**: Long cache headers for static assets
2. **Minification**: Hugo and Webpack minification enabled
3. **Security Headers**: Comprehensive security headers
4. **CDN**: Automatic Cloudflare CDN for all assets

## Monitoring

1. **Pages**: Monitor builds and deployments in Cloudflare Pages dashboard
2. **Workers**: Monitor worker performance and logs in Workers dashboard
3. **Analytics**: Use Cloudflare Analytics for traffic monitoring

## Support

For issues with this deployment setup:
1. Check Cloudflare documentation
2. Review build logs in Pages dashboard
3. Check worker logs in Workers dashboard
# Kinland Website - Cloudflare Pages Deployment

This is the Kinland website configured for deployment on Cloudflare Pages. The site serves static content, handles API requests, and provides a Decap CMS admin interface.

## Features

- **Static Site Serving**: Serves Hugo-generated static content
- **API Endpoints**: Guestbook and contact form APIs
- **Decap CMS**: Content management interface
- **Asset Optimization**: Automatic asset serving with proper caching
- **Security Headers**: Proper security headers for production

## Architecture

The site is built using:
- **Hugo**: Static site generation
- **React**: Frontend components
- **Cloudflare Pages**: Static hosting with edge functions
- **Decap CMS**: Content management

## Development

### Prerequisites

- Node.js 18+
- Hugo
- Wrangler CLI

### Installation

```bash
npm install
```

### Development

```bash
# Start Hugo development server
npm run start:hugo

# Start webpack development server
npm run start:webpack

# Start Cloudflare Worker development
npm run start:worker
```

### Building

```bash
# Build static site and worker
npm run build:all

# Build only the worker
npm run build:worker
```

### Deployment

```bash
# Deploy to Cloudflare Pages
npm run deploy:pages
```

## Configuration

### Environment Variables

Set these in your Cloudflare Pages dashboard:

```env
NODE_VERSION=22
NPM_VERSION=10.9.0
YARN_VERSION=1.22.22
HUGO_VERSION=0.156.2
HUGO_ENV=production
HUGO_ENABLEGITINFO=true
```

### Build Settings

- **Build command**: `npm run build:all`
- **Publish directory**: `dist`
- **Framework preset**: None (Custom)

## API Endpoints

### Guestbook

- `GET /api/guestbook` - Get all guestbook entries
- `POST /api/guestbook` - Add new guestbook entry

### Contact

- `POST /api/contact` - Submit contact form

## Admin Interface

Access the Decap CMS admin interface at:

```
https://your-site.pages.dev/admin/
```

## File Structure

```
├── src/
│   ├── worker.js          # Main worker entry point
│   ├── index.js           # React app entry
│   ├── css/               # Styles
│   └── js/                # JavaScript modules
├── site/                  # Hugo source
├── dist/                  # Built assets
├── cloudflare.toml        # Cloudflare Pages config
├── _redirects             # URL routing rules
├── _headers               # HTTP headers
├── wrangler.toml          # Cloudflare Workers config
├── cloudflare.config.js   # Vite config for worker
└── package.json
```

## Migration from Netlify

This version converts the original Netlify-based site to Cloudflare Pages:

- Static assets are served from the `dist` directory
- API endpoints use Cloudflare Workers
- Admin interface is preserved
- Build process updated for Pages
- Environment variables moved to Cloudflare dashboard

## Cloudflare Pages Configuration

### Build Configuration

The `cloudflare.toml` file contains the build configuration:

```toml
[build]
  command = "npm run build:all"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"
  NPM_VERSION = "10.9.0"
  YARN_VERSION = "1.22.22"
```

### URL Routing

The `_redirects` file handles client-side routing:

```
# Redirect admin to Decap CMS
/admin/* /admin/index.html 200

# Handle client-side routing for SPA
/* /index.html 200
```

### Security Headers

The `_headers` file sets security headers:

```
# Security headers
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-XSS-Protection: 1; mode=block
```

## Support

For issues related to the Cloudflare Pages setup, check the [Cloudflare Pages documentation](https://developers.cloudflare.com/pages/).
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
yarn install
```

### Development

```bash
# Start Hugo development server
yarn run start:hugo

# Start webpack development server
yarn run start:webpack

# Start Cloudflare Worker development
yarn run start:worker
```

### Building

```bash
# Build static site and worker
yarn run build:all

# Build only the worker
yarn run build:worker
```

### Deployment

```bash
# Build and deploy to Cloudflare Workers
yarn run deploy:cloudflare
```

## Configuration

### Cloudflare Workers Configuration

The `wrangler.toml` file contains the worker configuration. Ensure your KV namespaces and D1 database are correctly bound.

### URL Routing

The Worker in `src/worker.js` handles all routing, including:
- Serving Hugo-generated HTML files
- Resolving clean URLs (e.g. `/post/my-post/` -> `/post/my-post/index.html`)
- Serving static assets from KV storage
- Handling `/api/*` routes for Guestbook and Contact forms
- Providing the `/admin/` interface for Decap CMS

### Security Headers

Security headers and Cache-Control are managed within `src/worker.js` in the `createAssetResponse` function.

## Support

For issues related to the Cloudflare Pages setup, check the [Cloudflare Pages documentation](https://developers.cloudflare.com/pages/).
# Cloudflare Worker Setup for Kinland Website

This guide explains how to deploy the Kinland website as a Cloudflare Worker with full functionality including comments, contact form, and CMS.

## Prerequisites

- Node.js 18+ installed
- Yarn package manager
- Cloudflare account with Workers enabled
- Wrangler CLI installed: `npm install -g wrangler`

## Quick Start

### 1. Install Dependencies

```bash
yarn install
```

### 2. Build the Site

```bash
# Build Hugo site and Cloudflare Worker
yarn run build:site
```

### 3. Configure Cloudflare

#### Initialize Wrangler
```bash
yarn run cloudflare:setup
```

#### Configure Environment Variables
Create a `.env` file in the root directory:

```env
# Site Configuration
SITE_URL=https://kinland.helltop.net
ADMIN_EMAIL=admin@kinland.helltop.net
CONTACT_EMAIL=contact@kinland.helltop.net

# Database Configuration (optional)
NEON_DATABASE_URL=your-neon-database-url

# Email Configuration (optional)
ENABLE_EMAILS=true
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
```

### 4. Set Up KV Namespaces

Create KV namespaces for data storage:

```bash
# Create KV namespaces
wrangler kv:namespace create "ASSETS"
wrangler kv:namespace create "GUESTBOOK"
wrangler kv:namespace create "CONTACT"

# Update wrangler.toml with the generated IDs
```

### 5. Deploy to Cloudflare

```bash
# Deploy the worker
yarn run deploy:cloudflare
```

## Architecture Overview

### Static Site Hosting
- Hugo generates static HTML, CSS, and JavaScript files
- Files are served through Cloudflare Workers with proper caching
- KV storage can be used for asset optimization

### API Endpoints
- `/api/guestbook` - Guestbook/comments functionality
- `/api/contact` - Contact form processing
- `/admin/` - Decap CMS interface

### Data Storage Options

#### KV Storage (Default)
- Guestbook entries stored in KV namespace
- Contact form submissions stored in KV namespace
- Simple key-value storage, good for basic functionality

#### D1 Database (Optional)
- More robust SQL database
- Better for complex queries and relationships
- Requires D1 database setup in wrangler.toml

#### Neon Database (Optional)
- External PostgreSQL database
- Good for development and testing
- Can be used with D1 for hybrid approach

## CMS Configuration

### Decap CMS Setup
The site uses Decap CMS for content management:

1. **Authentication**: Configure Git Gateway backend in `site/static/admin/config.yml`
2. **Media Storage**: Images stored in `site/static/img/`
3. **Content Collections**: Posts, pages, products, values managed through CMS

### Netlify Identity Integration
For user authentication with Decap CMS:

```yaml
# In site/static/admin/config.yml
backend:
  name: git-gateway
  branch: main
```

## Email Configuration

### Cloudflare Email Sending
Enable email functionality by setting `ENABLE_EMAILS=true` and configuring SMTP settings.

### Netlify Email Integration
Alternative email setup using Netlify's email service:

```javascript
// In contact form handler
await fetch(`${process.env.URL}/.netlify/functions/emails/contact`, {
  headers: {"netlify-emails-secret": process.env.NETLIFY_EMAILS_SECRET},
  method: "POST",
  body: JSON.stringify({
    from: email,
    to: process.env.CONTACT_EMAIL,
    subject: `New Contact Form Submission from ${name}`,
    parameters: {name, email, message},
  }),
});
```

## Development Workflow

### Local Development
```bash
# Start Hugo development server
yarn run start:hugo

# Start Webpack development server
yarn run start:webpack

# Start Cloudflare Worker development
yarn run start:cloudflare
```

### Preview Mode
```bash
# Build with draft and future content
yarn run preview
```

### Testing
```bash
# Run linting
yarn run lint

# Test API endpoints locally
curl -X POST http://localhost:8787/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Hello"}'
```

## Performance Optimization

### Caching Strategy
- Static assets: 1 year cache
- API responses: 5 minute cache
- HTML pages: 10 minute cache

### Image Optimization
- Use Cloudflare Images for automatic optimization
- Configure Hugo image processing
- Set proper cache headers

### Bundle Optimization
- Vite handles JavaScript bundling
- CSS extracted and minified
- Unused code eliminated

## Monitoring and Debugging

### Cloudflare Analytics
- Enable in wrangler.toml
- Monitor request patterns
- Track error rates

### Logging
```bash
# View worker logs
wrangler tail

# Filter logs
wrangler tail --status error
```

### Health Checks
```bash
# Test API endpoints
curl http://localhost:8787/api/guestbook
curl http://localhost:8787/api/contact
```

## Troubleshooting

### Common Issues

1. **KV Namespace Not Found**
   - Ensure namespaces are created in wrangler.toml
   - Check namespace IDs are correct

2. **CMS Not Loading**
   - Verify Git Gateway configuration
   - Check authentication settings

3. **Email Not Sending**
   - Verify SMTP configuration
   - Check email service limits

4. **Build Failures**
   - Ensure Hugo binary is available
   - Check Node.js version compatibility

### Debug Mode
Enable debug logging in wrangler.toml:

```toml
[dev]
local_protocol = "http"
upstream_protocol = "https"
log_level = "debug"
```

## Deployment Checklist

- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Create KV namespaces
- [ ] Set up domain and SSL
- [ ] Deploy worker
- [ ] Test all functionality
- [ ] Configure monitoring
- [ ] Set up backups

## Next Steps

1. **Custom Domain**: Configure your custom domain in Cloudflare
2. **SSL Certificate**: Ensure SSL is enabled
3. **Performance**: Monitor and optimize based on usage
4. **Backups**: Set up regular backups of KV data
5. **Monitoring**: Configure alerts for errors and performance issues

## Support

For issues with this setup:
1. Check the Cloudflare Workers documentation
2. Review the Hugo documentation
3. Consult the Decap CMS documentation
4. Check the project's GitHub issues
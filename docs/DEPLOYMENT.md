# 🚀 Deployment Guide

## Pre-Deployment Checklist

### Code Quality
- ✅ No console errors
- ✅ All imports resolved
- ✅ Components properly structured
- ✅ Responsive design verified
- ✅ Animations smooth across devices
- ✅ Performance optimized

### Build Verification
- ✅ Production build completes successfully
- ✅ Bundle size reasonable (~310KB gzipped)
- ✅ All assets included
- ✅ Source maps generated

### Content & Copy
- [ ] Update all placeholder text
- [ ] Add real company information
- [ ] Update statistics with actual data
- [ ] Verify all links work
- [ ] Review all testimonials

### SEO & Meta
- [ ] Update page title
- [ ] Add meta descriptions
- [ ] Update OG tags for social sharing
- [ ] Add canonical URLs
- [ ] Setup sitemap.xml
- [ ] Create robots.txt

### Analytics & Tracking
- [ ] Setup Google Analytics
- [ ] Setup conversion tracking
- [ ] Configure event tracking
- [ ] Setup error tracking (Sentry)

## Deployment Steps

### 1. Vercel (Recommended)

**Benefits**: Zero-config, optimized for Vite, free tier available

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Or connect via Git**:
1. Push code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Select your repository
5. Vercel auto-detects Vite configuration
6. Deploy with one click

**Environment Variables**:
```
# .env.production
VITE_API_URL=https://api.example.com
VITE_APP_NAME=EduVerse AI
```

### 2. Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
netlify deploy --prod --dir=dist
```

**Or connect via Git**:
1. Go to https://app.netlify.com
2. Click "New site from Git"
3. Connect GitHub
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

### 3. AWS Amplify

```bash
# Install AWS CLI
npm i -g @aws-amplify/cli

# Initialize and deploy
amplify init
amplify publish
```

### 4. GitHub Pages

```bash
# Update vite.config.js
export default {
  base: '/eduverse-ai/',
  // ... rest of config
}

# Build
npm run build

# Deploy
git add dist
git commit -m "Deploy to GitHub Pages"
git push origin main
```

Then enable GitHub Pages in repository settings, pointing to `/dist` folder.

### 5. Self-Hosted (Node/Docker)

**Express Server**:
```javascript
import express from 'express'
import path from 'path'

const app = express()
const __dirname = path.resolve()

app.use(express.static('dist'))

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
```

**Docker**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm i -g serve
COPY --from=0 /app/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

## Post-Deployment

### Verify Deployment
- [ ] Visit deployed URL
- [ ] Test all navigation links
- [ ] Verify 3D scene renders
- [ ] Check animations work
- [ ] Test mobile responsiveness
- [ ] Verify forms work (if added)
- [ ] Check image loading

### Performance Monitoring
- [ ] Setup monitoring dashboard
- [ ] Configure uptime alerts
- [ ] Setup error notifications
- [ ] Monitor bundle size

### Security
- [ ] Enable HTTPS
- [ ] Setup security headers (CSP, X-Frame-Options)
- [ ] Setup CORS properly
- [ ] Validate all forms server-side
- [ ] Rate limit API calls

### Analytics Setup
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

## Environment Variables

Create `.env.production`:
```
VITE_API_URL=https://api.example.com
VITE_APP_NAME=EduVerse AI
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=https://your-sentry-dsn
```

## CDN Configuration

### Images & Assets
- Setup CloudFront or Cloudflare
- Enable gzip compression
- Cache assets for 1 year
- Cache HTML for 1 hour

### Cache Headers
```
# dist/index.html
Cache-Control: no-cache, no-store, must-revalidate

# dist/assets/*
Cache-Control: public, max-age=31536000, immutable
```

## SSL Certificate

### Let's Encrypt
```bash
# Using Certbot
sudo certbot certonly --standalone -d example.com
```

### Managed SSL
- Vercel: Automatic
- Netlify: Automatic
- AWS: AWS Certificate Manager (ACM)

## Domain Setup

1. Purchase domain (GoDaddy, Namecheap, Route53)
2. Update nameservers to point to hosting provider
3. Setup CNAME/A records:
   - `A` record → hosting provider IP
   - `CNAME` www → hosting provider domain
4. Verify DNS propagation (up to 24 hours)

## Monitoring & Alerts

### Uptime Monitoring
- UptimeRobot (free)
- Pingdom
- Datadog
- New Relic

### Performance Monitoring
- Vercel Analytics (built-in)
- Netlify Analytics (free)
- Google PageSpeed Insights
- WebPageTest

### Error Tracking
- Sentry (free tier)
- Rollbar
- Airbrake

## Rollback Plan

If something goes wrong after deployment:

```bash
# Revert to previous version
git revert HEAD
npm run build
# Redeploy
```

Or:
```bash
# On Vercel - click "Deployments" → select previous → "Promote"
# On Netlify - click "Deploys" → select previous → "Publish deploy"
```

## Performance Targets

- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3.8s
- **Lighthouse Score**: > 90

Monitor with:
```bash
npm run build
npm run preview
# Open browser dev tools → Lighthouse
```

## Maintenance

### Weekly
- Monitor error tracking
- Review analytics

### Monthly
- Update dependencies: `npm update`
- Audit security: `npm audit`
- Check performance metrics
- Review uptime reports

### Quarterly
- Major version updates
- Security patches
- Performance optimizations
- Content updates

## Support & Troubleshooting

### Common Issues

**404 on refresh**:
- Ensure all routes redirect to index.html
- Check Vercel/Netlify settings

**Styles not loading**:
- Clear browser cache
- Verify CSS file paths
- Check CDN configuration

**3D scene not rendering**:
- Check WebGL support
- Verify Three.js loaded
- Check console for errors

**Slow performance**:
- Enable gzip compression
- Optimize images
- Enable caching
- Use CDN

## Success Checklist

- ✅ Website loads in < 2 seconds
- ✅ All sections visible and responsive
- ✅ 3D scene renders smoothly
- ✅ Animations work correctly
- ✅ Mobile view looks great
- ✅ No console errors
- ✅ Lighthouse score > 90
- ✅ Analytics tracking working
- ✅ Forms operational
- ✅ SSL certificate valid

## Next Steps

1. Deploy to chosen platform
2. Verify all sections work
3. Setup analytics
4. Monitor performance
5. Gather user feedback
6. Make improvements
7. Plan marketing campaign
8. Scale infrastructure as needed

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Deployment URL**: _______________
**Status**: _______________

# JetStart Web Emulator - Deployment Guide

## Quick Deploy to Netlify

### Option 1: Manual Deploy (Fastest)
1. Build the project:
   ```bash
   npm run build
   ```
2. Drag the `dist` folder to [Netlify Drop](https://app.netlify.com/drop)
3. Done! ✅

### Option 2: Deploy from Git (Recommended)
1. **IMPORTANT**: Move `netlify.toml` to the **root** of your repo:
   ```bash
   mv packages/web/netlify.toml netlify.toml
   ```
2. Push your code to GitHub
3. Go to [Netlify](https://app.netlify.com)
4. Click "Add new site" → "Import an existing project"
5. Connect to GitHub and select your repo
6. Netlify will auto-detect the `netlify.toml` config
7. Click "Deploy site"
8. Done! Auto-deploys on every push 🚀

**Why move netlify.toml to root?**
- JetStart is a monorepo (multiple packages)
- Web package depends on `@jetstart/shared`
- Netlify needs to build from the root to resolve workspace dependencies

### Option 3: Netlify CLI
1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```
2. Build and deploy:
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

## Deploy to Other Platforms

### Vercel
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Deploy:
   ```bash
   npm run build
   vercel --prod
   ```

### GitHub Pages
1. Build:
   ```bash
   npm run build
   ```
2. Deploy to `gh-pages` branch:
   ```bash
   npm install -g gh-pages
   gh-pages -d dist
   ```

## Environment Variables

The web client connects to your JetStart dev server via WebSocket. Make sure users can configure:

- **Session ID**: From `jetstart dev` output
- **Token**: From `jetstart dev` output
- **WebSocket URL**: `ws://YOUR_IP:3001` (optional, defaults to localhost)

## CORS & Security

If deploying to production:
1. Ensure your dev server allows WebSocket connections from your domain
2. Use HTTPS/WSS for secure connections
3. Never expose session tokens publicly

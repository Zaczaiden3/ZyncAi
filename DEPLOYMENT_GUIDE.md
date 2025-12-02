# Deployment Guide for ZyncAI

This guide provides instructions for deploying the ZyncAI application to various environments.

## 1. Environment Variables

Before deploying, ensure you have the following environment variables configured in your deployment platform (Vercel, Netlify, Docker, etc.):

```env
# AI Provider Keys
VITE_GEMINI_API_KEY=your_gemini_key
VITE_OPENROUTER_API_KEY=your_openrouter_key

# Firebase Configuration (If using Auth/Sync)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Feature Flags
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_VOICE_INPUT=true
```

## 2. Static Hosting (Vercel / Netlify)

ZyncAI is a Vite-based Single Page Application (SPA), making it ideal for static hosting.

### Vercel

1. **Install Vercel CLI**: `npm i -g vercel`
2. **Login**: `vercel login`
3. **Deploy**: Run `vercel` in the project root.
4. **Settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables**: Add the variables from Section 1 in the Vercel Dashboard.

### Netlify

1. **Install Netlify CLI**: `npm i -g netlify-cli`
2. **Login**: `netlify login`
3. **Deploy**: Run `netlify deploy` (or connect via Git).
4. **Settings**:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. **Environment Variables**: Add them in Site Settings > Build & Deploy > Environment.

## 3. Docker Deployment

For self-hosted or containerized environments (AWS ECS, Google Cloud Run, DigitalOcean).

### Build the Image

```bash
docker build -t zync-ai .
```

### Run the Container

```bash
docker run -d -p 8080:80 \
  -e VITE_GEMINI_API_KEY=your_key \
  --name zync-container \
  zync-ai
```

_Note: Since Vite builds at compile time, environment variables starting with `VITE_`must be present during the`docker build`phase or injected via a runtime configuration script if you are using a specific runtime strategy. For this standard Dockerfile, ensure variables are set during build or use a`.env` file mounted to the build context.\_

## 4. Manual Build (Local Server)

To build and serve locally for testing production behavior:

1. **Build**:

   ```bash
   npm run build
   ```

2. **Preview**:

   ```bash
   npm run preview
   ```

   This starts a local server (usually on port 4173) serving the built artifacts.

## 5. Troubleshooting

- **"Missing API Key"**: Ensure your environment variables are correctly prefixed with `VITE_` and are accessible at build time.
- **Routing 404s**: If using Nginx or Apache, ensure all requests are rewritten to `index.html` (SPA routing). The provided `nginx.conf` handles this.
- **Offline Mode Issues**: WebLLM requires **HTTPS** (or localhost) and **SharedArrayBuffer** support. Ensure your hosting provider sends the following headers:
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Embedder-Policy: require-corp`

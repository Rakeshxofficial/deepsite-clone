---
title: HTMLweb.dev v2
emoji: 🐳
colorFrom: blue
colorTo: blue
sdk: docker
pinned: true
app_port: 3000
license: mit
short_description: Generate any web application with AI
models:
  - deepseek-ai/DeepSeek-V3-0324
  - deepseek-ai/DeepSeek-R1-0528
---

# HTMLweb.dev 🐳

HTMLweb.dev is a coding platform powered by DeepSeek AI, designed to make coding smarter and more efficient. Tailored for developers, data scientists, and AI engineers, it integrates generative AI into your coding projects to enhance creativity and productivity.

## How to use it locally

Run `npm install` and then `npm run dev` to start the development server on localhost:3000.

## Deployment on Render

### Prerequisites
1. MongoDB Atlas account (free tier available)
2. HuggingFace account for OAuth
3. GitHub repository with your code

### Step-by-Step Deployment

1. **Push to GitHub**: Make sure your code is in a GitHub repository

2. **Set up MongoDB Atlas**:
   - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Get your connection string
   - Whitelist all IPs (0.0.0.0/0) for Render deployment

3. **Configure HuggingFace OAuth**:
   - Go to [HuggingFace Settings](https://huggingface.co/settings/applications)
   - Create a new OAuth application
   - Set redirect URI to: `https://your-app-name.onrender.com/auth/callback`
   - Note down Client ID and Client Secret

4. **Deploy on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect the `render.yaml` configuration

5. **Set Environment Variables**:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/htmlweb-dev
   OAUTH_CLIENT_ID=your_huggingface_client_id
   OAUTH_CLIENT_SECRET=your_huggingface_client_secret
   DEFAULT_HF_TOKEN=your_default_huggingface_token
   HF_TOKEN=your_huggingface_token (optional, for local development)
   ```

6. **Deploy**: Click "Create Web Service" and wait for deployment

### Important Notes
- The app will be available at `https://your-app-name.onrender.com`
- Free tier may have cold starts (app sleeps after 15 minutes of inactivity)
- Upgrade to paid plan ($7/month) for always-on service
- Make sure to update OAuth redirect URIs with your actual Render URL

### Troubleshooting
- Check Render logs for any deployment issues
- Ensure all environment variables are set correctly
- Verify MongoDB connection string and IP whitelist
- Confirm HuggingFace OAuth redirect URI matches your Render URL

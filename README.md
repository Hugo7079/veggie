<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1NyPW0K6CshtA97Gx1JuVjNhjy4Sxzwfk

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

Option 1 — automatic (recommended):

1. Push your code to the `main` branch on GitHub.
2. This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds the app and deploys the generated `dist/` to the `gh-pages` branch. The workflow runs automatically on pushes to `main`.

Option 2 — manual (using gh-pages):

1. Install dependencies locally: `npm install`.
2. Run the local deploy script: `npm run deploy`.

Notes:
- The Vite config uses `base: './'` so the app will work on GitHub pages regardless of the repo name.
- If you want to customize the icons or manifest for Progressive Web App (PWA) support, replace the files under `public/icons` and `public/manifest.json` as needed.

After deployment, your site will be available at `https://<github-username>.github.io/<repo-name>/` (unless you are publishing to a user site like `username.github.io`).

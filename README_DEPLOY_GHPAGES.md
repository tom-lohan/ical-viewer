GitHub Pages deployment (Vite + gh-pages)

1. Ensure your repository is named `ical-viewer` or update `vite.config.ts` `base` to `/<your-repo-name>/`.

2. Install dev dependency:

   npm install --save-dev gh-pages

3. Build and deploy:

   npm run deploy

Notes:

- `predeploy` script runs the build, `deploy` pushes `dist` to the `gh-pages` branch.
- If you host at a user/org page (username.github.io) set `base: '/'` in `vite.config.ts`.

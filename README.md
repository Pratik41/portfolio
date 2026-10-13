# Pratik Sonkusale — Portfolio

**Live:** https://pratik-sonkusale.vercel.app

Personal portfolio of **Pratik Sonkusale**, Senior Backend Engineer (Java · Spring Boot · Microservices · Kafka · AI integration).

## Highlights

- Zero dependencies: semantic HTML, modern CSS and vanilla JS. No build step.
- Mobile-first responsive layout, tested from 320px phones to 1920px monitors with no horizontal overflow.
- Light and dark themes that follow the OS preference, with a manual toggle and no flash on load.
- Project case studies covering problem, solution, outcome, architecture flow, and engineering decisions with trade-offs.
- Interactive "periodic table" of the tech stack with category filters.
- Live GitHub repositories via the GitHub REST API, cached per session, with an offline fallback.
- Contact form delivered by [FormSubmit](https://formsubmit.co), with a spam honeypot and a mailto fallback.
- Command palette (`Ctrl/⌘ + K`) for keyboard navigation.
- Accessibility: skip link, landmarks, ARIA labels, visible focus rings, `prefers-reduced-motion` support.
- SEO: meta description, canonical URL, Open Graph and Twitter cards, JSON-LD `Person` schema, `sitemap.xml`, `robots.txt`.
- Security headers via `vercel.json`: strict CSP, HSTS, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.

## Structure

```
.
├── index.html                  # single-page portfolio
├── 404.html                    # custom 404 (served automatically by Vercel)
├── vercel.json                 # security headers, caching, clean URLs
├── assets/
│   ├── css/styles.css
│   ├── js/main.js
│   ├── img/                    # profile, favicon, OG image, touch icon
│   └── Pratik_Sonkusale_Resume.pdf
├── site.webmanifest
├── robots.txt
└── sitemap.xml
```

## Run locally

Any static file server works, for example:

```bash
npx serve .
```

## Deploy to Vercel

1. Push this folder to a GitHub repository (for example `portfolio`).
2. Go to [vercel.com/new](https://vercel.com/new), sign in with GitHub, and **Import** the repository.
3. In the import screen:
   - **Project Name:** `pratik-sonkusale` (this sets the URL `pratik-sonkusale.vercel.app`)
   - **Framework Preset:** `Other`
   - **Build Command:** leave empty
   - **Output Directory:** leave empty (the repository root is served)
4. Click **Deploy**. Every later `git push` to `main` redeploys automatically.

> If `pratik-sonkusale` is taken, Vercel assigns a different URL. In that case, replace
> `pratik-sonkusale.vercel.app` in `index.html`, `sitemap.xml` and `robots.txt`.

### After the first deploy

- **Activate the contact form:** send one test message from the live site. FormSubmit emails an
  "Activate Form" link to `pratiksonkusale55@gmail.com` (check Spam). Click it, and later messages are
  delivered normally.
- **Check the link preview:** paste the URL into the [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/).
- **Get indexed by Google:** add the site in [Google Search Console](https://search.google.com/search-console)
  and submit `sitemap.xml`.

## Maintenance note

`vercel.json` allows the small inline theme script in `index.html` by its SHA-256 hash (CSP).
If you edit that `<script>` block, recompute the hash and update `script-src` in `vercel.json`,
otherwise the browser will block it. The script still runs without the hash if the CSP header is removed.

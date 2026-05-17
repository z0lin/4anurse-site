# 4aNurse — Astro + Decap CMS Setup Guide

A complete rebuild of 4anurse.com as a **static Astro site** with **Decap CMS** for content management, deployed on your CloudPanel server.

**End result:** A blazing-fast site where adding a product takes about 30 seconds in a web admin panel — no code, no plugins, no WooCommerce, no maintenance.

---

## What's in this starter

```
4anurse-astro/
├── astro.config.mjs          # Astro config (sitemap, etc.)
├── package.json              # Dependencies
├── deploy.sh                 # Deploy script for your server
├── public/
│   ├── admin/
│   │   ├── index.html        # Decap CMS entry point
│   │   └── config.yml        # CMS schema (what fields editors see)
│   └── images/               # Product + blog images live here
└── src/
    ├── content/
    │   ├── config.ts         # Content schema (TypeScript validation)
    │   ├── products/         # One markdown file per product
    │   ├── blog/             # One markdown file per blog post
    │   └── categories/       # One markdown file per category landing page
    ├── layouts/
    │   └── BaseLayout.astro  # Header/footer/SEO meta
    ├── pages/
    │   ├── index.astro       # Homepage with featured + product grid
    │   ├── gifts/
    │   │   └── [category].astro   # Dynamic category landing pages (SEO)
    │   ├── blog/
    │   │   ├── index.astro   # Blog index (featured post + grid + newsletter)
    │   │   └── [slug].astro  # Individual blog post + related posts
    │   └── rss.xml.js        # RSS feed
    └── styles/
        └── global.css        # All styling
```

## Features included

### Homepage
- **Editor's Picks featured section** — up to 4 highlighted products with custom badges ("Top Pick", "Best Value", "Grad Gift", "Splurge")
- **Product grid with prices** displayed inline
- **#ad labels** on every product card (FTC + Amazon Associates compliant)
- **Category filters** — graduation links to a dedicated landing page; others filter in place

### Category landing pages (`/gifts/graduation/`)
- **SEO-optimized** with intro content, H2 headings, FAQ schema
- **Price range filters** (Under $25, $25–50, $50–100, $100+)
- **Breadcrumb navigation**
- Auto-pulls all products in that category, sorted by price

### Blog
- **Featured post** displayed prominently at top
- **Recent posts grid** with category tags and read times
- **Individual post template** with breadcrumb, lede paragraph, hero image, related posts, and embedded product cards
- **Newsletter signup** (connects to Buttondown/ConvertKit/Mailchimp)
- **RSS feed** auto-generated

### CMS
- **Visual editor** at `/admin` — no code needed
- **Products**: title, image, Amazon URL, price (display + numeric), category, featured toggle, badge, blurb, date
- **Blog posts**: full markdown editor, category dropdown, hero image, read time, featured toggle, draft mode
- **Categories**: title, description, FAQ items for the landing page

---

## Part 1: Local setup (do this once, on your laptop)

### 1. Install Node.js
If you don't have it: download from [nodejs.org](https://nodejs.org) (LTS version).

### 2. Get the project running locally
```bash
cd 4anurse-astro
npm install
npm run dev
```
Open http://localhost:4321 — you should see the site with sample products.

### 3. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/4anurse-site.git
git push -u origin main
```

---

## Part 2: Deploy to CloudPanel

### 1. Create the site in CloudPanel
- **Sites → Add Site → Create a Static Site**
- Domain: `4anurse.com` (or use a staging subdomain first)

### 2. SSH in and clone the repo
```bash
ssh 4anurse@your-server-ip
cd ~
git clone https://github.com/YOUR_USERNAME/4anurse-site.git
cd 4anurse-site
```

### 3. Install Node on the server (if not already there)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 4. First build & deploy
```bash
npm ci
npm run build
rsync -a --delete dist/ ~/htdocs/4anurse.com/
```

### 5. Enable HTTPS
CloudPanel: **Site → SSL/TLS → New Let's Encrypt Certificate**

### 6. Nginx performance tweaks
In **Site → Vhost**, add inside the `server` block:
```nginx
location ~* \.(css|js|jpg|jpeg|png|gif|webp|avif|svg|woff2|ico)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
}
gzip_static on;
brotli_static on;
```

---

## Part 3: Set up Decap CMS

This gives you a no-code admin panel at `4anurse.com/admin`.

### 1. Set up Netlify Identity (free auth provider)
- Sign up at [netlify.com](https://netlify.com)
- Create a new empty site
- **Site settings → Identity → Enable Identity**
- **Registration preferences → Invite only**
- **Identity → Services → Git Gateway → Enable**

### 2. Add the Netlify Identity widget
In `src/layouts/BaseLayout.astro` add to `<head>`:
```html
<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
<script is:inline>
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", user => {
      if (!user) {
        window.netlifyIdentity.on("login", () => {
          document.location.href = "/admin/";
        });
      }
    });
  }
</script>
```

### 3. Invite yourself
Netlify → Identity → **Invite users** → your email → check inbox → set password.

### 4. Visit `4anurse.com/admin`
Log in. You'll see three collections: **Products**, **Blog Posts**, **Categories**.

---

## Part 4: Daily workflow

### Adding a product
1. Go to `4anurse.com/admin`
2. Click **Products → New Product**
3. Title, upload image, paste Amazon URL (with your `?tag=4anurse05-20`)
4. Price: `$24.99` (display) and `24.99` (numeric, for filtering)
5. Pick category
6. Toggle "Featured on homepage" if you want it in the Editor's Picks section
7. Pick a badge (Top Pick / Best Value / Grad Gift / Splurge / etc.)
8. Click Publish — site rebuilds in ~60 seconds

### Writing a blog post
1. **Blog Posts → New Post**
2. Title, description (used for SEO + previews)
3. Upload hero image (1600x900 recommended)
4. Pick category (Gift Guide, Buying Guide, Self-Care, etc.)
5. Add read time (e.g. "8 min read")
6. Toggle "Featured" if you want it as the big card on the blog index
7. Write in markdown
8. Click Publish

### Creating a category landing page
1. **Categories → New Category**
2. Title (e.g. "Nursing Graduation Gifts" — this becomes the H1)
3. Label (e.g. "Graduation" — used in breadcrumb)
4. categoryId — must match a product category exactly (e.g. `graduation`)
5. Description (shown under the H1, used for SEO meta)
6. Add 3-5 FAQ items — these get rendered with accordion UI and help with Google rich snippets
7. Write intro content in markdown
8. Publish — page appears at `/gifts/[categoryId]`

---

## Part 5: Auto-rebuild on publish

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to CloudPanel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - name: Deploy via SSH
        uses: easingthemes/ssh-deploy@main
        with:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_KEY }}
          REMOTE_HOST: ${{ secrets.SERVER_IP }}
          REMOTE_USER: 4anurse
          SOURCE: "dist/"
          TARGET: "/home/4anurse/htdocs/4anurse.com/"
          ARGS: "-rltgoDzvO --delete"
```
Add `SSH_KEY` and `SERVER_IP` as GitHub secrets. Every publish triggers a rebuild + deploy within 60 seconds.

---

## Part 6: Newsletter setup

The blog index includes a newsletter form. To connect it:

**Buttondown** (cheapest, $9/mo, fewer features):
Edit `src/pages/blog/index.astro` and change the form action:
```html
<form class="newsletter-form" action="https://buttondown.email/api/emails/embed-subscribe/YOUR_USERNAME" method="post" target="_blank">
```

**ConvertKit / Kit** (better for affiliate sites, free up to 10k subs):
1. Sign up at kit.com
2. Create a form → embed → copy the action URL
3. Paste into the form

**Mailchimp**:
Same idea — use their embedded form HTML.

---

## Part 7: Migrating from WordPress

### Blog posts
1. WordPress admin: **Tools → Export → Posts** (downloads XML)
2. Use [wordpress-export-to-markdown](https://github.com/lonekorean/wordpress-export-to-markdown)
3. Drop resulting `.md` files into `src/content/blog/`

### Products
Easier to re-add via the CMS. You have a few dozen at most — an hour of work.

### URL redirects (preserve SEO)
In CloudPanel **Vhost**:
```nginx
location = /old-product-url/ { return 301 /; }
location = /news/ { return 301 /blog/; }
```

---

## What this gives you vs WordPress

| Thing | Before | After |
|---|---|---|
| Page load | 5-10s | <1s |
| Maintenance | Constant updates | Basically zero |
| Adding a product | Log in, fight WooCommerce | Paste URL in admin |
| Database | MySQL | None |
| Security surface | Huge | Tiny (static HTML) |
| Plugin costs | Various | $0 |
| SEO | Mediocre | Strong (FAQ schema, fast LCP) |

---

## Need help?

Standard Astro project — any developer on Upwork can work on it for $40-80/hr. Total outsourced setup: 4-6 hours, ~$200-500 one-time. After that it runs for years without touching anything technical.

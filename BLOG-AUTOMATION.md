# Automated blog writer

A scheduled Hermes job on Matt's PC writes one post at a time from
`blog-queue.json` and publishes it through the normal deploy (push to `main`).
It runs on Matt's machine, not the TNN n8n server, so 4aNurse stays separable
from TNN.

- **Cron job:** "4aNurse blog writer", checks daily at 8:00 AM ET. A
  no-AI pre-check (`%LOCALAPPDATA%\hermes\scripts\fouranurse_blog_precheck.py`)
  pulls the repo and runs `node scripts/blog-queue.mjs --next`. If nothing is
  due, the job stops there at no cost.
- **Working copy:** `C:\Users\Matt\Documents\4anurse-blog-bot\4anurse-site`
  (a dedicated clone; never edit it by hand).
- **Pacing:** twice a week until Dec 21, then weekly (`pace` in the queue).
- **Review:** the first 3 posts open as GitHub pull requests for Matt to merge
  (`reviewFirst`). After that the writer pushes straight to `main`.
- **Notifications:** every post (or failure) goes to Matt on Telegram.

## The queue

`blog-queue.json` holds ordered topics with a publish window (`after`,
`before`), a category, the product facets to draw from (`focus`), and an
`angle`. Seasonal items that miss their window are skipped, never written
late. The bot marks items `done` itself.

```bash
node scripts/blog-queue.mjs --status            # whole queue
node scripts/blog-queue.mjs --next              # what would run today
node scripts/blog-queue.mjs --candidates <id>   # product pages the post may link
```

When `--next` reports `lowWater: true` (4 or fewer upcoming topics), the
Telegram notice says so. Add topics by appending items; keep titles naming a
product type or specialty, because the build's product block matches on the
title, description and category (check with
`node scripts/new-post.mjs "<title>" --category "<cat>" --preview`).

## How a post is written (the job's checklist)

1. `git pull`, then `node scripts/blog-queue.mjs --next` and
   `--candidates <id>`.
2. Read `BLOG-BACKLOG.md` (saturated themes to avoid repeating) and the
   existing posts closest to the topic, so the new post adds something new.
3. Write `src/content/blog/<today>-<slug>.md` with frontmatter:
   `title`, `description` (110 to 170 characters, names the main product
   types), `pubDate` (today), `category` (from the queue item), `readTime`,
   `featured: false`, `draft: false`.
4. Body rules:
   - 1,000 to 1,500 words. Answer the reader's question in the first two
     sentences. At least 4 `##` sections organized around the buyer
     (who is giving, to whom, at what budget), not a product dump.
   - Link 5 to 8 product pages from `--candidates` with markdown links to
     `/gift/<slug>/`, describing each in your own words. Link at least one
     category, hub or budget page (`/gifts/<category>/`,
     `/nurse-christmas-gifts/`, `/nurse-gifts-under-25/`, and so on). Every
     internal link ends with `/`.
   - Never paste Amazon links; the build adds product cards with the
     affiliate tag automatically.
   - No em or en dashes. No hyphen-joined words in prose ("full time",
     "night shift", "12 hour shift"). No dollar amounts (say "budget",
     "under 25 dollars" only by linking the budget page). No claims of
     testing or owning products. No clinical or medical efficacy claims.
     No hype phrases. American English, warm, plain, specific to nursing life.
   - Only state product details the gift page or product title supports.
5. `node scripts/check-post.mjs <file>` must PASS, then `npm run build`
   must end with `Complete!`.
6. `node scripts/blog-queue.mjs --done <id> <file>`.
7. Publish:
   - mode `pr`: branch `blog/<id>`, commit, push, `gh pr create`; send Matt
     the PR link and the preview of the post.
   - mode `publish`: commit to `main` and push; wait for the deploy run;
     confirm the live URL returns 200; submit it to IndexNow (OpenSEO project
     `70f82bb6-c275-44c0-8238-27c981cd11c1`).
8. Telegram Matt: title, live URL or PR link, products linked, queue status.

On any failure: do not publish; leave the working copy clean
(`git checkout -- . && git clean -fd`), and report the error on Telegram.

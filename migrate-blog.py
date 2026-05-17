#!/usr/bin/env python3
"""
migrate-blog.py — Extract WordPress blog posts from SQL dump and write to Astro markdown.

Usage:
  python3 migrate-blog.py              # preview: lists posts, writes nothing
  python3 migrate-blog.py --run        # writes all posts to src/content/blog/
"""

import gzip, re, os, sys
from datetime import datetime

SQL_DUMP   = '/tmp/4anurse.sql.gz'
OUTPUT_DIR = 'src/content/blog'

COL_NAMES = [
    'ID','post_author','post_date','post_date_gmt','post_content','post_title',
    'post_excerpt','post_status','comment_status','ping_status','post_password',
    'post_name','to_ping','pinged','post_modified','post_modified_gmt',
    'post_content_filtered','post_parent','guid','menu_order','post_type',
    'post_mime_type','comment_count'
]


def parse_values(s):
    rows = []
    i, n = 0, len(s)
    while i < n:
        if s[i] != '(':
            i += 1
            continue
        i += 1
        fields, field, in_str = [], [], False
        while i < n:
            c = s[i]
            if in_str:
                if c == '\\' and i + 1 < n:
                    nxt = s[i + 1]
                    field.append({'n':'\n','t':'\t','r':'\r'}.get(nxt, nxt))
                    i += 2
                    continue
                elif c == "'":
                    in_str = False
                else:
                    field.append(c)
            else:
                if c == "'":
                    in_str = True
                elif s[i:i+4] == 'NULL':
                    fields.append('')
                    field = []
                    i += 4
                    continue
                elif c == ',':
                    fields.append(''.join(field))
                    field = []
                elif c == ')':
                    fields.append(''.join(field))
                    rows.append(fields)
                    break
                else:
                    field.append(c)
            i += 1
        i += 1
    return rows


def strip_leading_h1(html):
    """Remove a leading <h1> tag if it duplicates the post title."""
    return re.sub(r'^\s*<h1[^>]*>.*?</h1>\s*', '', html, count=1, flags=re.DOTALL|re.IGNORECASE)


def html_to_markdown(html):
    """Best-effort HTML → markdown. Handles the most common WordPress block tags."""
    # Strip Gutenberg block comments
    text = re.sub(r'<!-- /?wp:[^>]* ?/?-->', '', html)
    # Headings
    for level in range(6, 0, -1):
        text = re.sub(rf'<h{level}[^>]*>(.*?)</h{level}>', lambda m, l=level: '\n' + '#'*l + ' ' + re.sub('<[^>]+>', '', m.group(1)) + '\n', text, flags=re.DOTALL|re.IGNORECASE)
    # Bold / italic
    text = re.sub(r'<strong[^>]*>(.*?)</strong>', r'**\1**', text, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<em[^>]*>(.*?)</em>', r'*\1*', text, flags=re.DOTALL|re.IGNORECASE)
    # Links
    text = re.sub(r'<a [^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', r'[\2](\1)', text, flags=re.DOTALL|re.IGNORECASE)
    # Images
    text = re.sub(r'<img [^>]*alt=["\']([^"\']*)["\'][^>]*src=["\']([^"\']+)["\'][^>]*/?>',  r'![\1](\2)', text, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<img [^>]*src=["\']([^"\']+)["\'][^>]*alt=["\']([^"\']*)["\'][^>]*/?>',  r'![\2](\1)', text, flags=re.DOTALL|re.IGNORECASE)
    # Lists
    text = re.sub(r'<li[^>]*>(.*?)</li>', lambda m: '- ' + re.sub('<[^>]+>', '', m.group(1)).strip(), text, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<[uo]l[^>]*>|</[uo]l>', '', text, flags=re.IGNORECASE)
    # Paragraphs / line breaks
    text = re.sub(r'</p>', '\n\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<br\s*/?>',  '\n', text, flags=re.IGNORECASE)
    # Strip remaining tags
    text = re.sub(r'<[^>]+>', '', text)
    # Decode common HTML entities
    for ent, ch in [('&amp;','&'),('&lt;','<'),('&gt;','>'),('&quot;','"'),('&#8217;',"'"),
                    ('&#8216;',"'"),('&#8220;','"'),('&#8221;','"'),('&#8230;','…'),('&nbsp;',' ')]:
        text = text.replace(ent, ch)
    # Collapse excessive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def slugify(text):
    t = text.lower()
    t = re.sub(r'[^\w\s-]', '', t)
    t = re.sub(r'[\s_]+', '-', t)
    t = re.sub(r'-+', '-', t)
    return t.strip('-')[:60]


def yaml_str(s):
    s = s.replace('\\', '\\\\').replace('"', '\\"')
    return f'"{s}"'


def guess_category(title, content):
    tl = (title + ' ' + content[:200]).lower()
    if any(k in tl for k in ['graduation', 'grad', 'nclex', 'pinning']):
        return 'Graduation'
    if any(k in tl for k in ['christmas', 'holiday', 'stocking', 'secret santa', 'thanksgiving', 'easter', 'halloween', 'valentine']):
        return 'Holiday'
    if any(k in tl for k in ['nurses week', "nurse's week", 'appreciation']):
        return 'Nurses Week'
    if any(k in tl for k in ['self-care', 'burnout', 'spa', 'relax', 'wellness', 'mental health', 'sleep']):
        return 'Self-Care'
    if any(k in tl for k in ['personali', 'custom', 'monogram', 'engrav']):
        return 'Personalization'
    if any(k in tl for k in ['buying guide', 'what to buy', 'how to', 'where to', 'tips']):
        return 'Buying Guide'
    return 'Gift Guide'


def load_posts():
    with gzip.open(SQL_DUMP, 'rt', encoding='utf-8', errors='replace') as f:
        content = f.read()

    positions = [m.start() for m in re.finditer(r'INSERT INTO `wp_posts` VALUES ', content)]
    posts = []
    for i, pos in enumerate(positions):
        # Each INSERT block is up to ~1MB; find the next INSERT or end of file as the boundary
        next_pos = positions[i + 1] if i + 1 < len(positions) else len(content)
        chunk = content[pos:next_pos]
        # Find the last semicolon in this chunk (end of VALUES clause)
        end = chunk.rfind(';')
        block = chunk[len('INSERT INTO `wp_posts` VALUES '):end]
        for row in parse_values(block):
            if len(row) >= 21:
                d = dict(zip(COL_NAMES, row))
                if d.get('post_type') == 'post' and d.get('post_status') == 'publish':
                    posts.append(d)
    return posts


def convert(post):
    title    = post['post_title'].strip()
    raw_date = post['post_date'][:10]  # YYYY-MM-DD
    content  = post['post_content']
    excerpt  = re.sub('<[^>]+>', '', post.get('post_excerpt', '')).strip()

    description = excerpt or re.sub('<[^>]+>', '', content)[:160].strip()
    description = re.sub(r'\s+', ' ', description)

    body     = html_to_markdown(strip_leading_h1(content))
    category = guess_category(title, content)
    slug     = f"{raw_date}-{slugify(title)}"

    lines = [
        '---',
        f'title: {yaml_str(title)}',
        f'description: {yaml_str(description)}',
        f'pubDate: {raw_date}',
        f'category: "{category}"',
        'readTime: "5 min read"',
        'featured: false',
        'draft: false',
        '---',
        '',
        body,
    ]
    return slug, '\n'.join(lines)


def preview(posts):
    print(f"{'='*60}")
    print(f"PREVIEW — first post")
    print(f"{'='*60}")
    slug, md = convert(posts[0])
    print(md[:600] + '\n...')
    print(f"\n{'='*60}")
    print(f"Total posts to migrate: {len(posts)}")
    from collections import Counter
    cats = Counter(guess_category(p['post_title'], p['post_content']) for p in posts)
    print("Category breakdown:")
    for cat, n in cats.most_common():
        print(f"  {cat:20s} {n}")
    print(f"\nRun with --run to write all files to {OUTPUT_DIR}/")


def run(posts):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    seen, written, skipped = {}, 0, 0
    for post in posts:
        slug, md = convert(post)
        if slug in seen:
            seen[slug] += 1
            slug = f"{slug}-{seen[slug]}"
        else:
            seen[slug] = 1
        path = os.path.join(OUTPUT_DIR, f"{slug}.md")
        if os.path.exists(path):
            skipped += 1
            continue
        with open(path, 'w', encoding='utf-8') as f:
            f.write(md)
        written += 1
    print(f"Done. {written} posts written, {skipped} skipped (already exist).")


if __name__ == '__main__':
    posts = load_posts()
    if '--run' in sys.argv:
        run(posts)
    else:
        preview(posts)

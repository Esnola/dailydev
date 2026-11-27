// Run: node server.mjs (lee DAILY_TOKEN de .env)  → http://localhost:3000
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';

process.loadEnvFile(new URL('.env', import.meta.url));

const API = 'https://api.daily.dev/public/v1';

const postCache = new Map();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.json': 'application/json; charset=utf-8',
};

function findPostNode(obj, id) {
  if (!obj || typeof obj !== 'object') return null;
  if (obj.id === id && (obj.sharedPost || obj.image || obj.title)) return obj;
  for (const val of Array.isArray(obj) ? obj : Object.values(obj)) {
    const found = findPostNode(val, id);
    if (found) return found;
  }
  return null;
}

async function enrichPost(post) {
  const needsEnrich =
    !post.title?.trim() ||
    !post.image ||
    post.image.includes('/public/Placeholder');

  if (!needsEnrich || !post.commentsPermalink) return post;
  if (postCache.has(post.id)) return { ...post, ...postCache.get(post.id) };

  try {
    const res = await fetch(post.commentsPermalink, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return post;
    const html = await res.text();

    let patch = {};
    const nextMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (nextMatch) {
      const nextData = JSON.parse(nextMatch[1]);
      const node = findPostNode(nextData, post.id);
      const target = node?.sharedPost || node;
      if (target) {
        if (!post.title?.trim() && target.title) patch.title = target.title;
        if ((!post.image || post.image.includes('/public/Placeholder')) && target.image) {
          patch.image = target.image;
        }
        if (!post.readTime && target.readTime) patch.readTime = target.readTime;
        if (!post.summary && target.summary) patch.summary = target.summary;
        if (!post.url && target.permalink) patch.url = target.permalink;
      }
    }

    if (!patch.image && (!post.image || post.image.includes('/public/Placeholder'))) {
      const ogImg = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);
      if (ogImg?.[1]) patch.image = ogImg[1];
    }
    if (!patch.title && !post.title?.trim()) {
      const ogTitle = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i);
      if (ogTitle?.[1]) patch.title = ogTitle[1].replace(/\s*\|\s*daily\.dev\s*$/i, '');
    }

    postCache.set(post.id, patch);
    return { ...post, ...patch };
  } catch {
    return post;
  }
}

createServer(async (req, res) => {
  if (req.url.startsWith('/api/')) {
    const r = await fetch(API + req.url.slice(4), {
      headers: { Authorization: `Bearer ${process.env.DAILY_TOKEN}` },
    });
    const text = await r.text();

    if (r.ok && (req.url.startsWith('/api/feeds/') || req.url.startsWith('/api/posts/'))) {
      try {
        const json = JSON.parse(text);
        if (Array.isArray(json.data)) {
          json.data = await Promise.all(json.data.map(enrichPost));
        } else if (json.data && typeof json.data === 'object') {
          json.data = await enrichPost(json.data);
        }
        res.writeHead(r.status, { 'content-type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify(json));
      } catch {
        // fall through to raw response
      }
    }

    res.writeHead(r.status, { 'content-type': 'application/json; charset=utf-8' });
    return res.end(text);
  }
  const urlPath = req.url.split('?')[0];
  const filePath = urlPath === '/' ? 'dist/index.html' : `dist${urlPath}`;
  try {
    const content = await readFile(new URL(filePath, import.meta.url));
    const mime = MIME_TYPES[extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, { 'content-type': mime });
    return res.end(content);
  } catch {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(await readFile(new URL('dist/index.html', import.meta.url)));
  }
}).listen(3000, () => console.log('http://localhost:3000'));

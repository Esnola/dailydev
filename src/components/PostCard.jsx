import { useState } from 'react';
import { ChatIcon, CheckIcon, ExternalIcon, LinkIcon, UpvoteIcon } from './Icons.jsx';

export const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" fill="none">
      <rect width="640" height="360" fill="#1c1f26"/>
      <circle cx="320" cy="180" r="36" fill="#2d323c"/>
      <path d="M306 168h28v24h-28z" stroke="#a8b3cf" stroke-width="2" fill="none"/>
    </svg>`
  );

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return dateFmt.format(d);
}

function formatCount(n = 0) {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}K` : String(n);
}

export function CardSkeleton() {
  return (
    <div className="flex h-[25rem] flex-col gap-3 rounded-2xl border border-[#2d323c] bg-[#1c1f26] p-3" aria-hidden>
      <div className="h-8 w-8 animate-pulse rounded-full bg-[#2d323c]" />
      <div className="h-5 w-11/12 animate-pulse rounded-md bg-[#2d323c]" />
      <div className="h-5 w-2/3 animate-pulse rounded-md bg-[#2d323c]" />
      <div className="mt-auto h-40 animate-pulse rounded-xl bg-[#2d323c]" />
      <div className="h-8 w-1/2 animate-pulse rounded-lg bg-[#2d323c]" />
    </div>
  );
}

export default function PostCard({ post, onNavigate }) {
  const href = `/post/${post.id}`;
  const title = post.title?.trim() || post.summary?.trim() || post.source?.name || 'Untitled';
  const sourceName = post.source?.name ?? '';
  const meta = [formatDate(post.createdAt), post.readTime && `${post.readTime}m read`]
    .filter(Boolean)
    .join(' • ');
  const tags = Array.isArray(post.tags) ? post.tags.slice(0, 3) : [];

  const [imgSrc, setImgSrc] = useState(post.image || FALLBACK_IMAGE);
  const [copied, setCopied] = useState(false);

  const openPost = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate(href);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(post.commentsPermalink || `${location.origin}${href}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const action =
    'relative z-10 inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg px-2 text-[13px] font-bold text-[#a8b3cf] transition active:scale-95';

  return (
    <article className="group relative flex h-full min-h-[25rem] flex-col rounded-2xl border border-[#2d323c] bg-[#1c1f26] p-3 transition duration-200 hover:-translate-y-0.5 hover:border-[#525866] hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      <div className="flex h-8 items-center gap-2">
        {post.source?.image ? (
          <img
            src={post.source.image}
            alt=""
            loading="lazy"
            className="h-8 w-8 shrink-0 rounded-full bg-[#2d323c] object-cover"
          />
        ) : (
          <span className="h-8 w-8 shrink-0 rounded-full bg-[#2d323c]" />
        )}
        <span className="sr-only">{sourceName}</span>
        {post.url && (
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 ml-auto inline-flex h-8 items-center gap-1 rounded-lg bg-white px-3 text-[13px] font-bold text-[#0e1217] opacity-0 transition hover:bg-[#cfd6e6] focus-visible:opacity-100 active:scale-95 group-hover:opacity-100"
          >
            Read post <ExternalIcon width={14} height={14} />
          </a>
        )}
      </div>

      <h2 className="mt-2 px-1 text-[19px] font-bold leading-[1.35] text-white">
        <a
          href={href}
          onClick={openPost}
          className="line-clamp-3 break-words outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-white"
        >
          {title}
        </a>
      </h2>

      <div className="mt-auto px-1 pt-2">
        {tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-lg border border-[#383d47] px-2 py-0.5 text-xs text-[#a8b3cf]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        {meta && <p className="text-[13px] text-[#a8b3cf]">{meta}</p>}
      </div>

      <div className="mt-2 h-40 overflow-hidden rounded-xl bg-[#2d323c]">
        <img
          src={imgSrc}
          alt=""
          loading="lazy"
          onError={() => imgSrc !== FALLBACK_IMAGE && setImgSrc(FALLBACK_IMAGE)}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className={`${action} cursor-default`} title="Upvotes">
          <UpvoteIcon />
          {formatCount(post.numUpvotes)}
          <span className="sr-only">upvotes</span>
        </span>
        <a href={href} onClick={openPost} className={`${action} hover:bg-[#2cdce6]/15 hover:text-[#2cdce6]`}>
          <ChatIcon />
          {formatCount(post.numComments)}
          <span className="sr-only">comments</span>
        </a>
        <button
          type="button"
          onClick={copyLink}
          aria-label={copied ? 'Link copied' : 'Copy link'}
          className={`${action} ${copied ? 'text-[#39e58c]' : 'hover:bg-[#427ef7]/15 hover:text-[#427ef7]'}`}
        >
          {copied ? <CheckIcon /> : <LinkIcon />}
        </button>
      </div>
    </article>
  );
}

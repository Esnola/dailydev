import { useState } from 'react';

export const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" fill="none">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1c1f26"/>
          <stop offset="100%" stop-color="#0e1217"/>
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill="url(#g)"/>
      <circle cx="320" cy="180" r="36" fill="#2d323e"/>
      <path d="M306 168h28v24h-28z" stroke="#a8b3cf" stroke-width="2" fill="none"/>
    </svg>`
  );

export default function PostCard({ post, onNavigate }) {
  const href = `/post/${post.id}`;
  const titleText =
    post.title?.trim() || post.summary?.trim() || post.source?.name || 'Sin título';
  const sourceName = post.source?.name ?? '';
  const readTime = post.readTime ? `${post.readTime} min read` : null;
  const tags = Array.isArray(post.tags) ? post.tags.slice(0, 3) : [];

  const [imgSrc, setImgSrc] = useState(post.image || FALLBACK_IMAGE);

  const handleClick = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate(href);
  };

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-[#2d323e] bg-[#1c1f26] p-3 transition duration-200 hover:border-[#525866] hover:bg-[#22262f]">
      <div>
        <a
          href={href}
          onClick={handleClick}
          className="block aspect-video w-full overflow-hidden rounded-xl border border-[#2d323e]/70 bg-[#0e1217]"
        >
          <img
            src={imgSrc}
            alt={titleText}
            loading="lazy"
            onError={() => {
              if (imgSrc !== FALLBACK_IMAGE) setImgSrc(FALLBACK_IMAGE);
            }}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        </a>

        <div className="mt-3.5 px-1">
          <div className="mb-2 flex items-center gap-2 text-xs text-[#a8b3cf]">
            {post.source?.image && (
              <img
                src={post.source.image}
                alt={sourceName}
                loading="lazy"
                className="h-5 w-5 shrink-0 rounded-full border border-[#2d323e] object-cover"
              />
            )}
            {sourceName && <span className="truncate font-medium text-[#d2d8e6]">{sourceName}</span>}
            {readTime && (
              <>
                <span className="text-[#525866]">•</span>
                <span className="shrink-0">{readTime}</span>
              </>
            )}
          </div>

          <h2 className="text-[17px] font-bold leading-snug text-white">
            <a
              href={href}
              onClick={handleClick}
              className="line-clamp-2 transition-colors group-hover:text-[#e879f9]"
            >
              {titleText}
            </a>
          </h2>

          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-[#2d323e] bg-[#0e1217]/70 px-2 py-0.5 text-[11px] font-medium text-[#a8b3cf]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#2d323e]/80 px-1 pt-2.5 text-xs font-medium text-[#a8b3cf]">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 rounded-lg bg-[#0e1217]/60 px-2 py-1 text-[#d2d8e6]">
            <span className="text-[#ce3df3]">▲</span> {post.numUpvotes ?? 0}
          </span>
          <span className="inline-flex items-center gap-1">
            💬 {post.numComments ?? 0}
          </span>
        </div>
        <a
          href={href}
          onClick={handleClick}
          className="text-xs font-semibold text-[#a8b3cf] transition hover:text-white"
        >
          Leer →
        </a>
      </div>
    </article>
  );
}

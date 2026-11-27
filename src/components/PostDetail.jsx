import { Fragment, useEffect, useState } from 'react';
import { FALLBACK_IMAGE } from './PostCard.jsx';

function renderInline(text) {
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|`[^`]+`)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(
        <strong key={key++} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`')) {
      parts.push(
        <code
          key={key++}
          className="rounded bg-[#0e1217] px-1.5 py-0.5 font-mono text-xs text-[#e879f9]"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('[')) {
      const m = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (m) {
        parts.push(
          <a
            key={key++}
            href={m[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#e879f9] underline decoration-[#e879f9]/40 underline-offset-2 hover:text-white"
          >
            {m[1]}
          </a>
        );
      }
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.map((p, i) => <Fragment key={i}>{p}</Fragment>);
}

function MarkdownContent({ content }) {
  const blocks = content.split(/\n{2,}/);
  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-[#d2d8e6]">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (imgMatch) {
          return (
            <img
              key={idx}
              src={imgMatch[2]}
              alt={imgMatch[1] || 'Imagen del artículo'}
              loading="lazy"
              className="w-full rounded-xl border border-[#2d323e] object-cover"
            />
          );
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="pt-2 text-lg font-bold text-white">
              {renderInline(trimmed.slice(4))}
            </h3>
          );
        }

        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className="pt-3 text-xl font-bold text-white">
              {renderInline(trimmed.slice(3))}
            </h2>
          );
        }

        const lines = trimmed.split('\n');
        if (lines.every((l) => l.trim().startsWith('- '))) {
          return (
            <ul key={idx} className="list-disc space-y-1.5 pl-5 text-[#d2d8e6]">
              {lines.map((l, li) => (
                <li key={li}>{renderInline(l.trim().slice(2))}</li>
              ))}
            </ul>
          );
        }

        return <p key={idx}>{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}

export default function PostDetail({ postId, onBack }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPost(null);

    fetch(`/api/posts/${encodeURIComponent(postId)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then(({ data }) => {
        if (cancelled) return;
        setPost(data);
        setImgSrc(data?.image || FALLBACK_IMAGE);
      })
      .catch((err) => {
        if (!cancelled) setError(`No se pudo cargar el post (${err.message}).`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [postId]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#2d323e] bg-[#1c1f26] px-4 py-2 text-sm font-semibold text-[#d2d8e6] transition hover:border-[#525866] hover:bg-[#22262f] hover:text-white"
      >
        ← Volver al feed
      </button>

      {loading && (
        <div className="animate-pulse space-y-4 rounded-2xl border border-[#2d323e] bg-[#1c1f26] p-6">
          <div className="aspect-video w-full rounded-xl bg-[#0e1217]" />
          <div className="h-8 w-3/4 rounded-lg bg-[#2d323e]" />
          <div className="h-4 w-1/2 rounded-lg bg-[#2d323e]" />
          <div className="h-32 w-full rounded-xl bg-[#0e1217]" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && post && (
        <article className="overflow-hidden rounded-2xl border border-[#2d323e] bg-[#1c1f26]">
          <div className="aspect-video w-full overflow-hidden border-b border-[#2d323e] bg-[#0e1217]">
            <img
              src={imgSrc || FALLBACK_IMAGE}
              alt={post.title || 'Post image'}
              onError={() => {
                if (imgSrc !== FALLBACK_IMAGE) setImgSrc(FALLBACK_IMAGE);
              }}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[#a8b3cf]">
                {post.source?.name && (
                  <div className="flex items-center gap-2">
                    {post.source.image && (
                      <img
                        src={post.source.image}
                        alt={post.source.name}
                        className="h-6 w-6 rounded-full border border-[#2d323e] object-cover"
                      />
                    )}
                    <span className="font-semibold text-white">{post.source.name}</span>
                  </div>
                )}
                {post.author?.name && (
                  <>
                    <span className="text-[#525866]">•</span>
                    <span>{post.author.name}</span>
                  </>
                )}
                {post.readTime && (
                  <>
                    <span className="text-[#525866]">•</span>
                    <span>{post.readTime} min read</span>
                  </>
                )}
              </div>

              <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                {post.title?.trim() || post.summary?.trim() || post.source?.name || 'Sin título'}
              </h1>

              {Array.isArray(post.tags) && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg border border-[#2d323e] bg-[#0e1217]/70 px-2.5 py-1 text-xs font-medium text-[#a8b3cf]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {post.summary && (
              <div className="rounded-xl border border-[#2d323e] bg-[#0e1217]/70 p-4 text-sm leading-relaxed text-[#d2d8e6]">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#ce3df3]">
                  Resumen
                </span>
                {post.summary}
              </div>
            )}

            {post.content && <MarkdownContent content={post.content} />}

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#2d323e] pt-5">
              <div className="flex items-center gap-3 text-sm font-medium text-[#a8b3cf]">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#2d323e] bg-[#0e1217]/60 px-3 py-1.5 text-white">
                  <span className="text-[#ce3df3]">▲</span> {post.numUpvotes ?? 0}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#2d323e] bg-[#0e1217]/60 px-3 py-1.5">
                  💬 {post.numComments ?? 0} comentarios
                </span>
              </div>

              {post.url && (
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#0e1217] transition hover:bg-[#e2e8f0]"
                >
                  Leer artículo original ↗
                </a>
              )}
            </div>
          </div>
        </article>
      )}
    </main>
  );
}

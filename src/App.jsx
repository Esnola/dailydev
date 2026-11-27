import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import PostCard, { CardSkeleton } from './components/PostCard.jsx';
import Sidebar from './components/Sidebar.jsx';
import PostDetail from './components/PostDetail.jsx';

function getPostIdFromPath(pathname) {
  const match = pathname.match(/^\/post\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function App() {
  const [feed, setFeed] = useState('discussed');
  const [posts, setPosts] = useState([]);
  const [cursor, setCursor] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const sentinelRef = useRef(null);
  const [pathname, setPathname] = useState(() => window.location.pathname);

  const postId = getPostIdFromPath(pathname);

  const navigate = useCallback((to) => {
    if (window.location.pathname !== to) {
      window.history.pushState({}, '', to);
    }
    setPathname(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const loadFeed = useCallback(async (selectedFeed, nextCursor, reset) => {
    setLoading(true);
    setError(null);
    if (reset) {
      setPosts([]);
      setCursor(undefined);
    }

    try {
      const q = new URLSearchParams({ limit: 20, ...(nextCursor && { cursor: nextCursor }) });
      const res = await fetch(`/api/feeds/${selectedFeed}?${q}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const { data = [], pagination } = await res.json();

      setPosts((prev) => (reset ? data : [...prev, ...data]));
      setCursor(pagination?.hasNextPage ? pagination.cursor : undefined);
    } catch (err) {
      setError(`Could not load the feed (${err.message}).`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed(feed, undefined, true);
  }, [feed, loadFeed]);

  const handleFeedChange = (nextFeed) => {
    setFeed(nextFeed);
    if (postId) navigate('/');
    else window.scrollTo({ top: 0 });
  };

  // Infinite scroll: load the next page when the sentinel comes into view.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !cursor || loading || postId || query) return;
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && loadFeed(feed, cursor, false),
      { rootMargin: '600px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [cursor, loading, feed, postId, query, loadFeed]);

  const visiblePosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) =>
      [p.title, p.summary, p.source?.name, ...(p.tags ?? [])]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [posts, query]);

  return (
    <>
      <Header
        query={query}
        onQueryChange={(v) => {
          setQuery(v);
          if (postId) navigate('/');
        }}
        onLogoClick={() => handleFeedChange(feed)}
      />
      <Sidebar feed={feed} onFeedChange={handleFeedChange} showActive={!postId} />

      <div className="pb-20 lg:pb-0 lg:pl-60">
        {postId ? (
          <PostDetail postId={postId} onBack={() => navigate('/')} />
        ) : (
          <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-8">
            {error && (
              <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-[#e04337]/40 bg-[#e04337]/10 px-4 py-3 text-sm text-[#ff8e8e]">
                {error}
                <button
                  type="button"
                  onClick={() => loadFeed(feed, undefined, true)}
                  className="cursor-pointer rounded-lg bg-white px-3 py-1.5 font-bold text-[#0e1217] transition hover:bg-[#cfd6e6] active:scale-95"
                >
                  Retry
                </button>
              </div>
            )}

            {query && (
              <p className="mb-4 text-sm text-[#a8b3cf]">
                {visiblePosts.length} {visiblePosts.length === 1 ? 'result' : 'results'} for “{query}”
              </p>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] xl:gap-8">
              {visiblePosts.map((post) => (
                <PostCard key={post.id} post={post} onNavigate={navigate} />
              ))}
              {loading &&
                Array.from({ length: posts.length ? 3 : 9 }, (_, i) => <CardSkeleton key={`s${i}`} />)}
            </div>

            <div ref={sentinelRef} className="h-px" />
          </main>
        )}
      </div>
    </>
  );
}

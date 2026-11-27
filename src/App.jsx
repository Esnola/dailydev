import { useCallback, useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import PostCard from './components/PostCard.jsx';
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
      setError(`No se pudo cargar el feed (${err.message}).`);
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
  };

  return (
    <>
      <Header feed={feed} onFeedChange={handleFeedChange} />

      {postId ? (
        <PostDetail postId={postId} onBack={() => navigate('/')} />
      ) : (
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onNavigate={navigate} />
            ))}
          </div>

          {(cursor || loading) && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                disabled={loading}
                onClick={() => loadFeed(feed, cursor, false)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#2d323e] bg-[#1c1f26] px-6 py-2.5 text-sm font-semibold text-white transition hover:border-[#525866] hover:bg-[#22262f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Cargando...' : 'Más'}
              </button>
            </div>
          )}
        </main>
      )}
    </>
  );
}

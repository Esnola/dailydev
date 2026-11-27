const FEEDS = [
  { value: 'foryou', label: 'For you' },
  { value: 'popular', label: 'Popular' },
  { value: 'discussed', label: 'Discussed' },
];

export default function Header({ feed, onFeedChange }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#2d323e] bg-[#0e1217]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => onFeedChange(feed)}
          className="flex cursor-pointer items-center gap-2.5 text-left"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-[#7120fd] via-[#ce3df3] to-[#ff6ec7] text-sm font-extrabold text-white shadow-md shadow-[#ce3df3]/20">
            d.
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            daily<span className="text-[#a8b3cf] font-normal">.dev</span>
          </span>
        </button>

        <nav
          aria-label="Feeds"
          className="inline-flex items-center gap-1 rounded-xl border border-[#2d323e] bg-[#1c1f26] p-1"
        >
          {FEEDS.map((item) => {
            const active = feed === item.value;
            return (
              <button
                key={item.value}
                type="button"
                aria-pressed={active}
                onClick={() => onFeedChange(item.value)}
                className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-sm font-semibold transition ${
                  active
                    ? 'bg-white text-[#0e1217] shadow-sm'
                    : 'text-[#a8b3cf] hover:bg-[#2d323e]/60 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

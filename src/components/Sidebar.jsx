import { ChatIcon, FireIcon, HomeIcon } from './Icons.jsx';

export const FEEDS = [
  { value: 'foryou', label: 'My feed', Icon: HomeIcon },
  { value: 'popular', label: 'Popular', Icon: FireIcon },
  { value: 'discussed', label: 'Discussed', Icon: ChatIcon },
];

export default function Sidebar({ feed, onFeedChange, showActive }) {
  return (
    <>
      {/* Desktop: fixed left sidebar */}
      <aside className="fixed bottom-0 left-0 top-14 z-20 hidden w-60 border-r border-[#2d323c] bg-[#0e1217] lg:block">
        <nav aria-label="Feeds" className="flex flex-col gap-0.5 p-3">
          <p className="px-3 pb-2 pt-1 text-xs font-bold text-[#a8b3cf]">Discover</p>
          {FEEDS.map(({ value, label, Icon }) => {
            const active = showActive && feed === value;
            return (
              <button
                key={value}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => onFeedChange(value)}
                className={`flex h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-left text-[15px] transition active:scale-[0.98] ${
                  active
                    ? 'bg-[#2d323c] font-bold text-white'
                    : 'font-medium text-[#a8b3cf] hover:bg-[#1c1f26] hover:text-white'
                }`}
              >
                <Icon />
                {label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile: bottom tab bar */}
      <nav
        aria-label="Feeds"
        className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-stretch justify-around border-t border-[#2d323c] bg-[#0e1217] lg:hidden"
      >
        {FEEDS.map(({ value, label, Icon }) => {
          const active = showActive && feed === value;
          return (
            <button
              key={value}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => onFeedChange(value)}
              className={`flex min-w-16 cursor-pointer flex-col items-center justify-center gap-1 text-[11px] font-semibold transition active:scale-95 ${
                active ? 'text-white' : 'text-[#a8b3cf]'
              }`}
            >
              <Icon />
              {label}
            </button>
          );
        })}
      </nav>
    </>
  );
}

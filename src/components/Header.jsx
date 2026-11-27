import { useEffect, useRef } from 'react';
import { SearchIcon } from './Icons.jsx';

export default function Header({ query, onQueryChange, onLogoClick }) {
  const inputRef = useRef(null);

  // ⌘K / Ctrl+K focuses search, like daily.dev
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-[#2d323c] bg-[#0e1217]">
      <div className="flex h-full items-center gap-4 px-4">
        <a
          href="/"
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey) return;
            e.preventDefault();
            onLogoClick();
          }}
          className="flex shrink-0 items-center gap-2 rounded-lg lg:w-56"
          aria-label="daily.dev home"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-white text-[15px] font-black text-[#0e1217]">
            d.
          </span>
          <span className="hidden text-[19px] font-bold tracking-tight text-white sm:inline">
            daily<span className="text-[#a8b3cf]">.dev</span>
          </span>
        </a>

        <label className="group relative mx-auto flex h-10 w-full max-w-xl items-center gap-2 rounded-xl border border-transparent bg-[#1c1f26] px-3 text-[#a8b3cf] transition focus-within:border-[#a8b3cf] hover:bg-[#22262f]">
          <SearchIcon />
          <span className="sr-only">Search posts</span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search"
            className="h-full w-full bg-transparent text-[15px] text-white placeholder:text-[#a8b3cf] focus:outline-none"
          />
          <kbd className="hidden shrink-0 rounded-md border border-[#383d47] px-1.5 py-0.5 font-sans text-xs text-[#a8b3cf] sm:inline">
            ⌘K
          </kbd>
        </label>

        <div className="hidden shrink-0 lg:block lg:w-56" />
      </div>
    </header>
  );
}

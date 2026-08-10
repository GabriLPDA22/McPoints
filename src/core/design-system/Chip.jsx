export function Chip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-4 py-2 rounded-full text-sm font-medium min-h-[40px] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        active ? 'bg-accent text-on-accent' : 'bg-raised text-muted hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

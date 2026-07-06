const HomeIcon = ({ filled }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 10.5L12 3L21 10.5V21H15V15H9V21H3V10.5Z"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={filled ? 'currentColor' : 'none'}
    />
  </svg>
);

const LibraryIcon = ({ filled }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M4 6H20M4 10H20M4 14H14M4 18H11"
      stroke="currentColor"
      strokeWidth={filled ? '2.2' : '1.75'}
      strokeLinecap="round"
    />
  </svg>
);

const ProfileIcon = ({ filled }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle
      cx="12"
      cy="8"
      r="4"
      stroke="currentColor"
      strokeWidth="1.75"
      fill={filled ? 'currentColor' : 'none'}
    />
    <path
      d="M4 20c0-4 3.582-7 8-7s8 3 8 7"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

const tabs = [
  { id: 'home', label: 'Home', Icon: HomeIcon },
  { id: 'library', label: 'Library', Icon: LibraryIcon },
];
const rightTabs = [{ id: 'profile', label: 'Profile', Icon: ProfileIcon }];

export default function BottomNav({ active, onChange, onAdd }) {
  return (
    <nav className="shrink-0 bg-white border-t border-gray-100 pb-safe">
      <div className="flex items-center">
        {/* Left tabs: Home + Library */}
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              active === id ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            <Icon filled={active === id} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}

        {/* Center FAB */}
        <div className="flex-1 flex flex-col items-center py-2">
          <button
            onClick={onAdd}
            className="w-13 h-13 w-[52px] h-[52px] rounded-full bg-gray-900 text-white flex items-center justify-center shadow-lg hover:bg-gray-700 active:scale-95 transition-all"
            aria-label="Add note"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path
                d="M11 4V18M4 11H18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Right tab: Profile */}
        {rightTabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              active === id ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            <Icon filled={active === id} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}

        {/* Empty flex-1 to balance the FAB slot on the right */}
        <div className="flex-1" />
      </div>
    </nav>
  );
}

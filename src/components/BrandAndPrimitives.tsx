import React from 'react';

/**
 * Custom Team Boards SVG + Wordmark
 * Replaces broken placeholder logos from reference mockups with a crisp geometric mark.
 */
export const TeamBoardsWordmark: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}> = ({ size = 'md', showText = true }) => {
  const iconBox =
    size === 'sm'
      ? 'w-6 h-6'
      : size === 'md'
      ? 'w-7 h-7'
      : 'w-9 h-9';

  const textSize =
    size === 'sm'
      ? 'text-[14px]'
      : size === 'md'
      ? 'text-[15px]'
      : 'text-[18px]';

  return (
    <div className="inline-flex items-center gap-2.5 select-none shrink-0">
      <div
        className={`${iconBox} rounded-[var(--radius-sm)] bg-[var(--accent-primary)] flex items-center justify-center shadow-xs shrink-0`}
        aria-hidden="true"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="2"
            y="2.5"
            width="4"
            height="13"
            rx="1"
            fill="#FFFFFF"
          />
          <rect
            x="7.5"
            y="2.5"
            width="4"
            height="8.5"
            rx="1"
            fill="#FFFFFF"
            fillOpacity="0.85"
          />
          <rect
            x="13"
            y="2.5"
            width="3"
            height="11"
            rx="1"
            fill="#FFFFFF"
            fillOpacity="0.65"
          />
        </svg>
      </div>
      {showText && (
        <span
          className={`font-semibold tracking-tight text-[var(--text-primary)] ${textSize} whitespace-nowrap`}
        >
          Team Boards
        </span>
      )}
    </div>
  );
};

/**
 * Keyboard Shortcut Badge (minimum 12px legibility per user constraint)
 */
export const Kbd: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <kbd
    className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[12px] leading-4 font-mono-id font-medium text-[var(--text-muted)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] select-none shrink-0 ${className}`}
  >
    {children}
  </kbd>
);

/**
 * User Avatar (Profile Avatar or Initials)
 */
export const UserAvatar: React.FC<{
  displayName: string;
  initials: string;
  color: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ displayName, initials, color, avatarUrl, size = 'md' }) => {
  const dims =
    size === 'sm'
      ? 'w-6 h-6 text-[12px]'
      : size === 'md'
      ? 'w-7 h-7 text-[12px]'
      : 'w-9 h-9 text-[14px]';

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        referrerPolicy="no-referrer"
        className={`${dims} rounded-full object-cover border border-[var(--border-strong)] shrink-0`}
      />
    );
  }

  return (
    <span
      title={displayName}
      style={{
        backgroundColor: `${color}22`,
        borderColor: `${color}55`,
        color: color,
      }}
      className={`${dims} rounded-full border inline-flex items-center justify-center font-semibold tracking-tight select-none shrink-0`}
    >
      {initials}
    </span>
  );
};

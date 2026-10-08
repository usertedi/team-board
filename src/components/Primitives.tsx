import React from 'react';
import { IssueStatus, IssuePriority } from '../types';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../data';

/**
 * Keyboard Shortcut Indicator (Kbd)
 * Inset tags within buttons, menus, and table rows.
 * Background rgba(255, 255, 255, 0.05), border 1px solid rgba(255, 255, 255, 0.12),
 * border-radius 3px, typography kbd-sm, text color #8A8F98, padding 1px 4px.
 */
export const Kbd: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <kbd
    className={`inline-flex items-center justify-center bg-white/[0.05] border border-white/[0.12] rounded-[3px] type-kbd-sm text-[#8A8F98] px-[4px] py-[1px] select-none shrink-0 ${className}`}
  >
    {children}
  </kbd>
);

/**
 * Custom 14px x 14px square with 3px radius.
 * Unchecked: 1px solid rgba(255, 255, 255, 0.2) against transparent fill.
 * Checked: Fill #5E6AD2, border #5E6AD2, with a crisp white check vector.
 */
export const PrecisionCheckbox: React.FC<{
  checked: boolean;
  onChange: (e: React.MouseEvent) => void;
  ariaLabel?: string;
}> = ({ checked, onChange, ariaLabel = 'Select item' }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    aria-label={ariaLabel}
    onClick={(e) => {
      e.stopPropagation();
      onChange(e);
    }}
    className={`w-[14px] h-[14px] rounded-[3px] flex items-center justify-center transition-colors duration-100 shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5E6AD2] ${
      checked
        ? 'bg-[#5E6AD2] border border-[#5E6AD2]'
        : 'bg-transparent border border-white/20 hover:border-white/40'
    }`}
  >
    {checked && (
      <svg
        width="10"
        height="10"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.5 6.5L4.8 8.8L9.5 3.5"
          stroke="#FFFFFF"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </button>
);

/**
 * Semantic Status Glyph SVG (14x14)
 */
export const StatusGlyph: React.FC<{ status: IssueStatus; size?: number }> = ({
  status,
  size = 13,
}) => {
  const cfg = STATUS_CONFIG[status];

  switch (status) {
    case 'backlog':
      return (
        <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="shrink-0">
          <circle
            cx="7"
            cy="7"
            r="5.25"
            stroke={cfg.color}
            strokeWidth="1.4"
            strokeDasharray="2.2 2.2"
          />
        </svg>
      );
    case 'todo':
      return (
        <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="shrink-0">
          <circle cx="7" cy="7" r="5.25" stroke={cfg.color} strokeWidth="1.4" />
        </svg>
      );
    case 'in_progress':
      return (
        <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="shrink-0">
          <circle cx="7" cy="7" r="5.25" stroke={cfg.color} strokeWidth="1.4" />
          <path d="M7 1.75A5.25 5.25 0 0 1 12.25 7H7V1.75Z" fill={cfg.color} />
          <path d="M7 12.25A5.25 5.25 0 0 0 12.25 7H7V12.25Z" fill={cfg.color} />
        </svg>
      );
    case 'in_review':
      return (
        <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="shrink-0">
          <circle cx="7" cy="7" r="5.25" stroke={cfg.color} strokeWidth="1.4" />
          <circle cx="7" cy="7" r="2.6" fill={cfg.color} />
        </svg>
      );
    case 'done':
      return (
        <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="shrink-0">
          <circle cx="7" cy="7" r="5.75" fill={cfg.color} />
          <path
            d="M4.6 7.1L6.2 8.7L9.5 5.3"
            stroke="#08090A"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'blocked':
      return (
        <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="shrink-0">
          <rect
            x="1.75"
            y="1.75"
            width="10.5"
            height="10.5"
            rx="2.5"
            stroke={cfg.color}
            strokeWidth="1.4"
          />
          <path d="M4.75 7H9.25" stroke={cfg.color} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
  }
};

/**
 * Priority Signal Bars Glyph
 */
export const PriorityGlyph: React.FC<{ priority: IssuePriority; size?: number }> = ({
  priority,
  size = 13,
}) => {
  const cfg = PRIORITY_CONFIG[priority];

  if (priority === 'urgent') {
    return (
      <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="shrink-0">
        <rect x="1.5" y="1.5" width="11" height="11" rx="2.5" fill={cfg.color} />
        <path
          d="M7 4V7.5M7 9.8H7.01"
          stroke="#08090A"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="shrink-0">
      <rect
        x="2"
        y="9"
        width="2"
        height="3"
        rx="0.5"
        fill={cfg.bars >= 1 ? cfg.color : 'rgba(255,255,255,0.16)'}
      />
      <rect
        x="5.5"
        y="6.5"
        width="2"
        height="5.5"
        rx="0.5"
        fill={cfg.bars >= 2 ? cfg.color : 'rgba(255,255,255,0.16)'}
      />
      <rect
        x="9"
        y="3.5"
        width="2"
        height="8.5"
        rx="0.5"
        fill={cfg.bars >= 3 ? cfg.color : 'rgba(255,255,255,0.16)'}
      />
    </svg>
  );
};

/**
 * Status Chip & Priority Indicator
 * Layout: Height 20px, inline-flex, gap 4px, padding 0 6px, border-radius 4px.
 * States: Uses semantic glyphs with text label. Fill is low-saturation tint rgba(color, 0.12) with solid foreground icon.
 */
export const StatusChip: React.FC<{
  status: IssueStatus;
  onClick?: (e: React.MouseEvent) => void;
  compact?: boolean;
}> = ({ status, onClick, compact = false }) => {
  const cfg = STATUS_CONFIG[status];
  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      style={{ backgroundColor: cfg.tint, color: cfg.color }}
      className={`h-[20px] inline-flex items-center gap-[4px] px-[6px] rounded-[4px] type-label-sm whitespace-nowrap shrink-0 transition-opacity ${
        onClick ? 'hover:opacity-90 cursor-pointer focus-visible:ring-1 focus-visible:ring-[#5E6AD2]' : ''
      }`}
    >
      <StatusGlyph status={status} size={11} />
      {!compact && <span>{cfg.label}</span>}
    </Component>
  );
};

export const PriorityChip: React.FC<{
  priority: IssuePriority;
  onClick?: (e: React.MouseEvent) => void;
  showLabel?: boolean;
}> = ({ priority, onClick, showLabel = true }) => {
  const cfg = PRIORITY_CONFIG[priority];
  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      style={{ backgroundColor: showLabel ? cfg.tint : 'transparent', color: cfg.color }}
      className={`h-[20px] inline-flex items-center gap-[4px] ${
        showLabel ? 'px-[6px]' : 'px-[2px]'
      } rounded-[4px] type-label-sm whitespace-nowrap shrink-0 ${
        onClick ? 'hover:bg-white/[0.06] cursor-pointer' : ''
      }`}
      title={`Priority: ${cfg.label}`}
    >
      <PriorityGlyph priority={priority} size={12} />
      {showLabel && <span>{cfg.label}</span>}
    </Component>
  );
};

/**
 * Rounded Avatar (permitted circular geometry 9999px per Precision Slate spec)
 */
export const MemberAvatar: React.FC<{
  initials: string;
  color: string;
  name: string;
  size?: 'xs' | 'sm' | 'md';
}> = ({ initials, color, name, size = 'sm' }) => {
  const dims =
    size === 'xs'
      ? 'w-[18px] h-[18px] text-[9px]'
      : size === 'sm'
      ? 'w-[22px] h-[22px] text-[10px]'
      : 'w-[26px] h-[26px] text-[11px]';

  return (
    <span
      title={name}
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

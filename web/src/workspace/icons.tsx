import type { ReactNode } from 'react';

type IconProps = { size?: number; className?: string };

function Svg({ children, size = 20, className = '' }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={`ws-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export const Icons = {
  home: (p?: IconProps) => (
    <Svg {...p}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
    </Svg>
  ),
  building: (p?: IconProps) => (
    <Svg {...p}>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <path d="M9 8h.01M12 8h.01M15 8h.01M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01" />
    </Svg>
  ),
  wallet: (p?: IconProps) => (
    <Svg {...p}>
      <path d="M3 8h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
      <path d="M3 8V6.5A2.5 2.5 0 0 1 5.5 4H17" />
      <circle cx="16.5" cy="14" r="1" />
    </Svg>
  ),
  file: (p?: IconProps) => (
    <Svg {...p}>
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v5h5" />
    </Svg>
  ),
  wrench: (p?: IconProps) => (
    <Svg {...p}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4L15 12z" />
    </Svg>
  ),
  calendar: (p?: IconProps) => (
    <Svg {...p}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </Svg>
  ),
  users: (p?: IconProps) => (
    <Svg {...p}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 19a6 6 0 0 1 12 0" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M21 19a4.5 4.5 0 0 0-4-4.4" />
    </Svg>
  ),
  chart: (p?: IconProps) => (
    <Svg {...p}>
      <path d="M4 19V5M4 19h16" />
      <path d="M8 15v-4M12 15V8M16 15v-7" />
    </Svg>
  ),
  settings: (p?: IconProps) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </Svg>
  ),
  plus: (p?: IconProps) => (
    <Svg {...p}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  ),
  search: (p?: IconProps) => (
    <Svg {...p}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.5-3.5" />
    </Svg>
  ),
  alert: (p?: IconProps) => (
    <Svg {...p}>
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.3 4.9 2.8 18a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.9a2 2 0 0 0-3.4 0z" />
    </Svg>
  ),
};

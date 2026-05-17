import type { SVGProps } from 'react';
import type { IconName } from './admin.types.js';

type IconProps = SVGProps<SVGSVGElement> & { name: IconName };

const PATHS: Record<IconName, string> = {
  home: 'M3 11l9-8 9 8M5 10v10h4v-6h6v6h4V10',
  box: 'M3 7l9-4 9 4M3 7v10l9 4 9-4V7M3 7l9 4 9-4M12 11v10',
  tag: 'M20.6 13.4L13.4 20.6a2 2 0 01-2.8 0L3 13V3h10l7.6 7.6a2 2 0 010 2.8zM7 7h.01',
  upload: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12',
  'shopping-cart': 'M3 3h2l3 12h11l3-9H6M9 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm9 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  chart: 'M3 3v18h18M7 14l4-4 4 4 5-6',
  pie: 'M21 12A9 9 0 1112 3v9h9z',
  ticket: 'M3 7a2 2 0 012-2h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7zM13 5v14',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zm7.4-3a7.4 7.4 0 00-.1-1.2l2.1-1.6-2-3.4-2.4 1a7.5 7.5 0 00-2-1.2L14.5 3h-5l-.5 2.6a7.5 7.5 0 00-2 1.2l-2.4-1-2 3.4 2.1 1.6a7.4 7.4 0 000 2.4L2.6 14.8l2 3.4 2.4-1a7.5 7.5 0 002 1.2l.5 2.6h5l.5-2.6a7.5 7.5 0 002-1.2l2.4 1 2-3.4-2.1-1.6c.06-.4.1-.8.1-1.2z',
  store: 'M3 9l2-5h14l2 5M3 9v11h18V9M3 9h18M9 13h6',
  bell: 'M15 17h5l-2-2v-5a6 6 0 10-12 0v5l-2 2h5m6 0a3 3 0 11-6 0',
  search: 'M21 21l-5-5m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  plus: 'M12 5v14M5 12h14',
  menu: 'M4 6h16M4 12h16M4 18h16',
  'chevron-right': 'M9 5l7 7-7 7',
  'chevron-down': 'M5 9l7 7 7-7',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  globe: 'M12 21a9 9 0 100-18 9 9 0 000 18zm0-18c2.5 3 4 6.5 4 9s-1.5 6-4 9c-2.5-3-4-6.5-4-9s1.5-6 4-9zM3 12h18',
  currency: 'M12 8c-2 0-3.5 1-3.5 2.5S10 13 12 13s3.5 1 3.5 2.5S14 18 12 18m0-10V6m0 12v2m-6-7a6 6 0 1012 0 6 6 0 00-12 0z',
  logout: 'M17 16l4-4-4-4M21 12H9M13 21H5a2 2 0 01-2-2V5a2 2 0 012-2h8',
  user: 'M16 14a4 4 0 10-8 0M20 21a8 8 0 10-16 0M12 11a3 3 0 100-6 3 3 0 000 6z',
  help: 'M12 18h.01M9.1 9a3 3 0 015.8 1c0 2-3 2-3 4M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

export function Icon({ name, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

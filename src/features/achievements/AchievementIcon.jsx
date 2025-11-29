import clsx from 'clsx';

const ICON_SIZE = 'h-8 w-8';

export function AchievementIcon({ achievementId, className }) {
  switch (achievementId) {
    case 'FIRST_THREAD':
      return (
        <svg
          viewBox="0 0 24 24"
          className={clsx(ICON_SIZE, 'text-accent', className)}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5.2 8.3a2.8 2.8 0 0 1 2.8-2.8h8a2.8 2.8 0 0 1 2.8 2.8v5.4a2.8 2.8 0 0 1-2.8 2.8H11l-3 2.4v-2.4H8a2.8 2.8 0 0 1-2.8-2.8Z" />
          <path d="M8.5 9.3h7" />
          <path d="M8.5 12h4.8" />
          <path d="M8.5 14.3h3.6" />
        </svg>
      );
    case 'FIRST_COMMENT':
      return (
        <svg
          viewBox="0 0 24 24"
          className={clsx(ICON_SIZE, 'text-accent', className)}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4.8 11.4a2.6 2.6 0 0 1 2.6-2.6h6.7a2.6 2.6 0 0 1 2.6 2.6v4.1a2.6 2.6 0 0 1-2.6 2.6H8.7L6.3 20v-1.9H6a2.6 2.6 0 0 1-2.6-2.6Z" />
          <path d="M10.6 8V7.4A2.4 2.4 0 0 1 13 5h5a2.4 2.4 0 0 1 2.4 2.4v3a2.4 2.4 0 0 1-2.4 2.4h-1.3" />
          <path d="M7.8 12.1h6.2" />
          <path d="M7.8 14.4h4.5" />
        </svg>
      );
    case 'FIRST_WAVE':
      return (
        <svg
          viewBox="0 0 24 24"
          className={clsx(ICON_SIZE, 'text-accent', className)}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 13.5c1.3-.9 2.7-1.4 4.2-1.4 1.9 0 3.5.8 5 1.6 1.4.7 2.7 1.3 4 1.3 1.1 0 2.2-.3 3.3-.9" />
          <path d="M4 9.2c1.3-.9 2.7-1.4 4.2-1.4 1.9 0 3.5.8 5 1.6 1.4.7 2.7 1.3 4 1.3 1.1 0 2.2-.3 3.3-.9" />
          <path d="M5.8 16.5c.4.8 1.6 1.7 2.7 1.7 1.6 0 2.2-1.3 2.7-2.6" />
        </svg>
      );
    case 'FIRST_PHOTO':
      return (
        <svg
          viewBox="0 0 24 24"
          className={clsx(ICON_SIZE, 'text-accent', className)}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4.7 10.2a2.7 2.7 0 0 1 2.7-2.7h8.8a2.7 2.7 0 0 1 2.7 2.7v4.4a2.7 2.7 0 0 1-2.7 2.7h-4.7L8.4 19.9v-2.6H7.4a2.7 2.7 0 0 1-2.7-2.7Z" />
          <rect
            x="12.4"
            y="8.9"
            width="6.2"
            height="4.7"
            rx="1.1"
            ry="1.1"
            className="opacity-70"
          />
          <path d="M13.4 12.2 15.1 10l2 2" />
          <circle cx="16.9" cy="10.5" r="0.6" fill="currentColor" />
          <path d="M7.9 12.5h4.7" />
        </svg>
      );
    case 'CONSISTENT_3':
      return (
        <svg
          viewBox="0 0 24 24"
          className={clsx(ICON_SIZE, 'text-accent', className)}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="4.5" y="5.8" width="15" height="12.4" rx="2.5" ry="2.5" />
          <path d="M8.2 4.5v2.3" />
          <path d="M15.8 4.5v2.3" />
          <path d="M4.5 9.6h15" />
          <path d="M9 13.2c.5.5 1.2.8 2 .8s1.5-.3 2-.8c-.5-.5-1.2-.8-2-.8s-1.5.3-2 .8Z" />
          <path d="M9 15.8c.5.5 1.2.8 2 .8s1.5-.3 2-.8" />
        </svg>
      );
    default:
      return (
        <svg
          viewBox="0 0 24 24"
          className={clsx(ICON_SIZE, 'text-accent', className)}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="8" className="opacity-50" />
        </svg>
      );
  }
}

export default AchievementIcon;

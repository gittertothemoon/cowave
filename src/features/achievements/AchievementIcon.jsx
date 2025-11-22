const iconBaseClass = 'h-8 w-8 text-accent';

function classNames(...values) {
  return values.filter(Boolean).join(' ');
}

export default function AchievementIcon({ achievementId, className }) {
  const classes = classNames(iconBaseClass, className);

  if (achievementId === 'ONBOARDING_DONE') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 48 48"
        className={classes}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle
          cx="24"
          cy="24"
          r="16.5"
          fill="currentColor"
          opacity="0.08"
        />
        <path d="M15.5 24.5c2.2-3.7 5.5-5.6 8.5-5.6 3.2 0 5.9 1.6 8 5" />
        <path d="M16 24.5 22 29.5 32.5 17" />
      </svg>
    );
  }

  if (achievementId === 'FIRST_THREAD') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 48 48"
        className={classes}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 15.5h20c2.2 0 4 1.8 4 4v8c0 2.2-1.8 4-4 4H23l-5 4v-4h-4c-2.2 0-4-1.8-4-4v-8c0-2.2 1.8-4 4-4Z" />
        <path d="M18 20.5h16" />
        <path d="M18 24.5h12" />
        <path d="M18 28.5h8" />
      </svg>
    );
  }

  if (achievementId === 'FIRST_REPLY') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 48 48"
        className={classes}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 20a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4h-7.5L15 33.5V30h-1a4 4 0 0 1-4-4V20Z" />
        <path d="M18 16.5v-1a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-2" />
        <path d="M15.5 22h12" />
        <path d="M15.5 25.5h8" />
      </svg>
    );
  }

  if (achievementId === 'FIRST_IMAGE_REPLY') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 48 48"
        className={classes}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11 19.5a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v6.5a4 4 0 0 1-4 4h-7L16 33.5V30h-1a4 4 0 0 1-4-4v-6.5Z" />
        <rect
          x="25.5"
          y="18.5"
          width="10"
          height="8.5"
          rx="1.6"
          ry="1.6"
          fill="currentColor"
          opacity="0.08"
        />
        <path d="M27 24.5 30 21l3 3.4 1.8-1.2" />
        <circle cx="31.5" cy="21" r="0.9" fill="currentColor" />
        <path d="M15.5 23h8" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      className={classes}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="24"
        cy="24"
        r="16.5"
        fill="currentColor"
        opacity="0.08"
      />
      <path d="M18 24h12" />
      <path d="M24 18v12" />
    </svg>
  );
}

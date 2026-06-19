import React from 'react'

type IconProps = React.SVGProps<SVGSVGElement>

/** Jeu d'icônes linéaires sobres (stroke), cohérentes avec l'esprit clinique. */
function base(props: IconProps): IconProps {
  return {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ...props
  }
}

export const IconDashboard = (p: IconProps): React.JSX.Element => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
)

export const IconDumbbell = (p: IconProps): React.JSX.Element => (
  <svg {...base(p)}>
    <path d="M6.5 6.5l11 11" />
    <rect x="2" y="7.5" width="4" height="9" rx="1" transform="rotate(45 4 12)" />
    <rect x="18" y="7.5" width="4" height="9" rx="1" transform="rotate(45 20 12)" />
  </svg>
)

export const IconPlay = (p: IconProps): React.JSX.Element => (
  <svg {...base(p)}>
    <path d="M7 5l12 7-12 7V5z" />
  </svg>
)

export const IconPause = (p: IconProps): React.JSX.Element => (
  <svg {...base(p)}>
    <rect x="7" y="5" width="3.2" height="14" rx="1" />
    <rect x="14" y="5" width="3.2" height="14" rx="1" />
  </svg>
)

export const IconStop = (p: IconProps): React.JSX.Element => (
  <svg {...base(p)}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
)

export const IconNext = (p: IconProps): React.JSX.Element => (
  <svg {...base(p)}>
    <path d="M6 5l9 7-9 7V5z" />
    <path d="M18 5v14" />
  </svg>
)

export const IconPrev = (p: IconProps): React.JSX.Element => (
  <svg {...base(p)}>
    <path d="M18 5l-9 7 9 7V5z" />
    <path d="M6 5v14" />
  </svg>
)

export const IconCalendar = (p: IconProps): React.JSX.Element => (
  <svg {...base(p)}>
    <rect x="3" y="4.5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 2.5v4M16 2.5v4" />
  </svg>
)

export const IconChart = (p: IconProps): React.JSX.Element => (
  <svg {...base(p)}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
)

export const IconSettings = (p: IconProps): React.JSX.Element => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-2.88 1.2V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15H4.5a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 6 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 11 4.6V4.5a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 2.83 1.2l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 11h.1a2 2 0 1 1 0 4h-.1z" />
  </svg>
)

export const IconPlus = (p: IconProps): React.JSX.Element => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const IconTrash = (p: IconProps): React.JSX.Element => (
  <svg {...base(p)}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6" />
  </svg>
)

export const IconCopy = (p: IconProps): React.JSX.Element => (
  <svg {...base(p)}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h8" />
  </svg>
)

export const IconEdit = (p: IconProps): React.JSX.Element => (
  <svg {...base(p)}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
)

export const IconDownload = (p: IconProps): React.JSX.Element => (
  <svg {...base(p)}>
    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
  </svg>
)

export const IconUpload = (p: IconProps): React.JSX.Element => (
  <svg {...base(p)}>
    <path d="M12 21V9M7 14l5-5 5 5M5 3h14" />
  </svg>
)

export const IconCheck = (p: IconProps): React.JSX.Element => (
  <svg {...base(p)}>
    <path d="M5 12l5 5 9-11" />
  </svg>
)

export const IconClose = (p: IconProps): React.JSX.Element => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const IconArrowUp = (p: IconProps): React.JSX.Element => (
  <svg {...base(p)}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
)

export const IconArrowDown = (p: IconProps): React.JSX.Element => (
  <svg {...base(p)}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
)

export const IconClock = (p: IconProps): React.JSX.Element => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)

export const IconRest = (p: IconProps): React.JSX.Element => (
  <svg {...base(p)}>
    <path d="M3 18v-6a4 4 0 0 1 4-4h7a4 4 0 0 1 4 4v6" />
    <path d="M3 14h18M3 18h18M7 8V6" />
  </svg>
)

export const IconFlame = (p: IconProps): React.JSX.Element => (
  <svg {...base(p)}>
    <path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3s.5 1.5 1.5 2c0-2 0-5 2.5-8z" />
  </svg>
)

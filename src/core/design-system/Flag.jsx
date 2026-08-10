import { useId } from 'react';

// Banderas en SVG plano — nada de emojis (no se renderizan igual en todos
// los dispositivos y rompen el sistema tipográfico/iconográfico de la app).
// Proporción de bandera 3:2, esquinas ligeramente redondeadas.
const FLAGS = {
  es: (
    <>
      <rect width="30" height="20" fill="#AA151B" />
      <rect y="5" width="30" height="10" fill="#F1BF00" />
      <g transform="translate(3.2, 5.6)">
        <path
          d="M1.2 0 L2.1 -0.9 L3 0 L3.9 -0.9 L4.8 0 L5.4 0.55 L0.6 0.55 Z"
          fill="#F1BF00"
          stroke="#AA151B"
          strokeWidth="0.22"
          strokeLinejoin="round"
        />
        <path
          d="M0.4 1.1 H5.6 V5.4 Q3 7.9 0.4 5.4 Z"
          fill="#AA151B"
          stroke="#F1BF00"
          strokeWidth="0.28"
        />
        <rect x="0.75" y="1.55" width="2.05" height="3.35" fill="#F1BF00" />
        <rect x="1.05" y="1.85" width="0.42" height="0.55" fill="#AA151B" />
        <rect x="1.95" y="1.85" width="0.42" height="0.55" fill="#AA151B" />
        <rect x="3.05" y="1.55" width="2.05" height="3.35" fill="#F1BF00" />
        <ellipse cx="4.08" cy="3.25" rx="0.72" ry="0.92" fill="#AA151B" />
        <circle cx="4.35" cy="2.95" r="0.18" fill="#F1BF00" />
        <rect x="1.35" y="5.15" width="0.55" height="1.35" fill="#F1BF00" />
        <rect x="3.55" y="5.15" width="0.55" height="1.35" fill="#F1BF00" />
      </g>
    </>
  ),
  en: (
    <>
      <rect width="30" height="20" fill="#00247D" />
      <path d="M0 0 L30 20 M30 0 L0 20" stroke="#FFFFFF" strokeWidth="4" />
      <path d="M0 0 L30 20 M30 0 L0 20" stroke="#CF142B" strokeWidth="1.6" />
      <path d="M15 0 V20 M0 10 H30" stroke="#FFFFFF" strokeWidth="6.5" />
      <path d="M15 0 V20 M0 10 H30" stroke="#CF142B" strokeWidth="4" />
    </>
  ),
  pt: (
    <>
      <rect width="30" height="20" fill="#DA291C" />
      <rect width="12" height="20" fill="#046A38" />
      <g transform="translate(12, 10)">
        <circle r="5.6" fill="#FFD700" fillOpacity="0.18" stroke="#FFD700" strokeWidth="0.42" />
        <ellipse rx="5.6" ry="2.3" fill="none" stroke="#FFD700" strokeWidth="0.34" />
        <ellipse rx="2.3" ry="5.6" fill="none" stroke="#FFD700" strokeWidth="0.34" />
        <line x1="-5.6" y1="0" x2="5.6" y2="0" stroke="#FFD700" strokeWidth="0.34" />
        <g transform="translate(-2.1, -0.4)">
          <path
            d="M0 -3.35 H4.2 V-0.35 Q2.1 2.05 0 -0.15 Z"
            fill="#FFFFFF"
            stroke="#003F87"
            strokeWidth="0.28"
          />
          <path
            d="M0.25 -3.15 H3.95 V-2.45 H3.35 V-2.85 H2.75 V-2.45 H2.15 V-2.85 H1.55 V-2.45 H0.95 V-2.85 H0.25 Z"
            fill="#FFFFFF"
            stroke="#003F87"
            strokeWidth="0.18"
          />
          <rect x="0.45" y="-1.95" width="3.3" height="1.05" fill="#003F87" />
          <circle cx="0.95" cy="-1.42" r="0.24" fill="#FFFFFF" />
          <circle cx="1.65" cy="-1.42" r="0.24" fill="#FFFFFF" />
          <circle cx="2.35" cy="-1.42" r="0.24" fill="#FFFFFF" />
          <circle cx="3.05" cy="-1.42" r="0.24" fill="#FFFFFF" />
          <rect x="0.65" y="-0.65" width="2.9" height="0.95" fill="#FFFFFF" />
          <circle cx="2.1" cy="-0.18" r="0.3" fill="#DA291C" />
        </g>
      </g>
    </>
  ),
};

export function Flag({ code, className = 'w-5 h-[13.3px]' }) {
  const uid = useId();
  const content = FLAGS[code];
  if (!content) return null;

  const clipId = `flag-clip-${uid}`;

  return (
    <svg
      viewBox="0 0 30 20"
      className={`${className} rounded-[2px] flex-shrink-0`}
      role="img"
      aria-hidden
    >
      <clipPath id={clipId}>
        <rect width="30" height="20" rx="2" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>{content}</g>
    </svg>
  );
}

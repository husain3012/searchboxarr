export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer hex */}
      <path
        d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
        fill="rgba(0,212,255,0.08)"
        stroke="rgba(0,212,255,0.5)"
        strokeWidth="1.5"
      />
      {/* Magnifier circle */}
      <circle
        cx="14.5"
        cy="14.5"
        r="5.5"
        stroke="#00d4ff"
        strokeWidth="1.8"
        fill="none"
      />
      {/* Magnifier handle */}
      <line
        x1="18.5"
        y1="18.5"
        x2="22"
        y2="22"
        stroke="#00d4ff"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Inner dot */}
      <circle cx="14.5" cy="14.5" r="2" fill="rgba(0,212,255,0.4)" />
    </svg>
  );
}

export function EyewearLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Play button circle */}
      <circle cx="50" cy="50" r="40" fill="currentColor" />

      {/* Play triangle */}
      <path d="M 42 32 L 42 68 L 72 50 Z" fill="white" />

      {/* Stylish glasses frame overlay */}
      <g stroke="white" strokeWidth="2.5" fill="none">
        {/* Left lens */}
        <ellipse cx="32" cy="45" rx="12" ry="10" />
        {/* Right lens */}
        <ellipse cx="68" cy="45" rx="12" ry="10" />
        {/* Bridge */}
        <path d="M 44 45 L 56 45" strokeWidth="2" />
        {/* Left temple */}
        <path d="M 20 45 L 15 45" strokeWidth="2" strokeLinecap="round" />
        {/* Right temple */}
        <path d="M 80 45 L 85 45" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  )
}

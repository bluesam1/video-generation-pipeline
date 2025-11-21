export function BabyLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Play button circle */}
      <circle cx="50" cy="50" r="40" fill="currentColor" />

      {/* Play triangle */}
      <path d="M 42 32 L 42 68 L 72 50 Z" fill="white" />

      {/* Single baby hair strand on top */}
      <path d="M 50 8 Q 45 2 42 8" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Single tooth at bottom */}
      <rect x="46" y="88" width="8" height="10" rx="1" fill="white" />
    </svg>
  )
}

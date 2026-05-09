interface TuringTechLogoProps {
  size?: number;
  className?: string;
}

/**
 * TuringTech double-chevron logo matching the Figma design.
 * Two overlapping arrow shapes — coral red and white.
 */
export function TuringTechLogo({ size = 40, className = '' }: TuringTechLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* White chevron (behind, bottom-right) */}
      <path
        d="M45 30 L75 30 L90 50 L75 70 L45 70 L60 50 Z"
        fill="white"
        rx="4"
      />
      {/* Red/coral chevron (front, top-left) */}
      <path
        d="M15 25 L50 25 L68 50 L50 75 L15 75 L33 50 Z"
        fill="#EF5350"
        rx="4"
      />
    </svg>
  );
}

/**
 * Full TuringTech brand mark with logo + text.
 */
export function TuringTechBrand({ size = 32, className = '' }: TuringTechLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TuringTechLogo size={size} />
      <span className="text-lg font-semibold text-white tracking-tight">
        TuringTech Test
      </span>
    </div>
  );
}

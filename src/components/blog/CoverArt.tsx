import { useId } from "react";
import { cn } from "@/lib/utils";

interface CoverArtProps {
  preset?: number;
  imageUrl?: string | null;
  className?: string;
  alt?: string;
}

/**
 * Capa do artigo. Usa a imagem enviada, ou uma das capas geradas
 * a partir das formas do símbolo Lins Neves (barra, diagonal e quadrado).
 */
const CoverArt = ({ preset = 0, imageUrl, className, alt = "" }: CoverArtProps) => {
  const uid = useId().replace(/:/g, "");

  if (imageUrl) {
    return <img src={imageUrl} alt={alt} className={cn("w-full h-full object-cover", className)} />;
  }

  const variant = ((preset % 4) + 4) % 4;

  return (
    <svg
      viewBox="0 0 1200 630"
      preserveAspectRatio="xMidYMid slice"
      className={cn("w-full h-full block", className)}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    >
      <defs>
        <linearGradient id={`g0${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#062241" />
          <stop offset="1" stopColor="#0d3a63" />
        </linearGradient>
        <linearGradient id={`g1${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0a2a4c" />
          <stop offset="1" stopColor="#01869D" />
        </linearGradient>
        <linearGradient id={`g3${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f1f5f8" />
          <stop offset="1" stopColor="#dde7ee" />
        </linearGradient>
        <pattern id={`p2${uid}`} width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M60 0H0V60" fill="none" stroke="#01869D" strokeOpacity="0.28" strokeWidth="1.5" />
        </pattern>
      </defs>

      {variant === 0 && (
        <g>
          <rect width="1200" height="630" fill={`url(#g0${uid})`} />
          <polygon points="330,0 560,0 1010,630 780,630" fill="#ffffff" fillOpacity="0.07" />
          <polygon points="560,0 640,0 1090,630 1010,630" fill="#ffffff" fillOpacity="0.04" />
          <rect x="860" y="96" width="190" height="190" fill="#01869D" />
          <rect x="150" y="0" width="120" height="630" fill="#ffffff" fillOpacity="0.05" />
        </g>
      )}

      {variant === 1 && (
        <g>
          <rect width="1200" height="630" fill={`url(#g1${uid})`} />
          <polygon points="0,140 0,630 490,630" fill="#062241" fillOpacity="0.55" />
          <rect x="120" y="96" width="130" height="130" fill="#ffffff" fillOpacity="0.92" />
          <rect x="250" y="226" width="130" height="130" fill="#062241" fillOpacity="0.6" />
          <polygon points="700,0 830,0 1200,370 1200,500" fill="#ffffff" fillOpacity="0.1" />
        </g>
      )}

      {variant === 2 && (
        <g>
          <rect width="1200" height="630" fill="#062241" />
          <rect width="1200" height="630" fill={`url(#p2${uid})`} />
          <rect x="720" y="120" width="300" height="300" fill="none" stroke="#01869D" strokeWidth="6" />
          <rect x="900" y="120" width="120" height="120" fill="#01869D" />
          <line x1="180" y1="510" x2="600" y2="510" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="4" />
          <line x1="180" y1="540" x2="430" y2="540" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="4" />
        </g>
      )}

      {variant === 3 && (
        <g>
          <rect width="1200" height="630" fill={`url(#g3${uid})`} />
          <rect x="140" y="140" width="130" height="490" fill="#062241" />
          <polygon points="140,140 270,140 640,510 640,630 520,630 140,250" fill="#062241" />
          <rect x="520" y="390" width="120" height="240" fill="#062241" />
          <rect x="520" y="140" width="120" height="120" fill="#01869D" />
          <rect x="760" y="300" width="300" height="6" fill="#01869D" fillOpacity="0.6" />
        </g>
      )}
    </svg>
  );
};

export default CoverArt;

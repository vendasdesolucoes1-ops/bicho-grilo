import React from "react";

export function AnimalWatermark({
  group,
  className,
}: {
  group: number;
  className?: string;
}) {
  const SvgBase = ({ children }: { children: React.ReactNode }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );

  switch (group) {
    case 1: // Avestruz (long neck, legs)
      return (
        <SvgBase>
          <path d="M14 4c0-2-2-2-2-2s-2 0-2 2v6c0 2-2 4-2 4s-2 2-2 4c0 2 2 4 4 4h4c2 0 4-2 4-4 0-2-2-4-2-4s-2-2-2-4V4z" />
          <path d="M12 2v2" />
        </SvgBase>
      );
    case 2: // Águia (wings spread)
      return (
        <SvgBase>
          <path d="M22 12c0-4-4-8-10-8S2 8 2 12c0 2 2 4 2 4l3-2 5 2 5-2 3 2c0 0 2-2 2-4z" />
          <path d="M12 16v4" />
        </SvgBase>
      );
    case 3: // Burro (long ears)
      return (
        <SvgBase>
          <path d="M7 4L5 2M17 4l2-2" />
          <path d="M8 8c0-2 2-4 4-4s4 2 4 4v4c0 2-2 4-4 4s-4-2-4-4V8z" />
          <path d="M10 14h4" />
        </SvgBase>
      );
    case 4: // Borboleta
      return (
        <SvgBase>
          <path d="M12 2v20" />
          <path d="M12 6c4-2 8 0 8 4s-4 6-8 6M12 6c-4-2-8 0-8 4s4 6 8 6" />
        </SvgBase>
      );
    case 5: // Cachorro
      return (
        <SvgBase>
          <path d="M9 6h6" />
          <path d="M7 8c0-2 2-4 5-4s5 2 5 4v4c0 2-2 4-5 4s-5-2-5-4V8z" />
          <path d="M5 8c-2 0-3 2-3 4s1 4 3 4" />
          <path d="M19 8c2 0 3 2 3 4s-1 4-3 4" />
          <path d="M10 14h4" />
        </SvgBase>
      );
    case 6: // Cabra (straight horns)
      return (
        <SvgBase>
          <path d="M8 2l2 4M16 2l-2 4" />
          <path d="M7 8c0-2 2-4 5-4s5 2 5 4v4c0 2-2 4-5 4s-5-2-5-4V8z" />
          <path d="M12 16v4" />
        </SvgBase>
      );
    case 7: // Carneiro (curved horns)
      return (
        <SvgBase>
          <path d="M7 6C4 6 2 8 2 10s2 4 5 4M17 6c3 0 5 2 5 4s-2 4-5 4" />
          <path d="M8 8c0-2 2-4 4-4s4 2 4 4v4c0 2-2 4-4 4s-4-2-4-4V8z" />
        </SvgBase>
      );
    case 8: // Camelo (humps)
      return (
        <SvgBase>
          <path d="M4 12c0-2 2-4 4-4s2 2 4 4c0-2 2-4 4-4s4 2 4 4" />
          <path d="M2 16h20" />
        </SvgBase>
      );
    case 9: // Cobra (S shape)
      return (
        <SvgBase>
          <path d="M15 4c-3 0-5 2-5 4s2 4 5 4-5 2-5 4 2 4 5 4" />
          <circle cx="15" cy="4" r="2" />
        </SvgBase>
      );
    case 10: // Coelho (long ears up)
      return (
        <SvgBase>
          <path d="M9 2v6M15 2v6" />
          <path d="M7 10c0-2 2-4 5-4s5 2 5 4v4c0 2-2 4-5 4s-5-2-5-4v-4z" />
          <path d="M11 14h2" />
        </SvgBase>
      );
    case 11: // Cavalo (mane)
      return (
        <SvgBase>
          <path d="M8 4l2-2 2 2" />
          <path d="M10 6c0-2 2-4 4-4s2 2 2 4v4c0 2-2 4-4 4s-4-2-4-4V6z" />
          <path d="M10 12l-4 4" />
        </SvgBase>
      );
    case 12: // Elefante (trunk)
      return (
        <SvgBase>
          <path d="M7 8c0-2 2-4 5-4s5 2 5 4v4c0 2-2 4-5 4" />
          <path d="M12 16v6c0 1-1 2-2 2s-2-1-2-2" />
          <path d="M4 8c-2 0-2 4 0 4M20 8c2 0 2 4 0 4" />
        </SvgBase>
      );
    case 13: // Galo (comb)
      return (
        <SvgBase>
          <path d="M10 2l2 3 2-3 2 3-1 3" />
          <path d="M8 10c0-2 2-4 4-4s4 2 4 4v4c0 2-2 4-4 4s-4-2-4-4v-4z" />
          <path d="M12 18l-2 4M12 18l2 4" />
        </SvgBase>
      );
    case 14: // Gato (pointy ears)
      return (
        <SvgBase>
          <path d="M7 4L5 8M17 4l2 4" />
          <path d="M6 10c0-3 3-6 6-6s6 3 6 6v4c0 3-3 6-6 6s-6-3-6-6v-4z" />
          <path d="M9 14h6" />
          <path d="M2 12h4M18 12h4" />
        </SvgBase>
      );
    case 15: // Jacaré (long snout)
      return (
        <SvgBase>
          <path d="M2 12h20M4 12l2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2" />
          <path d="M18 12v4c0 2-2 4-4 4H10c-2 0-4-2-4-4v-4" />
        </SvgBase>
      );
    case 16: // Leão (mane)
      return (
        <SvgBase>
          <circle cx="12" cy="12" r="8" strokeDasharray="4 4" />
          <circle cx="12" cy="12" r="4" />
          <path d="M11 13h2" />
        </SvgBase>
      );
    case 17: // Macaco (round face and ears)
      return (
        <SvgBase>
          <circle cx="12" cy="12" r="6" />
          <circle cx="5" cy="12" r="3" />
          <circle cx="19" cy="12" r="3" />
          <path d="M10 14h4" />
        </SvgBase>
      );
    case 18: // Porco (snout)
      return (
        <SvgBase>
          <circle cx="12" cy="12" r="8" />
          <ellipse cx="12" cy="12" rx="3" ry="2" />
          <path d="M11 12v.01M13 12v.01" />
          <path d="M7 6l-2-2M17 6l2-2" />
        </SvgBase>
      );
    case 19: // Pavão (fan tail)
      return (
        <SvgBase>
          <path d="M12 16v4" />
          <path d="M8 14c0-2 2-4 4-4s4 2 4 4" />
          <path d="M4 10c0-4 4-8 8-8s8 4 8 8" strokeDasharray="4 4" />
          <path d="M2 14c0-6 5-10 10-10s10 4 10 10" opacity="0.5" />
        </SvgBase>
      );
    case 20: // Peru
      return (
        <SvgBase>
          <circle cx="12" cy="14" r="6" />
          <path d="M12 8c-2 0-2-4 0-4s2 4 0 4" />
          <path d="M12 14v4M10 14h4" />
        </SvgBase>
      );
    case 21: // Touro (bull horns)
      return (
        <SvgBase>
          <path d="M5 4c0 3 2 6 7 6s7-3 7-6" />
          <path d="M7 10c0-3 3-4 5-4s5 1 5 4v4c0 3-3 6-5 6s-5-3-5-6v-4z" />
          <path d="M10 16h4" />
        </SvgBase>
      );
    case 22: // Tigre (stripes)
      return (
        <SvgBase>
          <circle cx="12" cy="12" r="8" />
          <path d="M8 8l2 2M16 8l-2 2M6 12h3M15 12h3M8 16l2-2M16 16l-2-2" />
        </SvgBase>
      );
    case 23: // Urso (round ears)
      return (
        <SvgBase>
          <path d="M6 6a3 3 0 0 1 3 3M15 9a3 3 0 0 1 3-3" />
          <circle cx="12" cy="13" r="7" />
          <circle cx="12" cy="14" r="2" />
        </SvgBase>
      );
    case 24: // Veado (antlers)
      return (
        <SvgBase>
          <path d="M8 2l1 4 2-2M16 2l-1 4-2-2" />
          <path d="M9 8c0-2 2-3 3-3s3 1 3 3v4c0 3-2 6-3 6s-3-3-3-6V8z" />
          <path d="M11 14h2" />
        </SvgBase>
      );
    case 25: // Vaca (horns and flat snout)
      return (
        <SvgBase>
          <path d="M6 6c2-2 4-2 6 0s4 2 6 0" />
          <path d="M8 8c0-2 2-3 4-3s4 1 4 3v6c0 2-2 3-4 3s-4-1-4-3V8z" />
          <path d="M9 14h6" />
        </SvgBase>
      );
    default:
      return (
        <SvgBase>
          <circle cx="12" cy="12" r="8" strokeDasharray="4 4" />
        </SvgBase>
      );
  }
}

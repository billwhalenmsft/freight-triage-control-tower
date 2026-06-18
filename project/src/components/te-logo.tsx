import { TE_ORANGE } from "@/lib/brand";

/**
 * TE Connectivity logo lockup — an orange "TE" tile + "connectivity" wordmark,
 * rendered as crisp inline SVG. The wordmark inherits `currentColor` so it adapts
 * to light/dark headers.
 *
 * Placeholder brand mark (no official asset yet). To swap for the official logo:
 * drop `src/assets/te-logo.svg` and replace this component's <svg> with an <img>.
 */
export function TeLogo({
  height = 30,
  wordmark = true,
  title = "TE Connectivity",
}: {
  height?: number;
  wordmark?: boolean;
  title?: string;
}) {
  const vbWidth = wordmark ? 200 : 44;
  return (
    <svg
      height={height}
      viewBox={`0 0 ${vbWidth} 44`}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", flexShrink: 0 }}
    >
      <title>{title}</title>
      <rect x="2" y="2" width="40" height="40" rx="9" fill={TE_ORANGE} />
      <text
        x="22"
        y="29"
        textAnchor="middle"
        fontFamily="'Segoe UI', system-ui, sans-serif"
        fontSize="19"
        fontWeight="800"
        fill="#ffffff"
      >
        TE
      </text>
      {wordmark && (
        <text
          x="52"
          y="29"
          fontFamily="'Segoe UI', system-ui, sans-serif"
          fontSize="19"
          fontWeight="600"
          fill="currentColor"
          letterSpacing="0.2"
        >
          connectivity
        </text>
      )}
    </svg>
  );
}

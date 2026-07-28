// A single die face (1–6) drawn with SVG pips.

const PIP_LAYOUT: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 26], [72, 26], [28, 50], [72, 50], [28, 74], [72, 74]],
};

export default function DiceFace({
  value,
  size = 56,
  pipColor = '#1c1917',
  faceColor = '#ffffff',
}: {
  value: number;
  size?: number;
  pipColor?: string;
  faceColor?: string;
}) {
  const pips = PIP_LAYOUT[value] ?? [];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-label={`Die showing ${value}`}>
      <rect x="6" y="6" width="88" height="88" rx="18" fill={faceColor} stroke="#00000022" strokeWidth="2" />
      {pips.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="9" fill={pipColor} />
      ))}
    </svg>
  );
}

'use client';

import { useMemo } from 'react';

// Deterministic PRNG so server and client render identical stars (no hydration
// mismatch).
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Exactly three speed layers (parallax): far/slow → near/fast. Sparse.
const LAYERS = [
  { count: 30, size: 1.0, opacity: 0.35, duration: 240 },
  { count: 20, size: 1.6, opacity: 0.55, duration: 160 },
  { count: 12, size: 2.6, opacity: 0.85, duration: 100 },
];

export default function Starfield() {
  const layers = useMemo(() => {
    const rand = mulberry32(1980);
    return LAYERS.map((cfg) => ({
      ...cfg,
      stars: Array.from({ length: cfg.count }, () => ({
        x: rand() * 100,
        y: rand() * 100,
      })),
    }));
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {layers.map((layer, li) => (
        <div
          key={li}
          className="absolute inset-0"
          style={{ animation: `star-drift ${layer.duration}s linear infinite` }}
        >
          {/* Two identical copies offset one screen down-right so the drift wraps seamlessly. */}
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="absolute inset-0"
              style={copy === 1 ? { transform: 'translate(100%, 100%)' } : undefined}
            >
              {layer.stars.map((s, si) => (
                <span
                  key={si}
                  className="absolute rounded-full bg-white"
                  style={{
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    width: layer.size,
                    height: layer.size,
                    opacity: layer.opacity,
                    boxShadow: `0 0 ${layer.size * 2}px rgba(255,255,255,0.6)`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

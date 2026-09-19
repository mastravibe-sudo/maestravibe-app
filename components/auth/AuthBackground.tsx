// components/auth/AuthBackground.tsx
// Realistic night-sky backdrop: dense starfield + a horizontal "milky way"
// nebula band, with slow drifting motion for a living, cinematic sky.
// No cartoon elements — matches a real astrophotography look.

// Deterministic pseudo-random (pure function of index) so server and client
// render identical markup — avoids hydration mismatches from Math.random().
function seeded(i: number, salt: number) {
  const x = Math.sin(i * salt) * 10000;
  return x - Math.floor(x);
}

// Sparse ambient stars scattered across the whole sky
const AMBIENT_STARS = Array.from({ length: 60 }, (_, i) => {
  const top = seeded(i, 12.9898) * 100;
  const left = seeded(i, 78.233) * 100;
  const size = 0.7 + seeded(i, 37.719) * 1.2;
  const delay = seeded(i, 93.989) * 6;
  const duration = 4 + seeded(i, 15.31) * 5;
  return { top, left, size, delay, duration };
});

// Denser, slightly brighter cluster of stars inside the nebula band
const BAND_STARS = Array.from({ length: 80 }, (_, i) => {
  const top = 24 + seeded(i, 45.164) * 46; // concentrated 24%-70% vertically
  const left = seeded(i, 91.345) * 100;
  const size = 1 + seeded(i, 63.71) * 1.8;
  const delay = seeded(i, 11.79) * 6;
  const duration = 3.5 + seeded(i, 27.61) * 4.5;
  const bright = i % 6 === 0;
  return { top, left, size, delay, duration, bright };
});

export default function AuthBackground() {
  return (
    <>
      <style>{`
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 1; }
        }
        @keyframes skyDrift {
          0%, 100% { transform: translate(0, 0) scale(1.08); }
          50% { transform: translate(-2%, -1.2%) scale(1.1); }
        }
        @keyframes bandDrift {
          0%, 100% { transform: translate(-3%, 0) scale(1.15); }
          50% { transform: translate(2%, -1%) scale(1.18); }
        }
        @keyframes shootingStar {
          0% { transform: translate(0, 0); opacity: 0; }
          4% { opacity: 1; }
          16% { transform: translate(-380px, 200px); opacity: 0; }
          100% { transform: translate(-380px, 200px); opacity: 0; }
        }
      `}</style>

      {/* Base night-sky gradient */}
      <div
        className="pointer-events-none fixed inset-0 -z-30"
        style={{
          background:
            'linear-gradient(180deg, #04040A 0%, #050912 35%, #060B18 55%, #04060E 100%)',
        }}
      />

      {/* Milky-way nebula band — slow independent drift for depth */}
      <div
        className="pointer-events-none fixed inset-[-10%] -z-20 overflow-hidden"
        style={{ animation: 'bandDrift 70s ease-in-out infinite' }}
      >
        {/* soft wide glow spanning the band */}
        <div
          className="absolute left-1/2 top-1/2 h-[36%] w-[130%] -translate-x-1/2 -translate-y-1/2 opacity-40 blur-[70px]"
          style={{
            background:
              'radial-gradient(ellipse at center, #6E86C4 0%, #4A5A99 35%, transparent 75%)',
          }}
        />
        {/* denser, brighter core cluster */}
        <div
          className="absolute left-[38%] top-[46%] h-[22%] w-[70%] -translate-x-1/2 -translate-y-1/2 opacity-60 blur-[45px]"
          style={{
            background:
              'radial-gradient(ellipse at center, #C9D4F2 0%, #8FA3D6 30%, #4E5FA0 60%, transparent 80%)',
          }}
        />
        {/* subtle dust wisps for texture */}
        <div
          className="absolute left-[60%] top-[42%] h-[14%] w-[45%] -translate-x-1/2 -translate-y-1/2 opacity-30 blur-[35px]"
          style={{
            background: 'radial-gradient(ellipse at center, #A6B6E8 0%, transparent 75%)',
          }}
        />
      </div>

      {/* Ambient sparse stars — whole sky, slow parallax drift */}
      <div
        className="pointer-events-none fixed inset-[-10%] -z-10 overflow-hidden"
        style={{ animation: 'skyDrift 90s ease-in-out infinite' }}
      >
        {AMBIENT_STARS.map((s, i) => (
          <span
            key={`amb-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: s.size,
              height: s.size,
              opacity: 0.5,
              animation: `starTwinkle ${s.duration}s ease-in-out infinite`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}

        {/* Denser starfield inside the band, brighter */}
        {BAND_STARS.map((s, i) => (
          <span
            key={`band-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: s.size,
              height: s.size,
              boxShadow: s.bright ? '0 0 5px 1px rgba(255,255,255,0.8)' : 'none',
              animation: `starTwinkle ${s.duration}s ease-in-out infinite`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Soft vignette for depth */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 45%, rgba(2,2,8,0.6) 100%)',
        }}
      />

      {/* Rare, subtle shooting star */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute left-[68%] top-[18%] h-px w-24 rounded-full bg-gradient-to-r from-white via-white/70 to-transparent"
          style={{ animation: 'shootingStar 24s linear infinite', animationDelay: '5s' }}
        />
      </div>
    </>
  );
}
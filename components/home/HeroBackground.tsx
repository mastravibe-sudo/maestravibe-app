// components/home/HeroBackground.tsx
// Light, glassy animated "3D" backdrop for the home page hero section.
// Sits behind the HeroSlider — subtle drifting orbs + soft grid, matches
// the header's violet → indigo identity. Keep it behind content (z-0)
// with the slider/content at z-10 so text stays fully readable.
'use client';

export default function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
      <style>{`
        @keyframes hbFloatA {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(30px, -40px, 0) scale(1.08); }
        }
        @keyframes hbFloatB {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-35px, 30px, 0) scale(1.05); }
        }
        @keyframes hbFloatC {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(20px, 25px, 0) scale(1.1); }
        }
        @keyframes hbDrift {
          0% { background-position: 0 0; }
          100% { background-position: 120px 120px; }
        }
        @keyframes hbSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* base wash so the orbs sit on a very soft violet tint, not stark white */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-indigo-50" />

      {/* faint moving grid — gives the "3D plane" depth cue */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(124,58,237,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          animation: 'hbDrift 14s linear infinite',
        }}
      />

      {/* big soft violet orb, top-left */}
      <div
        className="absolute -top-24 -left-20 h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #a78bfa, transparent 70%)',
          animation: 'hbFloatA 9s ease-in-out infinite',
        }}
      />

      {/* indigo orb, right side */}
      <div
        className="absolute top-10 right-[-80px] h-[380px] w-[380px] rounded-full opacity-35 blur-3xl"
        style={{
          background: 'radial-gradient(circle at 60% 40%, #6366f1, transparent 70%)',
          animation: 'hbFloatB 11s ease-in-out infinite',
        }}
      />

      {/* small gold accent orb — echoes the logo's premium accent */}
      <div
        className="absolute bottom-[-60px] left-1/3 h-[240px] w-[240px] rounded-full opacity-30 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #fbbf24, transparent 70%)',
          animation: 'hbFloatC 13s ease-in-out infinite',
        }}
      />

      {/* glossy 3D ring, slowly rotating — mirrors the auth pages' glass-orb motif */}
      <div
        className="absolute top-1/2 left-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-200/40 opacity-30"
        style={{ animation: 'hbSpin 40s linear infinite' }}
      />
      <div
        className="absolute top-1/2 left-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-200/30 opacity-20"
        style={{ animation: 'hbSpin 60s linear infinite reverse' }}
      />
    </div>
  );
}
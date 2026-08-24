import React from 'react';

interface FluidBackgroundProps {
  isDark: boolean;
}

export const FluidBackground: React.FC<FluidBackgroundProps> = ({ isDark }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {isDark ? (
        /* Dark Mode: Deep Midnight Amethyst Fluid Mesh */
        <div className="absolute inset-0 bg-[#090514]">
          {/* Fluid Orb 1: Mystical Violet */}
          <div
            className="absolute top-[-10%] left-[15%] w-[55vw] h-[55vw] rounded-full filter blur-[100px] opacity-40 animate-fluid-1"
            style={{
              background: 'radial-gradient(circle, rgba(147, 51, 234, 0.45) 0%, rgba(88, 28, 135, 0.15) 70%, transparent 100%)',
            }}
          />

          {/* Fluid Orb 2: Kintsugi Gold Aura */}
          <div
            className="absolute bottom-[-15%] right-[10%] w-[50vw] h-[50vw] rounded-full filter blur-[110px] opacity-30 animate-fluid-2"
            style={{
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.35) 0%, rgba(184, 138, 34, 0.1) 65%, transparent 100%)',
            }}
          />

          {/* Fluid Orb 3: Twilight Indigo */}
          <div
            className="absolute top-[35%] right-[25%] w-[45vw] h-[45vw] rounded-full filter blur-[120px] opacity-35 animate-fluid-3"
            style={{
              background: 'radial-gradient(circle, rgba(126, 34, 206, 0.3) 0%, rgba(45, 10, 80, 0.15) 70%, transparent 100%)',
            }}
          />

          {/* Fluid Orb 4: Magenta Mystic */}
          <div
            className="absolute bottom-[20%] left-[-5%] w-[40vw] h-[40vw] rounded-full filter blur-[90px] opacity-25 animate-fluid-1"
            style={{
              background: 'radial-gradient(circle, rgba(192, 132, 252, 0.25) 0%, rgba(59, 7, 100, 0.1) 60%, transparent 100%)',
            }}
          />

          {/* Subtle Stardust Noise Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:36px_36px] opacity-[0.035]" />
        </div>
      ) : (
        /* Light Mode: Soft Lavender Washi & Solar Gold Mist */
        <div className="absolute inset-0 bg-[#FAF7FC]">
          {/* Fluid Orb 1: Gentle Lilac */}
          <div
            className="absolute top-[-10%] left-[20%] w-[55vw] h-[55vw] rounded-full filter blur-[90px] opacity-45 animate-fluid-1"
            style={{
              background: 'radial-gradient(circle, rgba(216, 180, 254, 0.4) 0%, rgba(243, 232, 255, 0.2) 70%, transparent 100%)',
            }}
          />

          {/* Fluid Orb 2: Solar Gold */}
          <div
            className="absolute bottom-[-10%] right-[15%] w-[50vw] h-[50vw] rounded-full filter blur-[90px] opacity-35 animate-fluid-2"
            style={{
              background: 'radial-gradient(circle, rgba(245, 230, 190, 0.5) 0%, rgba(212, 175, 55, 0.12) 65%, transparent 100%)',
            }}
          />

          {/* Fluid Orb 3: Soft Lavender */}
          <div
            className="absolute top-[30%] right-[20%] w-[45vw] h-[45vw] rounded-full filter blur-[100px] opacity-30 animate-fluid-3"
            style={{
              background: 'radial-gradient(circle, rgba(192, 132, 252, 0.25) 0%, rgba(233, 213, 255, 0.15) 70%, transparent 100%)',
            }}
          />

          {/* Subtle Geometric Texture Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#7e22ce_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.02]" />
        </div>
      )}
    </div>
  );
};

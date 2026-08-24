import React, { useEffect, useRef } from 'react';

export interface LiquidFluidBackgroundProps {
  className?: string;
  isDark: boolean;
  speed?: number;
}

/**
 * 塔罗圣所 3-Sphere 严格单色系动态流体画布 (Strict Monochromatic 3-Sphere Fluid Engine)
 * 1:1 严格对齐 TTZip (`TTZipFluidBackgroundView.swift`) 官方规范：
 * 1. 三个光球采用完全一致的单一基色 RGB (Dark: #9333EA, Light: #8B5CF6)。
 * 2. 严格遵循 TTZip 原生色彩层次：
 *    - Sphere 1: baseColor (100% 相对主透明度)
 *    - Sphere 2: baseColor.opacity(0.8) (80% 相对主透明度)
 *    - Sphere 3: baseColor.opacity(0.6) (60% 相对主透明度)
 * 3. 白天模式采用 `#FBFBFC` 极简清爽高雅和纸底色，透明度收敛至 0.15~0.18，绝无粉暗或浑浊杂质。
 */
export const LiquidFluidBackground: React.FC<LiquidFluidBackgroundProps> = ({
  className = '',
  isDark,
  speed = 0.3,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(Math.random() * 100);
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const DOWNSCALE = 4.0;
    let width = 0;
    let height = 0;

    const resize = () => {
      width = Math.max(Math.floor(window.innerWidth / DOWNSCALE), 100);
      height = Math.max(Math.floor(window.innerHeight / DOWNSCALE), 100);
      canvas.width = width;
      canvas.height = height;
    };

    resize();
    window.addEventListener('resize', resize);

    const render = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      phaseRef.current += Math.min(delta, 0.1) * speed;
      const phase = phaseRef.current;

      const w = width;
      const h = height;

      // ─── TTZip 经典三频混沌轨迹 ───
      const x1 = w / 2 + Math.cos(phase * 0.65) * (w * 0.32);
      const y1 = h / 2 + Math.sin(phase * 1.05) * (h * 0.22);

      const x2 = w / 2 + Math.sin(phase * 0.45) * (w * 0.38);
      const y2 = h / 2 + Math.cos(phase * 0.95) * (h * 0.28);

      const x3 = w / 2 + Math.cos(phase * 0.35) * (w * 0.28);
      const y3 = h / 2 + Math.sin(phase * 0.55) * (h * 0.36);

      const radius = Math.min(w, h) * 0.65;

      // ─── 统一基色 (Identical Base Color for all 3 Spheres) ───
      const r = isDark ? 147 : 139;
      const g = isDark ? 51 : 92;
      const b = isDark ? 234 : 246;

      // 清屏基底色：暗色为纯净午夜黑紫，亮色为 Apple/WSJ 极简高雅白
      ctx.fillStyle = isDark ? '#080511' : '#FBFBFC';
      ctx.fillRect(0, 0, w, h);

      if (isDark) {
        ctx.globalCompositeOperation = 'screen';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }

      // ─── 1. Sphere 1 (color1: 100% 相对主透明度) ───
      const alpha1 = isDark ? 0.45 : 0.16;
      const grad1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, radius);
      grad1.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha1})`);
      grad1.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha1 * 0.45})`);
      grad1.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.arc(x1, y1, radius, 0, Math.PI * 2);
      ctx.fill();

      // ─── 2. Sphere 2 (color2: 80% 相对主透明度 - TTZip 规范) ───
      const alpha2 = alpha1 * 0.8;
      const grad2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, radius * 1.05);
      grad2.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha2})`);
      grad2.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha2 * 0.45})`);
      grad2.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(x2, y2, radius * 1.05, 0, Math.PI * 2);
      ctx.fill();

      // ─── 3. Sphere 3 (color3: 60% 相对主透明度 - TTZip 规范) ───
      const alpha3 = alpha1 * 0.6;
      const grad3 = ctx.createRadialGradient(x3, y3, 0, x3, y3, radius * 0.95);
      grad3.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha3})`);
      grad3.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha3 * 0.45})`);
      grad3.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = grad3;
      ctx.beginPath();
      ctx.arc(x3, y3, radius * 0.95, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = 'source-over';
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isDark, speed]);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 select-none ${className}`}
    >
      {/* 4.0x 下采样硬件加速高斯模糊画布 */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover transform-gpu filter blur-[45px] scale-[1.08] transition-opacity duration-700"
        style={{
          willChange: 'transform, filter',
        }}
      />

      {/* 微质感星轨/和纸点阵 */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isDark
            ? 'bg-[radial-gradient(rgba(255,255,255,0.7)_1px,transparent_1px)] opacity-[0.03]'
            : 'bg-[radial-gradient(rgba(139,92,246,0.3)_1px,transparent_1px)] opacity-[0.02]'
        } [background-size:36px_36px]`}
      />
    </div>
  );
};

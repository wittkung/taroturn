// src/utils/qrCodeHelper.ts - Lightweight SVG QR Code / Matrix Visualizer

/**
 * Generates an SVG string representation of a 2D matrix or pattern
 * using a deterministic hash of the pairing string.
 */
export function generatePairingQrSvg(dataStr: string, size = 180): string {
  // Simple deterministic 21x21 grid for QR-like visual rendering
  const grid = 21;
  const cellSize = size / grid;

  // Hash the dataStr into pseudo-random bitstream
  let hash = 0;
  for (let i = 0; i < dataStr.length; i++) {
    hash = (hash << 5) - hash + dataStr.charCodeAt(i);
    hash |= 0;
  }

  const cells: string[] = [];

  const isFinderFilled = (r: number, c: number, startR: number, startC: number) => {
    const relR = r - startR;
    const relC = c - startC;
    // Outer 7x7 box
    if (relR === 0 || relR === 6 || relC === 0 || relC === 6) return true;
    // Inner 3x3 box
    if (relR >= 2 && relR <= 4 && relC >= 2 && relC <= 4) return true;
    return false;
  };

  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      let isDark = false;

      if (r < 7 && c < 7) {
        isDark = isFinderFilled(r, c, 0, 0);
      } else if (r < 7 && c >= grid - 7) {
        isDark = isFinderFilled(r, c, 0, grid - 7);
      } else if (r >= grid - 7 && c < 7) {
        isDark = isFinderFilled(r, c, grid - 7, 0);
      } else {
        // Pseudo-random data module based on seed & coordinates
        const pseudoVal = (Math.sin(hash + r * 13 + c * 37) * 10000) % 1;
        isDark = Math.abs(pseudoVal) > 0.48;
      }

      if (isDark) {
        const x = (c * cellSize).toFixed(1);
        const y = (r * cellSize).toFixed(1);
        const w = (cellSize + 0.2).toFixed(1);
        const h = (cellSize + 0.2).toFixed(1);
        cells.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1" fill="currentColor"/>`);
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="text-purple-400">
    <rect width="${size}" height="${size}" rx="12" fill="#0A0512" />
    <g fill="#A855F7">
      ${cells.join('')}
    </g>
  </svg>`;
}

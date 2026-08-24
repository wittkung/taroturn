// subpackages/tarot/utils/card_exporter.ts - 300DPI OffscreenCanvas 2D Long-form Card Exporter

export async function exportReadingArtCard(
  title: string,
  question: string,
  dominantElement: string,
  seedHex: string
): Promise<string> {
  const dpr = wx.getSystemInfoSync().pixelRatio || 2;
  const width = 375 * dpr;
  const height = 667 * dpr;

  const canvas = wx.createOffscreenCanvas({ type: "2d", width, height });
  const ctx = canvas.getContext("2d");

  // 1. Dark Zen Background
  ctx.fillStyle = "#0E081A";
  ctx.fillRect(0, 0, width, height);

  // 2. Kintsugi Gold Border
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 2 * dpr;
  ctx.strokeRect(16 * dpr, 16 * dpr, width - 32 * dpr, height - 32 * dpr);

  // 3. Header & Text
  ctx.fillStyle = "#D4AF37";
  ctx.font = `bold ${24 * dpr}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("TAROTURN SANCTUARY", width / 2, 60 * dpr);

  ctx.fillStyle = "#FAF5FF";
  ctx.font = `${16 * dpr}px sans-serif`;
  ctx.fillText(`牌阵: ${title}`, width / 2, 100 * dpr);

  if (question) {
    ctx.fillStyle = "#8E889B";
    ctx.font = `${14 * dpr}px sans-serif`;
    ctx.fillText(`焦点: ${question}`, width / 2, 130 * dpr);
  }

  // 4. Dominant Energy
  ctx.fillStyle = "#2E8B57";
  ctx.font = `bold ${18 * dpr}px sans-serif`;
  ctx.fillText(`主导能量: ${dominantElement}`, width / 2, 200 * dpr);

  // 5. Deterministic Seed Fingerprint
  ctx.fillStyle = "#8E889B";
  ctx.font = `${10 * dpr}px monospace`;
  ctx.fillText(`Seed: ${seedHex.slice(0, 32)}...`, width / 2, height - 40 * dpr);

  return new Promise((resolve, reject) => {
    wx.canvasToTempFilePath({
      canvas,
      success: (res) => resolve(res.tempFilePath),
      fail: reject
    });
  });
}

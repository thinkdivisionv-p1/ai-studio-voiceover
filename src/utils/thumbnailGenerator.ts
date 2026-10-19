import { VideoProject } from '../types/video';

export function renderThumbnailCanvas(project: VideoProject): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background
  const grad = ctx.createRadialGradient(900, 360, 50, 640, 360, 800);
  grad.addColorStop(0, '#0f2744');
  grad.addColorStop(0.5, '#071224');
  grad.addColorStop(1, '#030712');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1280, 720);

  // Grid texture
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 1280; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 720);
    ctx.stroke();
  }
  for (let y = 0; y < 720; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1280, y);
    ctx.stroke();
  }

  // Dominant Technical Graphic on the right side: Glowing High-Voltage Energy Node / Die Interconnect
  const focalX = 940;
  const focalY = 360;

  // Outer glowing rings
  for (let r = 240; r >= 60; r -= 40) {
    ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 + (240 - r) * 0.002})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(focalX, focalY, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Glowing core
  const coreGrad = ctx.createRadialGradient(focalX, focalY, 10, focalX, focalY, 120);
  coreGrad.addColorStop(0, '#00F0FF');
  coreGrad.addColorStop(0.3, 'rgba(0, 240, 255, 0.6)');
  coreGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(focalX, focalY, 120, 0, Math.PI * 2);
  ctx.fill();

  // Geometric Circuit Vector Lines
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(focalX - 160, focalY - 120);
  ctx.lineTo(focalX, focalY);
  ctx.lineTo(focalX + 160, focalY - 120);
  ctx.moveTo(focalX - 160, focalY + 120);
  ctx.lineTo(focalX, focalY);
  ctx.lineTo(focalX + 160, focalY + 120);
  ctx.stroke();

  // Floating Subject Badge on Graphic
  ctx.fillStyle = 'rgba(11, 23, 44, 0.9)';
  ctx.strokeStyle = '#00F0FF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(focalX - 110, focalY + 160, 220, 48, 12);
  ctx.fill();
  ctx.stroke();

  ctx.font = '800 18px "JetBrains Mono", monospace';
  ctx.fillStyle = '#00F0FF';
  ctx.textAlign = 'center';
  ctx.fillText(project.thumbnail.subjectTag || 'INFRASTRUCTURE', focalX, focalY + 192);

  // Left Side: Branding & Kinetic Headline Typography
  // Brand Header
  ctx.textAlign = 'left';
  ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('MARKET GAP DAILY', 90, 110);

  ctx.fillStyle = '#00F0FF';
  ctx.beginPath();
  ctx.arc(70, 102, 6, 0, Math.PI * 2);
  ctx.fill();

  // Big Bold 3-4 Word High-CTR Title
  const titleWords = (project.thumbnail.title || 'THE AI GRID COLLAPSE').split(' ');

  ctx.font = '900 82px "Plus Jakarta Sans", sans-serif';
  let curY = 240;

  for (const word of titleWords) {
    const isHighlight =
      word.toUpperCase() === (project.thumbnail.highlightWord || '').toUpperCase() ||
      word.includes('COLLAPSE') ||
      word.includes('BOTTLENECK') ||
      word.includes('CRUNCH') ||
      word.includes('WAR');

    if (isHighlight) {
      ctx.fillStyle = '#00F0FF';
      ctx.shadowColor = 'rgba(0, 240, 255, 0.6)';
      ctx.shadowBlur = 24;
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowBlur = 0;
    }

    ctx.fillText(word, 80, curY);
    curY += 92;
  }
  ctx.shadowBlur = 0;

  // High Stakes Metric Badge Pill
  const badgeY = Math.min(610, curY + 20);
  ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
  ctx.strokeStyle = '#F43F5E';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(80, badgeY - 45, 380, 64, 14);
  ctx.fill();
  ctx.stroke();

  ctx.font = '800 26px "JetBrains Mono", monospace';
  ctx.fillStyle = '#F43F5E';
  ctx.fillText(`⚡ ${project.thumbnail.metricBadge}`, 105, badgeY - 3);

  return canvas;
}

export function downloadThumbnailPNG(project: VideoProject) {
  const canvas = renderThumbnailCanvas(project);
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  const safeName = project.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.download = `${safeName}_thumbnail_1280x720.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

import { SceneBeat, VideoProject } from '../types/video';

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  currentTime: number;
  project: VideoProject;
}

export function renderVideoFrame({
  ctx,
  width,
  height,
  currentTime,
  project,
}: RenderContext) {
  // Find active scene
  const activeScene =
    project.scenes.find(
      (s) => currentTime >= s.startTime && currentTime <= s.endTime
    ) || project.scenes[project.scenes.length - 1];

  const sceneProgress = activeScene
    ? Math.max(
        0,
        Math.min(
          1,
          (currentTime - activeScene.startTime) /
            Math.max(0.1, activeScene.endTime - activeScene.startTime)
        )
      )
    : 0;

  // 1. Clear background
  ctx.save();
  ctx.fillStyle = '#070B14';
  ctx.fillRect(0, 0, width, height);

  // Background subtle radial glow
  const bgGrad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    50,
    width / 2,
    height / 2,
    width * 0.7
  );
  bgGrad.addColorStop(0, '#0c1a30');
  bgGrad.addColorStop(0.6, '#070e1b');
  bgGrad.addColorStop(1, '#03060d');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Animated Perspective Grid & Grid Lines
  drawTechGrid(ctx, width, height, currentTime, sceneProgress);

  // 3. Cinematic Subtle Camera Zoom & Pan (1.00 -> 1.04)
  ctx.save();
  const zoom = 1.0 + Math.sin(sceneProgress * Math.PI) * 0.035;
  const panX = Math.sin(currentTime * 0.4) * 8;
  const panY = Math.cos(currentTime * 0.3) * 6;
  ctx.translate(width / 2 + panX, height / 2 + panY);
  ctx.scale(zoom, zoom);
  ctx.translate(-width / 2, -height / 2);

  // 4. Render Active Scene Visual Content
  if (activeScene) {
    switch (activeScene.visualType) {
      case 'data-chart':
        renderDataChartScene(ctx, width, height, activeScene, sceneProgress);
        break;
      case 'infrastructure-diagram':
      case 'flow-pipeline':
        renderInfrastructureDiagram(ctx, width, height, activeScene, sceneProgress, currentTime);
        break;
      case 'market-comparison':
        renderMarketComparison(ctx, width, height, activeScene, sceneProgress, currentTime);
        break;
      case 'kinetic-text':
      default:
        renderKineticTypography(ctx, width, height, activeScene, sceneProgress, currentTime);
        break;
    }
  }

  ctx.restore(); // Restore camera transform

  // 5. Draw Channel HUD & Brand Overlay (Fixed layer)
  drawChannelHUD(ctx, width, height, currentTime, project, activeScene);

  // 6. Draw Captions Bar at bottom
  if (activeScene && activeScene.captionText) {
    drawCaptions(ctx, width, height, activeScene.captionText, sceneProgress);
  }

  ctx.restore();
}

/**
 * Animated technical grid floor and ambient particle circuits
 */
function drawTechGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  progress: number
) {
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.07)';
  ctx.lineWidth = 1;

  const gridSize = 64;
  const offsetX = (time * 12) % gridSize;
  const offsetY = (time * 8) % gridSize;

  // Vertical lines
  for (let x = -gridSize; x < width + gridSize; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x + offsetX, 0);
    ctx.lineTo(x + offsetX, height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = -gridSize; y < height + gridSize; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y + offsetY);
    ctx.lineTo(width, y + offsetY);
    ctx.stroke();
  }

  // Ambient floating glowing dots
  const particles = [
    { x: 0.15, y: 0.25, r: 2.5, speed: 0.8 },
    { x: 0.82, y: 0.35, r: 3.0, speed: 1.1 },
    { x: 0.28, y: 0.72, r: 2.0, speed: 0.6 },
    { x: 0.75, y: 0.80, r: 2.8, speed: 0.9 },
  ];

  for (const p of particles) {
    const px = (p.x * width + Math.sin(time * p.speed) * 30);
    const py = (p.y * height + Math.cos(time * p.speed) * 20);
    ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(px, py, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Kinetic Typography scene
 */
function renderKineticTypography(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: SceneBeat,
  progress: number,
  time: number
) {
  ctx.save();
  const easeProgress = easeOutCubic(Math.min(1, progress * 1.5));
  const centerY = height * 0.44;

  // Accent Tag
  if (scene.accentText) {
    ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#00F0FF';
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 10;
    ctx.textAlign = 'center';
    ctx.fillText(`[ ${scene.accentText} ]`, width / 2, centerY - 100);
    ctx.shadowBlur = 0;
  }

  // Big Kinetic Headline
  ctx.font = '800 52px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';

  const headlineY = centerY - 30 + (1 - easeProgress) * 40;
  ctx.globalAlpha = easeProgress;
  ctx.fillText(scene.headline, width / 2, headlineY);

  // Subheadline
  ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText(scene.subheadline, width / 2, centerY + 35);

  // Large Numerical Highlight Box if present
  if (scene.metric) {
    const metricY = centerY + 140;
    const metricAlpha = easeOutCubic(Math.max(0, Math.min(1, (progress - 0.2) * 2)));
    ctx.globalAlpha = metricAlpha;

    // Glowing badge background
    const boxW = 420;
    const boxH = 100;
    const boxX = width / 2 - boxW / 2;

    ctx.fillStyle = 'rgba(11, 23, 44, 0.85)';
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(0, 240, 255, 0.25)';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.roundRect(boxX, metricY - 50, boxW, boxH, 16);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Metric Value
    ctx.font = '800 48px "JetBrains Mono", monospace';
    ctx.fillStyle = '#00F0FF';
    ctx.textAlign = 'center';
    ctx.fillText(scene.metric.value, width / 2, metricY);

    // Metric Label
    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#CBD5E1';
    ctx.fillText(scene.metric.label, width / 2, metricY + 30);
  }

  ctx.restore();
}

/**
 * Animated Data Charts (Bar & Line)
 */
function renderDataChartScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: SceneBeat,
  progress: number
) {
  ctx.save();
  const chart = scene.chartData;
  if (!chart) return;

  const easeProgress = easeOutCubic(Math.min(1, progress * 1.4));

  // Scene Title
  ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(scene.headline, width / 2, height * 0.24);

  ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText(scene.subheadline, width / 2, height * 0.29);

  // Chart frame dimensions
  const chartX = width * 0.20;
  const chartY = height * 0.35;
  const chartW = width * 0.60;
  const chartH = height * 0.40;

  // Chart card background
  ctx.fillStyle = 'rgba(11, 23, 44, 0.8)';
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(chartX - 20, chartY - 20, chartW + 40, chartH + 70, 16);
  ctx.fill();
  ctx.stroke();

  // Grid lines inside chart
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
  for (let i = 0; i <= 4; i++) {
    const y = chartY + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(chartX, y);
    ctx.lineTo(chartX + chartW, y);
    ctx.stroke();
  }

  const maxVal = Math.max(...chart.values, 100);

  if (chart.type === 'bar') {
    const barCount = chart.values.length;
    const barWidth = (chartW / barCount) * 0.55;
    const gap = (chartW - barWidth * barCount) / (barCount + 1);

    for (let i = 0; i < barCount; i++) {
      const val = chart.values[i];
      const targetH = (val / maxVal) * (chartH * 0.85);
      const currentH = targetH * easeProgress;
      const x = chartX + gap + i * (barWidth + gap);
      const y = chartY + chartH - currentH;

      // Bar gradient
      const barGrad = ctx.createLinearGradient(0, y, 0, y + currentH);
      barGrad.addColorStop(0, '#00F0FF');
      barGrad.addColorStop(1, '#0284C7');

      ctx.fillStyle = barGrad;
      ctx.shadowColor = 'rgba(0, 240, 255, 0.4)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, currentH, [6, 6, 0, 0]);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Value label on top of bar
      if (easeProgress > 0.4) {
        ctx.font = '700 15px "JetBrains Mono", monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        const animatedVal = Math.round(val * easeProgress);
        ctx.fillText(`${animatedVal}${chart.unit || ''}`, x + barWidth / 2, y - 10);
      }

      // X Axis label
      ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.textAlign = 'center';
      ctx.fillText(chart.labels[i], x + barWidth / 2, chartY + chartH + 26);
    }
  } else {
    // Progressive Line Chart
    const points: { x: number; y: number }[] = [];
    const step = chartW / (chart.values.length - 1);

    for (let i = 0; i < chart.values.length; i++) {
      const x = chartX + i * step;
      const y = chartY + chartH - (chart.values[i] / maxVal) * (chartH * 0.85);
      points.push({ x, y });
    }

    // Draw line progressively
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 14;
    ctx.beginPath();

    const maxPoints = Math.max(1, Math.floor(points.length * easeProgress));
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < maxPoints; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Node circles & labels
    for (let i = 0; i < maxPoints; i++) {
      ctx.fillStyle = '#00F0FF';
      ctx.beginPath();
      ctx.arc(points[i].x, points[i].y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '700 14px "JetBrains Mono", monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText(`${chart.values[i]}`, points[i].x, points[i].y - 12);

      ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(chart.labels[i], points[i].x, chartY + chartH + 26);
    }
  }

  ctx.restore();
}

/**
 * Infrastructure / Flow Pipeline diagrams
 */
function renderInfrastructureDiagram(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: SceneBeat,
  progress: number,
  time: number
) {
  ctx.save();
  const nodes = scene.flowNodes || [];
  if (nodes.length === 0) return;

  // Title
  ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(scene.headline, width / 2, height * 0.25);

  ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText(scene.subheadline, width / 2, height * 0.30);

  const startX = width * 0.12;
  const totalW = width * 0.76;
  const nodeW = totalW / nodes.length - 28;
  const nodeH = 130;
  const nodeY = height * 0.44;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const x = startX + i * (nodeW + 35);
    const isBottleneck = node.status === 'bottleneck';
    const isSolution = node.status === 'solution';

    // Color definitions
    const strokeColor = isBottleneck
      ? 'rgba(244, 63, 94, 0.7)'
      : isSolution
      ? 'rgba(16, 185, 129, 0.7)'
      : 'rgba(0, 240, 255, 0.5)';

    const glowColor = isBottleneck ? '#F43F5E' : isSolution ? '#10B981' : '#00F0FF';

    // Draw connecting flow arrow to next node
    if (i < nodes.length - 1) {
      const nextX = startX + (i + 1) * (nodeW + 35);
      const lineY = nodeY + nodeH / 2;

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + nodeW, lineY);
      ctx.lineTo(nextX, lineY);
      ctx.stroke();

      // Moving animated electric pulse along interconnect
      const pulseT = (time * 1.8 + i * 0.4) % 1;
      const pulseX = x + nodeW + pulseT * (nextX - (x + nodeW));

      ctx.fillStyle = glowColor;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(pulseX, lineY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Node Card Box
    ctx.fillStyle = 'rgba(11, 23, 44, 0.9)';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = strokeColor;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(x, nodeY, nodeW, nodeH, 14);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Node Status Badge
    let badgeText = 'ACTIVE STEP';
    let badgeBg = 'rgba(0, 240, 255, 0.2)';
    let badgeFg = '#00F0FF';
    if (isBottleneck) {
      badgeText = 'BOTTLENECK';
      badgeBg = 'rgba(244, 63, 94, 0.2)';
      badgeFg = '#F43F5E';
    } else if (isSolution) {
      badgeText = 'SOLUTION';
      badgeBg = 'rgba(16, 185, 129, 0.2)';
      badgeFg = '#10B981';
    }

    ctx.fillStyle = badgeBg;
    ctx.beginPath();
    ctx.roundRect(x + 12, nodeY + 12, 100, 22, 6);
    ctx.fill();

    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = badgeFg;
    ctx.textAlign = 'left';
    ctx.fillText(badgeText, x + 20, nodeY + 27);

    // Node Title
    ctx.font = '700 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(node.title, x + 12, nodeY + 62);

    // Node Details
    ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94A3B8';
    wrapText(ctx, node.detail, x + 12, nodeY + 84, nodeW - 24, 16);
  }

  ctx.restore();
}

/**
 * Market Comparison scenes
 */
function renderMarketComparison(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: SceneBeat,
  progress: number,
  time: number
) {
  renderKineticTypography(ctx, width, height, scene, progress, time);
}

/**
 * Channel HUD Overlay (Market Gap Daily Branding)
 */
function drawChannelHUD(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  project: VideoProject,
  activeScene?: SceneBeat
) {
  ctx.save();

  // Top Left: Brand Logo Badge
  const brandX = 60;
  const brandY = 48;

  ctx.fillStyle = '#00F0FF';
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(brandX, brandY, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.font = '800 17px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.fillText('MARKET GAP DAILY', brandX + 16, brandY + 6);

  ctx.font = '600 12px "JetBrains Mono", monospace';
  ctx.fillStyle = '#00F0FF';
  ctx.fillText(project.episodeNumber || 'EP. 142', brandX + 205, brandY + 5);

  // Top Right: Story Phase Indicator
  if (activeScene) {
    ctx.textAlign = 'right';
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(
      `PHASE: ${activeScene.storyPhase.toUpperCase()}`,
      width - 60,
      brandY + 5
    );
  }

  // Top Progress Bar across entire video length
  const progressPercent = Math.min(1, Math.max(0, time / Math.max(1, project.totalDuration)));
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fillRect(0, 0, width, 4);

  const progGrad = ctx.createLinearGradient(0, 0, width, 0);
  progGrad.addColorStop(0, '#0284C7');
  progGrad.addColorStop(1, '#00F0FF');
  ctx.fillStyle = progGrad;
  ctx.fillRect(0, 0, width * progressPercent, 4);

  ctx.restore();
}

/**
 * Subtitles / Captions Banner
 */
function drawCaptions(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  captionText: string,
  progress: number
) {
  ctx.save();
  const capY = height - 90;

  // Background banner
  const words = captionText.split(' ');
  const displayLength = Math.max(1, Math.floor(words.length * Math.min(1, progress * 1.3)));
  const currentWords = words.slice(0, displayLength).join(' ');

  ctx.font = '600 23px "Plus Jakarta Sans", sans-serif';
  const textWidth = ctx.measureText(currentWords).width;

  const bgW = Math.max(340, textWidth + 60);
  const bgH = 54;
  const bgX = width / 2 - bgW / 2;

  ctx.fillStyle = 'rgba(7, 11, 20, 0.88)';
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(bgX, capY - 36, bgW, bgH, 12);
  ctx.fill();
  ctx.stroke();

  // Caption text
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(currentWords, width / 2, capY);

  ctx.restore();
}

// Utility text wrapping helper
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

// Cubic easing
function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

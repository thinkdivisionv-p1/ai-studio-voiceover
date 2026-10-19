import { SceneBeat } from '../types/video';

function formatSrtTimestamp(seconds: number): string {
  const pad = (num: number, size: number) => num.toString().padStart(size, '0');
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);

  return `${pad(hrs, 2)}:${pad(mins, 2)}:${pad(secs, 2)},${pad(millis, 3)}`;
}

export function generateSrtContent(scenes: SceneBeat[]): string {
  let srt = '';
  let index = 1;

  for (const scene of scenes) {
    if (!scene.captionText || !scene.captionText.trim()) continue;

    // Split long captions into shorter 4-second sub-captions for readability on mobile
    const duration = scene.endTime - scene.startTime;
    const words = scene.captionText.trim().split(/\s+/);

    if (words.length <= 12 || duration <= 4) {
      srt += `${index}\n`;
      srt += `${formatSrtTimestamp(scene.startTime)} --> ${formatSrtTimestamp(scene.endTime)}\n`;
      srt += `${scene.captionText.trim()}\n\n`;
      index++;
    } else {
      // Split into 2 chunks
      const half = Math.ceil(words.length / 2);
      const chunk1 = words.slice(0, half).join(' ');
      const chunk2 = words.slice(half).join(' ');
      const midTime = scene.startTime + duration / 2;

      srt += `${index}\n`;
      srt += `${formatSrtTimestamp(scene.startTime)} --> ${formatSrtTimestamp(midTime)}\n`;
      srt += `${chunk1}\n\n`;
      index++;

      srt += `${index}\n`;
      srt += `${formatSrtTimestamp(midTime)} --> ${formatSrtTimestamp(scene.endTime)}\n`;
      srt += `${chunk2}\n\n`;
      index++;
    }
  }

  return srt;
}

export function downloadSrtFile(scenes: SceneBeat[], episodeTitle: string) {
  const content = generateSrtContent(scenes);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeName = episodeTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.download = `${safeName}_captions.srt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

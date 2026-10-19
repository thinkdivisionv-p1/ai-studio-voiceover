/**
 * Lossless concatenation of unary Gemini 3.8 WAV audio clips (24kHz 16-bit mono).
 */

export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 8192; // Process in chunks to avoid call stack limits
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return window.btoa(binary);
}

/**
 * Stitch multiple 24kHz 16-bit mono WAV clips into a single continuous WAV clip.
 */
export function stitchWavClips(wavBase64List: string[]): string {
  if (!wavBase64List || wavBase64List.length === 0) {
    throw new Error('No WAV clips provided for stitching');
  }

  if (wavBase64List.length === 1) {
    return wavBase64List[0];
  }

  const pcmChunks: Uint8Array[] = [];
  let totalPcmLength = 0;

  for (const b64 of wavBase64List) {
    const fullWav = base64ToUint8Array(b64);
    // Standard RIFF WAV header is 44 bytes
    if (fullWav.length > 44) {
      const pcm = fullWav.subarray(44);
      pcmChunks.push(pcm);
      totalPcmLength += pcm.length;
    } else {
      pcmChunks.push(fullWav);
      totalPcmLength += fullWav.length;
    }
  }

  // Master WAV buffer = 44 bytes header + total PCM bytes
  const masterWav = new Uint8Array(44 + totalPcmLength);
  const view = new DataView(masterWav.buffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + totalPcmLength, true); // ChunkSize
  writeString(view, 8, 'WAVE');

  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, 24000, true); // SampleRate (24000 Hz)
  view.setUint32(28, 24000 * 1 * 2, true); // ByteRate = SampleRate * NumChannels * BitsPerSample/8
  view.setUint16(32, 2, true); // BlockAlign = NumChannels * BitsPerSample/8
  view.setUint16(34, 16, true); // BitsPerSample = 16

  // "data" sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, totalPcmLength, true); // Subchunk2Size

  // Copy all PCM payloads
  let offset = 44;
  for (const chunk of pcmChunks) {
    masterWav.set(chunk, offset);
    offset += chunk.length;
  }

  return uint8ArrayToBase64(masterWav);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

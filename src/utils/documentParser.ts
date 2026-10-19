import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker fallback for browser runtime
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.0.379'}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('PDF worker configuration warning:', e);
  }
}

export interface ParseResult {
  fileName: string;
  fileType: 'txt' | 'docx' | 'pdf' | 'unknown';
  fileSize: number;
  extractedText: string;
  wordCount: number;
  characterCount: number;
}

export async function parseDocument(file: File): Promise<ParseResult> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const arrayBuffer = await file.arrayBuffer();

  let extractedText = '';
  let fileType: 'txt' | 'docx' | 'pdf' | 'unknown' = 'unknown';

  if (extension === 'txt' || file.type === 'text/plain') {
    fileType = 'txt';
    const decoder = new TextDecoder('utf-8');
    extractedText = decoder.decode(arrayBuffer);
  } else if (extension === 'docx' || file.type.includes('wordprocessingml')) {
    fileType = 'docx';
    try {
      const result = await mammoth.extractRawText({ arrayBuffer });
      extractedText = result.value || '';
    } catch (docxErr) {
      console.error('Failed to parse docx with mammoth:', docxErr);
      throw new Error('Could not parse DOCX file. Ensure it is a valid, uncorrupted Word document.');
    }
  } else if (extension === 'pdf' || file.type === 'application/pdf') {
    fileType = 'pdf';
    try {
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true,
      });
      const pdf = await loadingTask.promise;
      const textPieces: string[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ');
        if (pageText.trim()) {
          textPieces.push(pageText.trim());
        }
      }
      extractedText = textPieces.join('\n\n');
    } catch (pdfErr) {
      console.error('PDF parsing error:', pdfErr);
      // Fallback simple string scan if worker fails
      try {
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const rawString = decoder.decode(arrayBuffer);
        const matches = rawString.match(/\((.*?)\)\s*Tj/g);
        if (matches && matches.length > 0) {
          extractedText = matches
            .map((m) => m.replace(/^\(/, '').replace(/\)\s*Tj$/, ''))
            .join(' ');
        } else {
          throw pdfErr;
        }
      } catch {
        throw new Error('Could not parse PDF text. Ensure the PDF is not password-protected or scanned images only.');
      }
    }
  } else {
    throw new Error(`Unsupported file type (.${extension}). Please upload .txt, .docx, or .pdf files.`);
  }

  // Clean and normalize text
  const cleanText = extractedText
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const wordCount = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;

  return {
    fileName: file.name,
    fileType,
    fileSize: file.size,
    extractedText: cleanText,
    wordCount,
    characterCount: cleanText.length,
  };
}

/**
 * Split text into logical narration segments preserving sentence boundaries.
 * Target chunk size defaults to ~160 words (~35-45 seconds of speech).
 */
export function chunkTextIntoSegments(
  text: string,
  targetWordsPerSegment: number = 160
): { id: string; title: string; text: string; wordCount: number; estimatedSeconds: number }[] {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const segments: { id: string; title: string; text: string; wordCount: number; estimatedSeconds: number }[] = [];

  let currentChunk: string[] = [];
  let currentWords = 0;
  let segmentIndex = 1;

  for (const para of paragraphs) {
    const paraWords = para.split(/\s+/).filter(Boolean).length;

    if (currentWords + paraWords > targetWordsPerSegment && currentChunk.length > 0) {
      const chunkText = currentChunk.join('\n\n').trim();
      const wc = chunkText.split(/\s+/).filter(Boolean).length;
      segments.push({
        id: `seg-${segmentIndex}`,
        title: `Segment ${segmentIndex}`,
        text: chunkText,
        wordCount: wc,
        estimatedSeconds: Math.max(1, Math.round((wc / 140) * 60)),
      });
      segmentIndex++;
      currentChunk = [para];
      currentWords = paraWords;
    } else {
      currentChunk.push(para);
      currentWords += paraWords;
    }
  }

  if (currentChunk.length > 0) {
    const chunkText = currentChunk.join('\n\n').trim();
    const wc = chunkText.split(/\s+/).filter(Boolean).length;
    segments.push({
      id: `seg-${segmentIndex}`,
      title: `Segment ${segmentIndex}`,
      text: chunkText,
      wordCount: wc,
      estimatedSeconds: Math.max(1, Math.round((wc / 140) * 60)),
    });
  }

  return segments;
}

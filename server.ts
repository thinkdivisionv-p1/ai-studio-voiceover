import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';
const STUDIO_PASSWORD = process.env.STUDIO_PASSWORD || process.env.VOICEOVER_ADMIN_KEY || '';

app.use(express.json({ limit: '15mb' }));

// Shared Gemini client utility on the server with User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Security Middleware: Optional Studio Password protection
function checkAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!STUDIO_PASSWORD) {
    return next(); // Password protection disabled (open personal mode)
  }

  const providedKey =
    req.headers['x-studio-password'] ||
    req.headers['authorization']?.replace(/^Bearer\s+/i, '');

  if (!providedKey || providedKey !== STUDIO_PASSWORD) {
    return res.status(401).json({
      error: 'Unauthorized: Studio password is required or incorrect.',
      requiresAuth: true,
    });
  }

  next();
}

// Auth verification endpoint
app.post('/api/auth/verify', (req, res) => {
  const isProtected = Boolean(STUDIO_PASSWORD);
  if (!isProtected) {
    return res.json({ protected: false, authorized: true });
  }

  const provided =
    req.headers['x-studio-password'] ||
    req.headers['authorization']?.replace(/^Bearer\s+/i, '') ||
    req.body?.password;

  if (provided === STUDIO_PASSWORD) {
    return res.json({ protected: true, authorized: true });
  }

  return res.status(401).json({ protected: true, authorized: false });
});

// TTS Generation endpoint
app.post('/api/tts/generate', checkAuth, async (req, res) => {
  try {
    const {
      mode = 'single',
      model = 'gemini-3.8-flash-lite-tts',
      text,
      voice = 'Kore',
      style,
      dialogue,
      speaker1 = { name: 'Alex', voice: 'Puck', style: '' },
      speaker2 = { name: 'Sam', voice: 'Kore', style: '' },
    } = req.body;

    // Validate model selection
    const allowedModels = ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts'];
    const selectedModel = allowedModels.includes(model) ? model : 'gemini-3.8-flash-lite-tts';

    if (mode === 'single') {
      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Text prompt is required for single speaker generation.' });
      }

      if (text.length > 25000) {
        return res.status(400).json({
          error: 'Text length exceeds 25,000 characters. Please use the Multi-Segment Document Narration feature.',
        });
      }

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text.trim(),
                speechMetadata: style && style.trim() ? { style: style.trim() } : undefined,
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
            },
          },
        },
      });

      const candidate = response.candidates?.[0];
      const part = candidate?.content?.parts?.[0];
      const base64Audio = part?.inlineData?.data;

      if (!base64Audio) {
        return res.status(500).json({
          error: 'Gemini audio model did not return inline audio. Try adjusting the text or pacing.',
        });
      }

      return res.json({
        success: true,
        mimeType: part?.inlineData?.mimeType || 'audio/wav',
        audioBase64: base64Audio,
        modelUsed: selectedModel,
        voiceUsed: voice,
      });
    } else {
      // Dual-speaker / Dialogue mode
      if (!dialogue || !Array.isArray(dialogue) || dialogue.length === 0) {
        return res.status(400).json({ error: 'Dialogue turns array is required for dual speaker mode.' });
      }

      const parts = dialogue.map((line: { speaker: string; text: string; style?: string }) => {
        const spk = line.speaker?.trim() || speaker1.name;
        return {
          text: `${spk}: ${line.text?.trim() || ''}`,
          speechMetadata: {
            speaker: spk,
            style: line.style?.trim() || undefined,
          },
        };
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts,
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: speaker1.name,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: speaker1.voice || 'Puck' },
                  },
                },
                {
                  speaker: speaker2.name,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: speaker2.voice || 'Kore' },
                  },
                },
              ],
            },
          },
        },
      });

      const candidate = response.candidates?.[0];
      const part = candidate?.content?.parts?.[0];
      const base64Audio = part?.inlineData?.data;

      if (!base64Audio) {
        return res.status(500).json({
          error: 'Multi-speaker model did not return audio data. Ensure two speakers are configured.',
        });
      }

      return res.json({
        success: true,
        mimeType: part?.inlineData?.mimeType || 'audio/wav',
        audioBase64: base64Audio,
        modelUsed: 'gemini-3.8-flash-tts',
        speakersUsed: [speaker1, speaker2],
      });
    }
  } catch (err: any) {
    console.error('Error in /api/tts/generate:', err);
    return res.status(500).json({
      error: err.message || 'Failed to synthesize voiceover audio with Gemini.',
    });
  }
});

// AI Script Generation Endpoint
app.post('/api/script/generate', checkAuth, async (req, res) => {
  try {
    const { topic, genre, targetSeconds = 30, mode = 'single', speaker1Name = 'Alex', speaker2Name = 'Sam' } = req.body;

    const approxWordCount = Math.round((targetSeconds / 60) * 140);

    let prompt = '';
    if (mode === 'single') {
      prompt = `You are an expert voiceover scriptwriter and audio director.
Write a captivating, natural-sounding voiceover script on the topic: "${topic || 'Introducing Next-Gen AI Technology'}".
Target Genre/Tone: ${genre || 'Engaging Tech Explainer'}
Approximate speaking duration: ${targetSeconds} seconds (around ${approxWordCount} words).

Important formatting guidelines for Gemini Voiceover:
1. Include natural emotional cues and cadence.
2. You MAY include Gemini expressive vocal tags where naturally fitting, such as:
   - <breath> (for a natural intake of breath before an emotional statement)
   - <sigh> (for relief or wistfulness)
   - <laugh> (for amusement)
   - <gasp> (for astonishment)
3. Return ONLY the raw spoken script without meta-commentary or title headers.`;
    } else {
      prompt = `You are a scriptwriter for dual-speaker dialogues and podcasts.
Create a natural, dynamic 2-person dialogue on the topic: "${topic || 'The Future of AI Voice Synthesis'}".
Speakers: "${speaker1Name}" and "${speaker2Name}".
Genre/Tone: ${genre || 'Dynamic Podcast Co-hosts'}
Approximate speaking duration: ${targetSeconds} seconds (around ${approxWordCount} words total).

Format guidelines:
1. Each turn must start with the speaker's name followed by a colon, e.g.:
${speaker1Name}: Hey everyone, welcome back.
${speaker2Name}: Glad to be here, |yeah| this is exciting!
2. You can embed vocal bursts like <breath>, <laugh>, <gasp>, or backchannels like |mhm|, |yeah| naturally into the lines.
3. Keep the banter lively, authentic, and fast-paced.
4. Return ONLY the dialogue lines in format "Speaker: line".`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You craft compelling, broadcast-ready voiceover scripts with natural human pacing and speech tags.',
        temperature: 0.8,
      },
    });

    const script = response.text?.trim() || '';
    return res.json({ success: true, script });
  } catch (err: any) {
    console.error('Error in /api/script/generate:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate voiceover script.' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ai-studio-voiceover-api',
    authProtected: Boolean(STUDIO_PASSWORD),
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer();

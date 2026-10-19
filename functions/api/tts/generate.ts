interface Env {
  GEMINI_API_KEY: string;
  STUDIO_PASSWORD?: string;
  VOICEOVER_ADMIN_KEY?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // 1. Check Authentication if password configured
  const requiredPassword = env.STUDIO_PASSWORD || env.VOICEOVER_ADMIN_KEY;
  if (requiredPassword) {
    const provided =
      request.headers.get('x-studio-password') ||
      request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (!provided || provided !== requiredPassword) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Studio password required.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // 2. Parse Body
  try {
    const body: any = await request.json();
    const {
      mode = 'single',
      model = 'gemini-3.8-flash-lite-tts',
      text,
      voice = 'Kore',
      style,
      dialogue,
      speaker1 = { name: 'Alex', voice: 'Puck', style: '' },
      speaker2 = { name: 'Sam', voice: 'Kore', style: '' },
    } = body;

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY environment variable is missing on Cloudflare.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const allowedModels = ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts'];
    const selectedModel = allowedModels.includes(model) ? model : 'gemini-3.8-flash-lite-tts';

    let geminiPayload: any;

    if (mode === 'single') {
      if (!text || typeof text !== 'string' || !text.trim()) {
        return new Response(
          JSON.stringify({ error: 'Text prompt is required.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      geminiPayload = {
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
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
            },
          },
        },
      };
    } else {
      // Multi-speaker / Dialogue mode
      if (!dialogue || !Array.isArray(dialogue) || dialogue.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Dialogue array is required for dual speaker mode.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
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

      geminiPayload = {
        contents: [{ role: 'user', parts }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: speaker1.name,
                  voiceConfig: { prebuiltVoiceConfig: { voiceName: speaker1.voice || 'Puck' } },
                },
                {
                  speaker: speaker2.name,
                  voiceConfig: { prebuiltVoiceConfig: { voiceName: speaker2.voice || 'Kore' } },
                },
              ],
            },
          },
        },
      };
    }

    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${
      mode === 'single' ? selectedModel : 'gemini-3.8-flash-tts'
    }:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'aistudio-build',
      },
      body: JSON.stringify(geminiPayload),
    });

    const geminiData: any = await geminiRes.json();

    if (!geminiRes.ok) {
      return new Response(
        JSON.stringify({ error: geminiData.error?.message || 'Gemini API call failed.' }),
        { status: geminiRes.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const part = geminiData.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = part?.inlineData?.data;

    if (!base64Audio) {
      return new Response(
        JSON.stringify({ error: 'No audio returned from Gemini.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        mimeType: part?.inlineData?.mimeType || 'audio/wav',
        audioBase64: base64Audio,
        modelUsed: mode === 'single' ? selectedModel : 'gemini-3.8-flash-tts',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal Cloudflare Function error.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

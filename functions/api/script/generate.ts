interface Env {
  GEMINI_API_KEY: string;
  STUDIO_PASSWORD?: string;
  VOICEOVER_ADMIN_KEY?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

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

  try {
    const body: any = await request.json();
    const {
      topic = 'Next-Gen AI Technology',
      genre = 'Engaging Tech Explainer',
      targetSeconds = 30,
      mode = 'single',
      speaker1Name = 'Alex',
      speaker2Name = 'Sam',
    } = body;

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY is not configured on Cloudflare.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const approxWordCount = Math.round((targetSeconds / 60) * 140);
    const prompt =
      mode === 'single'
        ? `You are an expert voiceover scriptwriter. Write a voiceover script on "${topic}". Genre: ${genre}. Speaking duration: ~${targetSeconds}s (~${approxWordCount} words). Embed vocal tags like <breath>, <laugh>, <sigh>, <gasp> where fitting. Return ONLY the spoken script.`
        : `You are a scriptwriter for dual-speaker podcasts. Topic: "${topic}". Speakers: "${speaker1Name}" and "${speaker2Name}". Genre: ${genre}. Duration: ~${targetSeconds}s (~${approxWordCount} words). Format: Speaker: line. Embed tags like <breath>, <laugh>, |mhm|, |yeah|. Return ONLY the dialogue turns.`;

    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'aistudio-build',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const geminiData: any = await geminiRes.json();
    if (!geminiRes.ok) {
      return new Response(
        JSON.stringify({ error: geminiData.error?.message || 'Script generation failed.' }),
        { status: geminiRes.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const script = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    return new Response(JSON.stringify({ success: true, script }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

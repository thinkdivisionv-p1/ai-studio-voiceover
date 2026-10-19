export const onRequestGet: PagesFunction = async () => {
  return new Response(
    JSON.stringify({
      status: 'ok',
      service: 'ai-studio-voiceover-cloudflare',
      runtime: 'Cloudflare Pages / Workers Edge',
      timestamp: Date.now(),
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};

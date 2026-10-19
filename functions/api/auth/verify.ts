interface Env {
  STUDIO_PASSWORD?: string;
  VOICEOVER_ADMIN_KEY?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const requiredPassword = env.STUDIO_PASSWORD || env.VOICEOVER_ADMIN_KEY;

  if (!requiredPassword) {
    return new Response(JSON.stringify({ protected: false, authorized: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {}

  const provided =
    request.headers.get('x-studio-password') ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    body?.password;

  if (provided === requiredPassword) {
    return new Response(JSON.stringify({ protected: true, authorized: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ protected: true, authorized: false }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  const requiredPassword = env.STUDIO_PASSWORD || env.VOICEOVER_ADMIN_KEY;
  return new Response(
    JSON.stringify({
      status: 'ok',
      service: 'cloudflare-voiceover-worker',
      protected: Boolean(requiredPassword),
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};

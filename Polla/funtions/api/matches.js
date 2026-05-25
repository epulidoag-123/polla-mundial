/**
 * Cloudflare Pages Function — /api/matches
 * 
 * Este archivo va en la carpeta functions/api/ de tu proyecto.
 * Cloudflare lo convierte automáticamente en un endpoint /api/matches
 * que puede leer variables de entorno de forma segura.
 *
 * Variable requerida en Pages → Settings → Environment variables:
 *   FOOTBALL_API_KEY = tu_key_de_football-data.org
 */

export async function onRequest(context) {
  const { env } = context;

  // Headers CORS — necesarios para que el HTML pueda llamar a esta ruta
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Responder preflight
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Verificar que la variable de entorno existe
  if (!env.FOOTBALL_API_KEY) {
    return new Response(
      JSON.stringify({
        error: 'FOOTBALL_API_KEY no configurada',
        solucion: 'Ve a Pages → tu proyecto → Settings → Environment variables → agrega FOOTBALL_API_KEY'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const resp = await fetch(
      'https://api.football-data.org/v4/competitions/WC/matches',
      {
        headers: {
          'X-Auth-Token': env.FOOTBALL_API_KEY,
          'Accept': 'application/json',
        },
      }
    );

    if (!resp.ok) {
      const detail = await resp.text().catch(() => '');
      return new Response(
        JSON.stringify({
          error: `football-data.org respondió ${resp.status}`,
          detail: detail.slice(0, 200)
        }),
        {
          status: resp.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await resp.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
      },
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Error interno', detail: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

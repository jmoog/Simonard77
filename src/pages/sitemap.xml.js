import { site } from '../data/site.js';
import { pagesPubliees } from '../data/urls.js';

export const prerender = true;

/**
 * Sitemap généré à partir de data/urls.js.
 *
 * Seules les pages dont le `status` vaut 'ok' y figurent : déclarer une URL
 * qui répond en 404 fait perdre du budget de crawl et dégrade la confiance
 * que Google accorde au fichier. Il n'y a donc RIEN à modifier ici quand une
 * page est publiée — il suffit de passer son status à 'ok'.
 */
export async function GET() {
  const urls = pagesPubliees
    .map((u) => `  <url><loc>${site.domain}${u.path}</loc></url>`)
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}

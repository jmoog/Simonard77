import type { MiddlewareHandler } from 'astro';

/**
 * Contournement du proxy Traefik de Coolify.
 *
 * Sur les réponses de statut ≠ 200 (typiquement notre page 404), le middleware
 * `gzip` de Traefik ajoute un en-tête `content-encoding: gzip` SANS compresser
 * le corps. Le navigateur tente alors de décompresser du HTML en clair, échoue
 * (ERR_CONTENT_DECODING_FAILED) et affiche sa propre page d'erreur à la place
 * de src/pages/404.astro. Vérifié le 3 août 2026 : le serveur Node renvoie bien
 * la page complète, c'est le proxy qui corrompt la réponse.
 *
 * La parade : poser nous-mêmes `content-encoding: identity`. Un proxy ne
 * (re)compresse jamais une réponse qui déclare déjà un encodage, donc Traefik
 * passe son chemin. `no-transform` dit la même chose à tout intermédiaire qui
 * respecterait la RFC 9111.
 *
 * À supprimer le jour où Traefik est mis à jour côté Coolify — c'est un
 * contournement, pas une correction du vrai bug.
 */
export const onRequest: MiddlewareHandler = async (_context, next) => {
  const response = await next();

  if (response.status < 400) return response;

  const headers = new Headers(response.headers);
  headers.set('content-encoding', 'identity');
  headers.set('cache-control', 'no-store, no-transform');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

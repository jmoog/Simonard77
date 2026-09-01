import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://simonard-77.fr',
  // Les URLs de l'ancien site WordPress se terminent toutes par une barre
  // oblique (https://simonard-77.fr/entretien-de-toiture/). On conserve ce
  // format à l'identique : c'est la condition pour que la migration se fasse
  // sans redirection ni perte de positions.
  trailingSlash: 'always',
  // "hybrid" : toutes les pages restent statiques (rapides, servies telles
  // quelles) sauf celles qui déclarent explicitement `export const prerender
  // = false` — seule /api/devis est dynamique, pour envoyer l'e-mail
  // côté serveur au moment de la soumission du formulaire.
  output: 'hybrid',
  adapter: node({ mode: 'standalone' }),
  // Le formulaire envoie du JSON en fetch vers /api/devis/ : on désactive la
  // vérification d'origine d'Astro, qui rejette ce type de requête derrière un
  // reverse proxy (Coolify/Traefik + Cloudflare).
  security: { checkOrigin: false },
  compressHTML: true,
});

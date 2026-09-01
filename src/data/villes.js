import { urls } from './urls.js';

/* ────────────────────────────────────────────────────────────────────────
 * Pages ville — données et variantes.
 *
 * ⚠ CONTENU PROVISOIRE : le corps de ces pages est en LOREM IPSUM. Seuls
 * les titres, la structure et les liens sont définitifs. Tant qu'une ville
 * n'est pas passée à `status: 'ok'` dans data/urls.js, sa page est en
 * noindex, absente du sitemap, du plan du site et du menu.
 *
 * RÈGLE : rien ici ne doit AFFIRMER quoi que ce soit sur une commune tant
 * que l'information n'a pas été fournie. Les quartiers, la mairie et les
 * accès sont donc vides par défaut : la page affiche alors un encart
 * « à compléter » au lieu d'inventer.
 * ──────────────────────────────────────────────────────────────────────── */

/** `/couvreur-annet-sur-marne/` → `annet-sur-marne` ; `/claye-souilly/` → `claye-souilly`. */
export const slugVille = (path) => path.replace(/^\/(?:couvreur-)?/, '').replace(/\/$/, '');

/**
 * Les onze pages ville du site WordPress, dans l'ordre de urls.js.
 * `rang` sert à faire tourner les variantes de titres et d'accroches d'une
 * ville à l'autre : onze pages bâties sur le même gabarit ne doivent pas
 * ouvrir sur onze fois la même phrase.
 */
export const villes = urls
  .filter((u) => u.silo === 'ville')
  .map((u, rang) => ({ slug: slugVille(u.path), path: u.path, nom: u.commune, rang }));

export const villeParSlug = (slug) => villes.find((v) => v.slug === slug);

/**
 * Informations locales RÉELLES, à renseigner commune par commune.
 * Format attendu :
 *
 *   'claye-souilly': {
 *     codePostal: '77410',
 *     mairie: { adresse: '…', tel: '…', site: 'https://…', carte: 'https://…' },
 *     quartiers: ['…', '…'],
 *   },
 *
 * Tant que la clé est absente, la page n'affirme rien sur la commune.
 */
export const infosVille = {};

/** Quatre variantes de titre, pour éviter onze balises identiques. */
export const variantesTitre = [
  (v) => `Couvreur à ${v} (77)`,
  (v) => `Couvreur zingueur à ${v}`,
  (v) => `Votre couvreur à ${v}`,
  (v) => `Artisan couvreur à ${v}`,
];

/** Quatre variantes d'accroche (une seule phrase, factuelle, sans promesse chiffrée). */
export const variantesAccroche = [
  (v) => `Couverture, entretien, zinguerie, isolation et étanchéité à ${v} et dans les communes voisines.`,
  (v) => `De la tuile cassée à la réfection complète : je prends votre toiture en charge à ${v}.`,
  (v) => `Un seul interlocuteur pour votre toiture à ${v}, du diagnostic à la dernière tuile posée.`,
  (v) => `Artisan couvreur zingueur, j'interviens à ${v} en neuf comme en rénovation.`,
];

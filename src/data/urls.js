// ────────────────────────────────────────────────────────────────────────
// CARTE DE MIGRATION — les URLs du site WordPress simonard-77.fr.
//
// Règle du projet : ces URLs sont CONSERVÉES À L'IDENTIQUE. Aucune
// redirection, aucun changement de slug, aucune barre oblique finale
// supprimée. C'est ce qui permet de basculer WordPress → Astro sans perdre
// les positions acquises.
//
// Ce fichier est la source de vérité unique de l'avancement de la migration :
//   - `status: 'ok'`   → la page existe dans src/pages/, elle est liée dans
//                        le menu / le footer / le plan du site, et publiée
//                        dans sitemap.xml ;
//   - `status: 'todo'` → la page reste à écrire. Elle n'est NI liée NI
//                        publiée dans le sitemap, pour ne créer aucune 404.
//
// Faire passer une page de 'todo' à 'ok' suffit : le sitemap, le plan du site
// et le balisage schema.org la prennent en compte automatiquement.
//
// Relevé du sitemap XML de production le 31 août 2026 : 41 URLs dans
// sitemaps.xml + 6 pages transverses listées à part = 47 URLs au total.
// ────────────────────────────────────────────────────────────────────────

export const SILOS = {
  transverse: 'Pages principales',
  couverture: 'Couverture',
  entretien: 'Entretien de toiture',
  zinguerie: 'Zinguerie',
  isolation: 'Isolation',
  etancheite: 'Étanchéité',
  ville: "Zones d'intervention",
};

export const urls = [
  // ── Pages transverses ────────────────────────────────────────────────
  { path: '/',                  silo: 'transverse', label: 'Accueil',                status: 'ok'   },
  { path: '/devis-gratuit/',    silo: 'transverse', label: 'Devis gratuit',          status: 'ok', nouveau: true },
  { path: '/mentions-legales/', silo: 'transverse', label: 'Mentions légales',       status: 'ok'   },
  { path: '/plan-du-site/',     silo: 'transverse', label: 'Plan du site',           status: 'ok'   },
  { path: '/a-propos/',         silo: 'transverse', label: 'À propos',               status: 'todo' },
  { path: '/contact/',          silo: 'transverse', label: 'Contact',                status: 'todo' },

  // ── Couverture ───────────────────────────────────────────────────────
  { path: '/renovation-refection-de-toiture/',                          silo: 'couverture', label: 'Rénovation & réfection de toiture',   status: 'todo' },
  { path: '/reparation-de-toiture/',                                    silo: 'couverture', label: 'Réparation de toiture',               status: 'todo' },
  { path: '/reparation-de-vos-fuites-de-toiture/',                      silo: 'couverture', label: 'Réparation de fuites de toiture',     status: 'todo' },
  { path: '/intervention-rapide-couvreur-pour-vos-urgences-de-toiture/',silo: 'couverture', label: 'Urgences de toiture',                 status: 'todo' },
  { path: '/remplacement-de-couverture-en-tuile/',                      silo: 'couverture', label: 'Couverture en tuile',                 status: 'todo' },
  { path: '/remplacement-de-couverture-en-ardoise/',                    silo: 'couverture', label: 'Couverture en ardoise',               status: 'todo' },
  { path: '/remplacement-couverture-en-zinc/',                          silo: 'couverture', label: 'Couverture en zinc',                  status: 'todo' },
  { path: '/remplacement-de-couverture-en-shingle/',                    silo: 'couverture', label: 'Couverture en shingle',               status: 'todo' },
  { path: '/toiture-bac-acier/',                                        silo: 'couverture', label: 'Toiture en bac acier',                status: 'todo' },
  { path: '/pose-dune-fenetre-de-toit-velux/',                          silo: 'couverture', label: 'Pose de fenêtre de toit (Velux)',     status: 'todo' },
  { path: '/remplacement-faitage-maconne/',                             silo: 'couverture', label: 'Remplacement de faîtage maçonné',     status: 'todo' },
  { path: '/refection-des-rives/',                                      silo: 'couverture', label: 'Réfection des rives',                 status: 'todo' },

  // ── Entretien de toiture ─────────────────────────────────────────────
  { path: '/entretien-de-toiture/',                                     silo: 'entretien', label: 'Entretien de toiture',                 status: 'todo', pilier: true },
  { path: '/nettoyage-demoussage-de-toiture/',                          silo: 'entretien', label: 'Nettoyage & démoussage de toiture',    status: 'todo' },
  { path: '/application-de-traitement-de-toiture/',                     silo: 'entretien', label: 'Application de traitement de toiture', status: 'todo' },
  { path: '/application-de-traitement-anti-mousse-professionnel/',      silo: 'entretien', label: 'Traitement anti-mousse',               status: 'todo' },
  { path: '/application-de-traitement-hydrofuge-incolore/',             silo: 'entretien', label: 'Hydrofuge incolore',                   status: 'todo' },
  { path: '/impermeabilisation-par-hydrofuge-colore/',                  silo: 'entretien', label: 'Hydrofuge coloré',                     status: 'todo' },

  // ── Zinguerie ────────────────────────────────────────────────────────
  { path: '/refection-zinguerie/',                                      silo: 'zinguerie', label: 'Réfection de zinguerie',               status: 'todo', pilier: true },
  { path: '/installation-remplacement-de-gouttieres/',                  silo: 'zinguerie', label: 'Installation & remplacement de gouttières', status: 'todo' },
  { path: '/installation-et-etancheite-noue-toiture/',                  silo: 'zinguerie', label: 'Noues de toiture',                     status: 'todo' },
  { path: '/etancheite-cheminee/',                                      silo: 'zinguerie', label: 'Étanchéité de cheminée',               status: 'todo' },

  // ── Isolation ────────────────────────────────────────────────────────
  { path: '/isolation-de-toiture/',                                     silo: 'isolation', label: 'Isolation de toiture',                 status: 'todo', pilier: true },
  { path: '/isolation-des-combles-par-soufflage/',                      silo: 'isolation', label: 'Isolation des combles par soufflage',  status: 'todo' },
  { path: '/isolation-des-rampants-de-toiture-par-linterieur/',         silo: 'isolation', label: 'Rampants par l’intérieur',             status: 'todo' },
  { path: '/isolation-des-rampants-de-toiture-par-lexterieur/',         silo: 'isolation', label: 'Rampants par l’extérieur',             status: 'todo' },
  { path: '/isolation-mince/',                                          silo: 'isolation', label: 'Isolation mince',                      status: 'todo' },
  { path: '/isolation-des-pignons/',                                    silo: 'isolation', label: 'Isolation des pignons',                status: 'todo' },
  { path: '/isolation-par-lexterieur-bardage-pvc/',                     silo: 'isolation', label: 'Bardage PVC (ITE)',                    status: 'todo' },

  // ── Étanchéité ───────────────────────────────────────────────────────
  { path: '/etancheite-toit-terrasse/',                                 silo: 'etancheite', label: 'Étanchéité de toit-terrasse',         status: 'todo', pilier: true },
  { path: '/etancheite-bitume-isolation-bitumineuse/',                  silo: 'etancheite', label: 'Étanchéité bitume',                   status: 'todo' },

  // ── Zones d'intervention ─────────────────────────────────────────────
  // Attention : la page de Claye-Souilly n'a PAS le préfixe « couvreur- »
  // dans le site WordPress (/claye-souilly/). On conserve cette exception
  // telle quelle plutôt que d'uniformiser : changer ce slug ferait perdre
  // l'historique de la page de la commune du bureau secondaire.
  { path: '/claye-souilly/',            silo: 'ville', label: 'Claye-Souilly',      commune: 'Claye-Souilly',      status: 'todo' },
  { path: '/couvreur-annet-sur-marne/', silo: 'ville', label: 'Annet-sur-Marne',    commune: 'Annet-sur-Marne',    status: 'todo' },
  { path: '/couvreur-charmentray/',     silo: 'ville', label: 'Charmentray',        commune: 'Charmentray',        status: 'todo' },
  { path: '/couvreur-charny/',          silo: 'ville', label: 'Charny',             commune: 'Charny',             status: 'todo' },
  { path: '/couvreur-fresnes-sur-marne/',silo: 'ville',label: 'Fresnes-sur-Marne',  commune: 'Fresnes-sur-Marne',  status: 'todo' },
  { path: '/couvreur-gressy/',          silo: 'ville', label: 'Gressy',             commune: 'Gressy',             status: 'todo' },
  { path: '/couvreur-messy/',           silo: 'ville', label: 'Messy',              commune: 'Messy',              status: 'todo' },
  { path: '/couvreur-precy-sur-marne/', silo: 'ville', label: 'Précy-sur-Marne',    commune: 'Précy-sur-Marne',    status: 'todo' },
  { path: '/couvreur-saint-mesmes/',    silo: 'ville', label: 'Saint-Mesmes',       commune: 'Saint-Mesmes',       status: 'todo' },
  { path: '/couvreur-villeroy/',        silo: 'ville', label: 'Villeroy',           commune: 'Villeroy',           status: 'todo' },
  { path: '/couvreur-villevaude/',      silo: 'ville', label: 'Villevaudé',         commune: 'Villevaudé',         status: 'todo' },
];

/** Pages réellement en ligne : seule liste dans laquelle on peut créer un lien. */
export const pagesPubliees = urls.filter((u) => u.status === 'ok');

/** Pages publiées d'un silo donné. */
export const parSilo = (silo) => pagesPubliees.filter((u) => u.silo === silo);

/** Une page est-elle en ligne ? Sert à décider lien ou texte simple. */
export const estPubliee = (path) => pagesPubliees.some((u) => u.path === path);

/** Compteur d'avancement, affiché dans le README. */
export const avancement = { total: urls.length, faites: pagesPubliees.length };

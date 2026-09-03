import { urls, lienSiPubliee } from './urls.js';
import { site } from './site.js';

/* ────────────────────────────────────────────────────────────────────────
 * Pages ville — données et variantes.
 *
 * Rédaction du 3 septembre 2026, d'après le modèle générique LocalPlace
 * (title ≠ H1, accroche en deux versions, trois arguments, quatre cartes de
 * prestations dont l'ordre tourne, section photo, section longue, encadré
 * mairie), adapté à M. Simonard : pas de prestation façade, et aucun chiffre
 * qui ne soit pas documenté (pas d'« années d'expérience », pas de label).
 *
 * Toutes les variantes tournent avec le RANG de la commune (son ordre dans
 * urls.js) : dix pages bâties sur le même gabarit ne doivent ni ouvrir sur
 * les mêmes phrases, ni afficher les mêmes cartes dans le même ordre.
 *
 * RÈGLE : rien n'est affirmé sur une commune sans source. Les coordonnées
 * des mairies viennent de l'annuaire officiel de l'administration
 * (lannuaire.service-public.gouv.fr), relevé du 3 septembre 2026.
 * ──────────────────────────────────────────────────────────────────────── */

/** `/couvreur-annet-sur-marne/` → `annet-sur-marne`. */
export const slugVille = (path) => path.replace(/^\/(?:couvreur-)?/, '').replace(/\/$/, '');

/**
 * Les dix pages ville du site WordPress, dans l'ordre de urls.js
 * (/claye-souilly/ a été retirée : l'accueil porte Claye-Souilly).
 */
export const villes = urls
  .filter((u) => u.silo === 'ville')
  .map((u, rang) => ({ slug: slugVille(u.path), path: u.path, nom: u.commune, rang }));

export const villeParSlug = (slug) => villes.find((v) => v.slug === slug);

/**
 * Les quatre façons de nommer le métier. Le title, le H1 et le H2 de la
 * section photo en prennent chacun une différente (décalage par le rang).
 */
export const EXPRESSIONS = ['Couvreur', 'Artisan couvreur', 'Entreprise de couverture', 'Couvreur zingueur'];

/**
 * Quatre meta descriptions, en rotation. Le numéro d'abord (il s'affiche tel
 * quel dans les résultats), puis une phrase qui parle du toit du visiteur —
 * pas un mot-clé collé à un nom de commune.
 */
export const METAS = [
  (v) => `✅ ${site.phone} — Confiez votre toit à ${site.brand}, couvreur à ${v} : entretien, démoussage, réparation et rénovation. Devis gratuit.`,
  (v) => `✅ ${site.phone} — Couvreur zingueur à ${v}, j'entretiens, répare et rénove votre toiture, et j'interviens en urgence. Devis gratuit.`,
  (v) => `✅ ${site.phone} — Votre toiture à ${v} mérite un artisan couvreur : ${site.brand}. Entretien, remplacement, zinguerie. Devis gratuit.`,
  (v) => `✅ ${site.phone} — Fuite, tuiles cassées, toit à refaire à ${v} ? ${site.brand} intervient vite, en urgence ou sur rendez-vous. Devis gratuit.`,
];

/**
 * Photos. Les meilleures prises de vue en hero (ciel dégagé, toiture
 * finie), les photos d'intervention dans la section « artisan au travail »,
 * les deux portraits en alternance, et une galerie de trois photos par page
 * qui ne reprend jamais une photo déjà affichée plus haut.
 */
const P = (src, w, h, alt) => ({ src: `/photos/${src}`, w, h, alt });
export const PHOTOS_HERO = [
  P('vue-aerienne-maison-avec-toiture-ardoise-terminee-simonard-couvreur-77.webp', 1444, 993, 'Toiture en ardoise entièrement refaite, vue aérienne'),
  P('pavillon-avec-toiture-en-tuiles-terminee-simonard-couvreur-77-02.webp', 1600, 1199, 'Pavillon dont la toiture en tuiles vient d\'être terminée'),
  P('vue-aerienne-toiture-ardoise-et-tourelle-terminees-simonard-couvreur-77.webp', 1442, 989, 'Toiture en ardoise et tourelle terminées, vue aérienne'),
  P('maison-sous-echafaudage-chantier-de-couverture-simonard-couvreur-77-01.webp', 1200, 900, 'Maison sous échafaudage pendant un chantier de couverture'),
  P('remplacement-de-toiture-en-cours-sur-pavillon-simonard-couvreur-77.webp', 1600, 1199, 'Remplacement d\'une toiture en cours sur un pavillon'),
];
export const PHOTOS_INTERVENTION = [
  P('artisan-simonard-sur-echelle-pour-le-nettoyage-dune-toiture-77.webp', 1600, 1200, 'L\'artisan sur son échelle pour le nettoyage d\'une toiture'),
  P('installation-dune-gouttiere-par-lartisan-simonard-couvreur-77.webp', 1024, 768, 'Installation d\'une gouttière par l\'artisan'),
  P('banderole-simonard-sur-chantier-de-toiture-avec-echafaudage-77.webp', 1200, 900, 'Banderole Simonard sur un chantier de toiture sous échafaudage'),
  P('gouttiere-et-descente-en-zinc-sur-chantier-simonard-couvreur-77.webp', 1200, 900, 'Gouttière et descente en zinc posées sur un chantier'),
];
export const PORTRAITS = [
  P('portrait-kenny-simonard-couvreur-devant-pavillon-77-02.webp', 864, 1152, 'Kenny Simonard, artisan couvreur, devant un pavillon en chantier'),
  P('portrait-kenny-simonard-devant-son-vehicule-77.webp', 629, 550, 'Kenny Simonard devant son véhicule d\'intervention'),
];
export const PHOTOS_GALERIE = [
  P('toiture-en-tuiles-renovee-vue-de-la-rue-simonard-couvreur-77.webp', 1600, 1199, 'Toiture en tuiles rénovée, vue depuis la rue'),
  P('mise-en-etancheite-dun-pied-de-cheminee-simonard-couvreur-77.webp', 733, 550, 'Mise en étanchéité d\'un pied de cheminée'),
  P('isolation-en-laine-de-verre-entre-les-liteaux-simonard-couvreur-77.webp', 1600, 1200, 'Isolation en laine de verre posée entre les liteaux'),
  P('pavillon-vue-densemble-du-chantier-de-couverture-simonard-couvreur-77.webp', 1600, 1200, 'Vue d\'ensemble d\'un chantier de couverture sur un pavillon'),
  ...PHOTOS_INTERVENTION,
  ...PHOTOS_HERO,
];

/**
 * Deux accroches de hero, en alternance. Elles présentent l'artisan par son
 * nom, juste sous le H1 : le visiteur doit savoir tout de suite à qui il a
 * affaire. Elles se terminent par « : » et ouvrent la liste des prestations.
 */
export const ACCROCHES = [
  (v) => `<strong>${site.founder}</strong>, artisan couvreur zingueur. Avec mon équipe, je prends votre toiture en charge à ${v}, de l'entretien courant à la rénovation complète :`,
  (v) => `Je suis <strong>${site.founder}</strong>, couvreur de père en fils. Mon équipe et moi intervenons à ${v} pour tout ce qui touche à votre toit :`,
];

/** Les six prestations listées sous l'accroche — l'ordre tourne avec le rang. */
export const PRESTATIONS_HERO = [
  'Entretien de toiture : démoussage et nettoyage',
  'Application de traitements hydrofuges',
  'Réparation de toiture et recherche de fuites',
  'Remplacement de toiture ancienne',
  'Rénovation de toiture abîmée',
  'Zinguerie, isolation et étanchéité',
];

/**
 * Trois pools d'arguments : la page en affiche un de chaque, choisi par le
 * rang. Tout ce qui est écrit ici est documenté sur le site (deux
 * générations, décennale, matériaux travaillés).
 */
export const ARGUMENTS = [
  [
    { titre: 'Entreprise artisanale de couverture', texte: 'Une équipe formée sur les chantiers.' },
    { titre: 'Couvreur depuis deux générations', texte: 'Un savoir-faire transmis et affiné.' },
    { titre: 'Couvreur de père en fils', texte: "Le métier appris aux côtés de la génération d'avant." },
  ],
  [
    { titre: 'Garantie décennale', texte: 'Tous les travaux sont couverts.' },
    { titre: 'Tous matériaux de couverture', texte: 'Tuile, ardoise, zinc, bac acier, shingle.' },
    { titre: 'Devis et déplacement gratuits', texte: 'Un devis écrit, détaillé, sans engagement.' },
  ],
  [
    { titre: 'Savoir-faire artisanal', texte: 'Le travail bien fait, du support aux finitions.' },
    { titre: 'Toitures traditionnelles et modernes', texte: "Technique traditionnelle et matériaux d'aujourd'hui." },
    { titre: 'Zinguerie sur mesure', texte: 'Gouttières, noues et solins façonnés aux cotes du toit.' },
  ],
];

/** Section longue : sujet et objet du H2 « Faites appel à … pour … ». */
export const SUJETS_LONG = ['un couvreur zingueur', 'une entreprise de couverture', 'un artisan couvreur', 'un couvreur'];
export const OBJETS_LONG = ['entretenir votre toiture', 'refaire votre toiture', 'remplacer votre toiture', 'vos travaux de zinguerie'];

/**
 * Corps de la section longue : quatre variantes, DANS LE MÊME ORDRE que
 * OBJETS_LONG, pour que le texte parle de ce que le H2 annonce (entretien,
 * réfection, remplacement, zinguerie). La page choisit la variante avec le
 * même index que l'objet du H2. Réécrites le 3 septembre 2026 à la place
 * d'un bloc unique en jargon d'agence, identique sur les dix pages.
 *
 * Registre : première personne, l'artisan explique ce qu'il constate et ce
 * qu'il fait. Tout fait sur l'entreprise vient de l'accueil (équipe sans
 * sous-traitance, visite du toit et des combles, devis poste par poste,
 * chantier nettoyé chaque soir, nettoyage manuel ou basse pression, pièces
 * façonnées aux cotes relevées sur place). Aucun détail local inventé : le
 * nom de la commune n'est jamais accompagné d'une affirmation sur ses toits.
 *
 * Les liens passent par lienSiPubliee() : texte simple tant que la page
 * cible est 'todo' dans data/urls.js.
 */
const L = lienSiPubliee;
export const TEXTES_LONGS = [
  // 0 — entretenir votre toiture
  (nom) => [
    `Une toiture s'entretient comme le reste de la maison. À ${nom} comme ailleurs, la mousse s'installe sur les pans à l'ombre, retient l'eau et finit par rendre les tuiles poreuses ; les gouttières se bouchent de feuilles ; le mortier du faîtage se fissure. Rien de tout cela n'est grave la première année. Laissé sans suite, ça devient une réfection.`,
    `Mon équipe et moi nettoyons la toiture à la brosse ou à basse pression, selon l'état des tuiles, puis nous appliquons un traitement anti-mousse et un hydrofuge, incolore ou coloré, qui fait ruisseler l'eau et retarde la repousse. J'en profite toujours pour contrôler le faîtage, les solins et les pieds de cheminée : ce sont eux qui fuient en premier. Le détail est sur la page ${L('/nettoyage-demoussage-de-toiture/', 'nettoyage et démoussage de toiture')}.`,
    `Un entretien régulier coûte bien moins qu'un remplacement de couverture, et c'est lui qui repousse ce remplacement le plus longtemps. Si vous ne savez pas dans quel état est votre toit, je viens le voir à ${nom} : le déplacement est gratuit, et vous saurez si votre toit a besoin d'un nettoyage, d'une réparation, ou de rien du tout.`,
  ],
  // 1 — refaire votre toiture
  (nom) => [
    `Refaire une toiture, ce n'est pas forcément tout remplacer. Une réfection partielle reprend le pan abîmé et laisse le reste en place ; un remplacement complet dépose toute la couverture et repart sur un écran de sous-toiture et des liteaux neufs. Entre les deux, il y a la visite : je monte sur le toit, je passe dans les combles, et je vous dis laquelle des deux s'impose pour votre maison à ${nom}.`,
    `Tuile plate, tuile mécanique, ardoise, zinc, bac acier ou shingle : chaque matériau a ses règles de pose, son écartement de liteaux, ses recouvrements, et je les respecte. Les fournitures sont choisies dans la continuité de la couverture existante, pour que le pan refait s'accorde avec le reste. Les étapes d'un chantier sont détaillées sur la page ${L('/renovation-refection-de-toiture/', 'rénovation et réfection de toiture')}.`,
    `Pendant les travaux, la maison reste protégée : le toit est bâché tant que la couverture neuve n'est pas posée, et le chantier est nettoyé chaque soir. Vous recevez avant de commencer un devis écrit, poste par poste — surfaces, matériaux, dépose et évacuation, échafaudage — et la date du chantier est fixée avec vous.`,
  ],
  // 2 — remplacer votre toiture
  (nom) => [
    `Quand la tuile est devenue poreuse sur tout le pan, que les fixations lâchent et qu'il n'y a plus d'écran sous la couverture, réparer tuile par tuile ne mène nulle part : la couverture est en fin de vie. Si c'est le cas de votre maison à ${nom}, je remplace la toiture entière, de la dépose de l'ancienne couverture jusqu'à la zinguerie.`,
    `Le chantier suit toujours le même ordre : dépose et évacuation des gravats, écran de sous-toiture, liteaux neufs, pose de la couverture rang par rang, zinguerie raccordée, nettoyage. Le toit ouvert, c'est aussi le bon moment pour isoler les rampants ou les combles : on intervient sur le toit, autant en profiter. Tout est détaillé sur la page ${L('/renovation-refection-de-toiture/', 'remplacement de toiture')}.`,
    `Avant de vous engager, vous avez un devis écrit et détaillé, poste par poste, et le déplacement pour venir voir le toit est gratuit. Tous les travaux sont couverts par la garantie décennale, et c'est mon équipe qui les réalise, sans sous-traitance.`,
  ],
  // 3 — vos travaux de zinguerie
  (nom) => [
    `Quand une gouttière est percée, qu'une descente est bouchée ou qu'un solin s'est décollé, l'eau ne suit plus le chemin prévu : elle coule sur la façade, s'infiltre dans le mur ou remonte sous les tuiles. Beaucoup de fuites qu'on attribue à la couverture viennent en réalité de là.`,
    `Zinc, aluminium ou PVC : je dépose l'ancienne gouttière, je pose les crochets, je règle la pente vers la descente et je soude les jonctions, avec des pièces façonnées aux cotes relevées sur votre toit à ${nom}. Quand une gouttière peut encore se réparer, je le dis : remplacer n'est pas toujours la bonne réponse. Le détail est sur la page ${L('/installation-remplacement-de-gouttieres/', 'pose et remplacement de gouttières')}.`,
    `Les pieds de cheminée et les noues demandent le même soin : un solin décollé ou une noue mal raccordée laissent passer l'eau au premier orage. Je les contrôle à chaque passage sur un toit, et je les reprends avant qu'ils ne fassent des dégâts à l'intérieur.`,
  ],
];

/**
 * Dernier paragraphe de la section longue, commun aux quatre variantes : il
 * amène l'encadré mairie. Reçoit `deNom` (« de Gressy » / « d'Annet-sur-Marne »),
 * l'élision étant calculée dans PageVille.astro.
 */
export const TEXTE_URBANISME = (deNom) =>
  `Un dernier point avant d'ouvrir un chantier : le règlement d'urbanisme ${deNom}. Refaire une toiture à l'identique demande rarement une autorisation, mais changer de matériau, de couleur ou de forme oblige à déposer une déclaration préalable de travaux, et le PLU peut imposer la teinte de la tuile ou interdire certains matériaux. Le service urbanisme de la mairie vous le confirme avant les travaux.`;

/**
 * Informations locales RÉELLES. Source : fiche « Mairie » de chaque commune
 * sur lannuaire.service-public.gouv.fr, relevée le 3 septembre 2026. Les dix
 * communes partagent le code postal 77410.
 *
 * `quartiers` n'est renseigné pour aucune commune : la page n'affiche alors
 * rien à ce sujet plutôt qu'une liste que personne n'aurait vérifiée.
 */
export const infosVille = {
  'annet-sur-marne':  { codePostal: '77410', mairie: { adresse: '38 rue Paul-Valentin, 77410 Annet-sur-Marne',     tel: '01 60 26 02 79', site: 'https://www.annetsurmarne.com/' } },
  'charmentray':      { codePostal: '77410', mairie: { adresse: '39 rue des Deux-Jumeaux, 77410 Charmentray',      tel: '01 60 01 90 06', site: 'https://www.charmentray.fr/' } },
  'charny':           { codePostal: '77410', mairie: { adresse: "1 rue de l'Église, 77410 Charny",                 tel: '01 60 01 91 08', site: 'http://www.charny77.fr/' } },
  'fresnes-sur-marne':{ codePostal: '77410', mairie: { adresse: "2 rue de l'Église, 77410 Fresnes-sur-Marne",      tel: '01 60 26 03 81', site: 'https://www.fresnes-sur-marne.fr/' } },
  'gressy':           { codePostal: '77410', mairie: { adresse: '12 avenue du Château, 77410 Gressy',              tel: '01 60 26 11 15', site: 'http://www.gressy.fr/' } },
  'messy':            { codePostal: '77410', mairie: { adresse: '10 rue Michelle Chevrery, 77410 Messy',           tel: '01 78 74 42 42', site: 'http://www.messy.fr/' } },
  'precy-sur-marne':  { codePostal: '77410', mairie: { adresse: 'Chemin des Noyers, 77410 Précy-sur-Marne',        tel: '01 60 01 92 60', site: 'https://www.precysurmarne.fr/' } },
  'saint-mesmes':     { codePostal: '77410', mairie: { adresse: '12 rue de Richebourg, 77410 Saint-Mesmes',        tel: '01 60 26 24 20', site: 'https://www.saint-mesmes.fr/fr/' } },
  'villeroy':         { codePostal: '77410', mairie: { adresse: '4 rue Saint-Pierre, 77410 Villeroy',              tel: '01 60 01 95 33', site: 'https://www.villeroy77.fr/' } },
  'villevaude':       { codePostal: '77410', mairie: { adresse: '27 rue Charles-de-Gaulle, 77410 Villevaudé',      tel: '01 60 26 20 19', site: 'https://www.villevaude.fr/' } },
};

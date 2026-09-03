// ────────────────────────────────────────────────────────────────────────
// Données centrales de l'entreprise.
//
// Source des informations : mentions légales et pages du site WordPress
// actuel (simonard-77.fr, relevé du 31 août 2026). Tout ce qui n'a pas été
// vérifié reste VIDE plutôt que d'être inventé : un champ vide n'est pas
// affiché, alors qu'un numéro approximatif dans les mentions légales est une
// déclaration légale erronée. Les champs à compléter sont signalés par un
// commentaire « À COMPLÉTER ».
//
// Particularité de ce dossier : le SIÈGE SOCIAL est à Le Perreux-sur-Marne
// (94) et il existe un BUREAU SECONDAIRE à Claye-Souilly (77). Les deux
// adresses sont distinctes et ne servent pas au même endroit :
//   - `address`         → le bureau secondaire (77), utilisé sur le site et
//                         dans le balisage schema.org : c'est lui qui porte
//                         le signal de proximité locale ;
//   - `registeredOffice`→ le siège social (94), utilisé UNIQUEMENT dans les
//                         mentions légales, où la loi l'exige.
//
// NE RIEN AFFIRMER D'AUTRE sur ces adresses : pas d'atelier, pas de dépôt,
// pas de « c'est de là que partent les chantiers ». Rien ne le documente.
// ────────────────────────────────────────────────────────────────────────
export const site = {
  brand: 'M. Simonard',
  // Verrouillage de la marque telle qu'elle apparaît sur le logo et le
  // panneau de chantier — à réutiliser tel quel dans les annuaires et sur la
  // fiche Google, la cohérence du NAP en dépend.
  brandFull: 'Simonard Artisan Couvreur',
  founder: 'Kenny Simonard',
  domain: 'https://simonard-77.fr',
  phone: '06 65 50 53 07',
  phoneHref: '0665505307',
  phoneIntl: '+33665505307',
  whatsapp: 'https://wa.me/33665505307',
  email: 'contact@simonard.fr',

  // Bureau secondaire, en Seine-et-Marne. « Seine-et-Marne » est
  // FÉMININ : on écrit « en Seine-et-Marne » et « dans toute la
  // Seine-et-Marne ». Jamais « dans le Seine-et-Marne ».
  address: {
    street: '69 allée des Lilas',
    postalCode: '77410',
    city: 'Claye-Souilly',
    region: 'Seine-et-Marne',
    department: '77',
    country: 'FR',
  },
  // Coordonnées approximatives de Claye-Souilly : servent à centrer la carte
  // de la zone d'intervention sur /devis-gratuit/. À affiner si le marqueur
  // doit tomber exactement sur l'adresse.
  geo: { lat: 48.9436, lng: 2.6883 },

  // ── Informations légales ──────────────────────────────────────────────
  // Valeurs reprises du texte des mentions légales validé par le client
  // (relevé du site WordPress, 31 août 2026). Le seul écart volontaire est
  // l'hébergeur : voir `hosting` plus bas.
  legalName: 'SASU M. Kenny SIMONARD',
  legalForm: 'Société par actions simplifiée unipersonnelle (SASU)',
  capital: '1 000,00 €',
  registeredOffice: '194 avenue du Maréchal Joffre, 94170 Le Perreux-sur-Marne',
  siret: '929 523 389 00013',
  siren: '929 523 389',
  tva: 'FR17929523389',
  // Graphie des textes juridiques : nom de famille en capitales. Ailleurs sur
  // le site c'est `founder` (« Kenny Simonard ») qui s'affiche.
  founderLegal: 'Kenny SIMONARD',
  // Délégué à la protection des données, désigné dans les mentions légales.
  dpo: 'Kenny SIMONARD',
  // Juridiction compétente : Créteil, ressort du siège social (94).
  tribunal: 'Créteil',
  // À COMPLÉTER (facultatif) : année de création, pour `foundingDate` en
  // schema.org. Le champ vide n'est simplement pas balisé.
  foundingDate: '',

  // ── Fiche Google & profils ────────────────────────────────────────────
  // À COMPLÉTER quand la fiche Google Business sera créée / revendiquée :
  // `googleReviewUrl` alimente le bouton « Laissez-nous un avis » du footer,
  // `sameAs` alimente le balisage schema.org. Vides = rien ne s'affiche,
  // aucun lien mort.
  googleReviewUrl: '',
  sameAs: [],

  // ── Mesure d'audience & Search Console ────────────────────────────────
  // Identifiant de mesure Google Analytics 4 (propriété simonard-77.fr).
  // Le script Google n'est chargé QU'APRÈS le clic « Accepter » du bandeau
  // cookies (voir Layout.astro) : avant ce clic, aucune requête ne part vers
  // Google, aucun cookie n'est déposé. Champ vide = pas de mesure d'audience,
  // et le bandeau ne s'affiche pas (il n'aurait rien à demander).
  gaId: 'G-G1SJQ84DXM',
  // À COMPLÉTER : vérification de la propriété dans la Google Search Console
  // par la méthode « Balise HTML » (Paramètres → Validation de la propriété).
  // Coller UNIQUEMENT la valeur de l'attribut content, pas la balise entière.
  // Pourquoi cette méthode : la vérification « via Google Analytics » lit le
  // snippet gtag dans le HTML de l'accueil, or ici il n'y est pas tant que le
  // visiteur n'a pas consenti — elle échouerait. La balise meta, elle, ne
  // dépose rien et ne dépend d'aucun consentement.
  googleSiteVerification: '',

  // ── Hébergeur (mentions légales) ──────────────────────────────────────
  // Seul écart assumé par rapport au texte du site WordPress, qui déclarait
  // encore Hostinger : le site est hébergé sur le VPS Hetzner (CPX32), et le
  // nouveau site Astro y sera déployé. Coordonnées relevées sur
  // hetzner.com/legal/legal-notice/. Si l'hébergement change, corriger ici —
  // la valeur n'est écrite qu'à cet endroit.
  hosting: {
    name: 'Hetzner Online GmbH',
    address: 'Industriestr. 25, 91710 Gunzenhausen, Allemagne',
    phone: '+49 (0)9831 505-0',
    email: 'info@hetzner.com',
    site: 'https://www.hetzner.com',
  },
};

// ── Menu principal ────────────────────────────────────────────────────────
// Les cinq rubriques du site WordPress actuel. Une entrée SANS `href` reste
// visible mais s'affiche en texte simple : sa page chapeau n'est pas encore
// écrite, et on refuse d'envoyer visiteurs et Google sur une 404. Le jour où
// la page est publiée, ajouter son `href` ici — et dans PAGES_PUBLIEES
// (data/urls.js), qui pilote le sitemap, le plan du site et le balisage.
export const mainNav = [
  { label: 'Couverture' },
  { label: 'Entretien' },
  { label: 'Zinguerie' },
  { label: 'Isolation' },
  { label: 'Étanchéité' },
];

// Arguments de réassurance affichés sous le hero de l'accueil.
export const reassurance = [
  { titre: 'Devis gratuit', texte: 'Déplacement et chiffrage offerts, sans engagement.' },
  { titre: 'Urgences toiture', texte: 'Fuite, tuiles arrachées : intervention rapide.' },
  { titre: 'Garantie décennale', texte: 'Tous les travaux sont couverts.' },
  { titre: 'Artisan du 77', texte: 'Interventions dans tout le nord de la Seine-et-Marne.' },
];

// Communes de la zone d'intervention. Elles s'affichent en texte tant que
// leur page n'existe pas (`href` absent) — voir data/urls.js pour la liste
// complète des URLs à reprendre du site WordPress.
export const communes = [
  'Claye-Souilly', 'Villeparisis', 'Mitry-Mory', 'Meaux', 'Chelles',
  'Lagny-sur-Marne', 'Annet-sur-Marne', 'Villevaudé', 'Gressy', 'Messy',
  'Charny', 'Charmentray', 'Précy-sur-Marne', 'Saint-Mesmes', 'Villeroy',
  'Fresnes-sur-Marne',
];

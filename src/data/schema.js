import { site, communes } from './site.js';
import { urls, pagesPubliees } from './urls.js';

/* ────────────────────────────────────────────────────────────────────────
 * Balisage schema.org du site (JSON-LD, un seul @graph par page).
 *
 * Principes :
 * - une seule entité entreprise, @id stable `#localbusiness`, référencée
 *   par @id partout ailleurs — jamais dupliquée en clair ;
 * - `areaServed` reflète la PORTÉE DE LA PAGE : le département sur l'accueil
 *   et les pages piliers, la commune SEULE sur les pages ville (une page
 *   « couvreur à Gressy » qui revendique seize communes dilue le signal
 *   local et contredit son propre contenu) ;
 * - un nœud `WebPage` par page, relié au WebSite et au fil d'Ariane, qui
 *   porte aussi le type `FAQPage` quand la page affiche réellement une FAQ ;
 * - un nœud `Service` par page de prestation ou de ville, rattaché à
 *   l'entreprise via `provider` ;
 * - aucune URL en 404 et aucun placeholder dans le balisage : l'OfferCatalog
 *   est construit à partir de data/urls.js et ne contient que les pages dont
 *   le status vaut 'ok'.
 *
 * L'adresse balisée est celle du BUREAU SECONDAIRE (Claye-Souilly, 77) et
 * non celle du siège social (Le Perreux-sur-Marne, 94) : c'est elle qui porte
 * le signal de proximité en Seine-et-Marne. Le siège social n'apparaît que
 * dans les mentions légales.
 * ──────────────────────────────────────────────────────────────────────── */

const abs = (path = '/') => `${site.domain}${path}`;
const BUSINESS_ID = `${site.domain}/#localbusiness`;
const WEBSITE_ID = `${site.domain}/#website`;

// Photos de chantier réelles : Google privilégie des visuels du travail
// effectué, le logo restant sur la propriété `logo`.
const PHOTOS_ENTREPRISE = [
  '/photos/vue-aerienne-maison-avec-toiture-ardoise-terminee-simonard-couvreur-77.webp',
  '/photos/pavillon-avec-toiture-en-tuiles-terminee-simonard-couvreur-77-02.webp',
  '/photos/installation-dune-gouttiere-par-lartisan-simonard-couvreur-77.webp',
];

const FRANCE = { '@type': 'Country', name: 'France' };
const DEPARTEMENT_ID = `${site.domain}/#zone-${site.address.department}`;

const slugZone = (nom) =>
  nom.normalize('NFD').replace(/[̀-ͯ]/g, '')
     .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** Référence courte vers un nœud déjà décrit dans le même graphe. */
const ref = (node) => ({ '@id': node['@id'] });

const departement = {
  '@type': 'AdministrativeArea',
  '@id': DEPARTEMENT_ID,
  name: site.address.region,
  alternateName: `Département ${site.address.department}`,
  containedInPlace: FRANCE,
};

/** Une commune, rattachée à la Seine-et-Marne. */
export function communeArea(name) {
  return {
    '@type': 'City',
    '@id': `${site.domain}/#zone-${slugZone(name)}`,
    name,
    containedInPlace: ref(departement),
  };
}

// Zone par défaut : le département + les communes de la zone d'intervention.
// Utilisée sur l'accueil, les piliers et les pages transverses.
const zoneParDefaut = () => [departement, ...communes.map((c) => communeArea(c))];

/* ── Entité entreprise ─────────────────────────────────────────────────── */

export function localBusinessGraph({ areaServed } = {}) {
  // Ne baliser en offre que les pages RÉELLEMENT en ligne : référencer une
  // prestation dont la page n'est pas écrite reviendrait à baliser une 404.
  const offres = pagesPubliees.filter((u) => !['transverse', 'ville'].includes(u.silo));

  return [
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: abs('/'),
      name: site.brand,
      inLanguage: 'fr-FR',
      publisher: { '@id': BUSINESS_ID },
    },
    {
      '@type': 'RoofingContractor',
      '@id': BUSINESS_ID,
      name: site.brand,
      alternateName: site.brandFull,
      legalName: site.legalName,
      description: `Artisan couvreur zingueur en ${site.address.region}, j'interviens (${site.address.department}) : couverture et rénovation de toiture, réparation de fuites, entretien et démoussage, zinguerie et gouttières, isolation et étanchéité. Devis et déplacement gratuits.`,
      url: abs('/'),
      ...(site.sameAs?.length ? { sameAs: site.sameAs } : {}),
      image: PHOTOS_ENTREPRISE.map((p) => abs(p)),
      logo: abs('/logo-simonard-couvreur-77.png'),
      telephone: site.phoneIntl,
      email: site.email,
      priceRange: '€€',
      currenciesAccepted: 'EUR',
      founder: { '@type': 'Person', name: site.founder },
      ...(site.foundingDate ? { foundingDate: site.foundingDate } : {}),
      vatID: site.tva.replace(/\s/g, ''),
      identifier: [
        { '@type': 'PropertyValue', name: 'SIRET', value: site.siret.replace(/\s/g, '') },
        { '@type': 'PropertyValue', name: 'SIREN', value: site.siren.replace(/\s/g, '') },
      ],
      address: {
        '@type': 'PostalAddress',
        streetAddress: site.address.street,
        postalCode: site.address.postalCode,
        addressLocality: site.address.city,
        addressRegion: site.address.region,
        addressCountry: site.address.country,
      },
      geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
      // À COMPLÉTER : horaires d'ouverture (openingHoursSpecification). Ils
      // ne sont déclarés nulle part par l'entreprise, et Google les affiche
      // tels quels dans les résultats — en inventer serait pire que de ne
      // rien déclarer. À ajouter une fois les horaires confirmés.
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          telephone: site.phoneIntl,
          email: site.email,
          availableLanguage: 'French',
          areaServed: 'FR',
        },
        {
          '@type': 'ContactPoint',
          contactType: 'emergency',
          name: 'Urgence fuite de toiture',
          telephone: site.phoneIntl,
          availableLanguage: 'French',
          areaServed: 'FR',
        },
      ],
      areaServed: areaServed || zoneParDefaut(),
      knowsAbout: [
        'Couverture', 'Zinguerie', 'Rénovation de toiture', 'Réparation de fuite de toiture',
        'Gouttières et descentes', 'Noues de toiture', 'Étanchéité de cheminée',
        'Démoussage de toiture', 'Traitement hydrofuge', 'Isolation de toiture',
        'Isolation des combles', 'Étanchéité de toit-terrasse', 'Bardage PVC',
        'Tuiles', 'Ardoises', 'Zinc', 'Bac acier', 'Shingle', 'Fenêtres de toit',
      ],
      ...(offres.length
        ? {
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: `Prestations de couverture en ${site.address.region}`,
              itemListElement: offres.map((u) => ({
                '@type': 'Offer',
                itemOffered: { '@type': 'Service', name: u.label, url: abs(u.path) },
              })),
            },
          }
        : {}),
    },
  ];
}

/* ── Fil d'Ariane ──────────────────────────────────────────────────────── */

/**
 * `trail` = niveaux intermédiaires, du plus général au plus précis :
 * [{ name: 'Entretien de toiture', path: '/entretien-de-toiture/' }].
 * Doit refléter exactement le fil d'Ariane affiché (composant Breadcrumb).
 */
export function breadcrumbSchema(path, name, trail = []) {
  const items = [
    { name: 'Accueil', item: abs('/') },
    ...trail.map((t) => ({ name: t.name, item: abs(t.path) })),
  ];
  // Sur l'accueil, un second niveau « Accueil » pointant vers la même URL
  // serait incohérent : le fil s'arrête au premier item.
  if (path !== '/') items.push({ name, item: abs(path) });

  return {
    '@type': 'BreadcrumbList',
    '@id': `${abs(path)}#breadcrumb`,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

/* ── Page ──────────────────────────────────────────────────────────────── */

function webPageSchema(path, { pageName, description, image, faq, serviceId }) {
  const questions = (faq || []).map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      // Les réponses contiennent du HTML (liens internes) : le balisage
      // n'accepte que du texte.
      text: String(item.a).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
    },
  }));

  return {
    '@type': questions.length ? ['WebPage', 'FAQPage'] : 'WebPage',
    '@id': `${abs(path)}#webpage`,
    url: abs(path),
    name: pageName,
    ...(description ? { description } : {}),
    inLanguage: 'fr-FR',
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': serviceId || BUSINESS_ID },
    breadcrumb: { '@id': `${abs(path)}#breadcrumb` },
    ...(image ? { primaryImageOfPage: { '@type': 'ImageObject', url: abs(image) } } : {}),
    ...(questions.length ? { mainEntity: questions } : {}),
  };
}

/* ── Prestation ────────────────────────────────────────────────────────── */

function serviceSchema(path, service, areaServed) {
  return {
    '@type': 'Service',
    '@id': `${abs(path)}#service`,
    name: service.name,
    serviceType: service.type || service.name,
    ...(service.description ? { description: service.description } : {}),
    provider: { '@id': BUSINESS_ID },
    // Zones référencées par @id : elles sont décrites en entier sur l'entité
    // entreprise, plus haut dans le même graphe.
    areaServed: areaServed.map(ref),
    url: abs(path),
  };
}

/* ── Assemblage ────────────────────────────────────────────────────────── */

/**
 * @param {string} path      chemin de la page, ex. '/couvreur-gressy/'
 * @param {string} name      libellé du dernier niveau du fil d'Ariane
 * @param {object} [options]
 *   - pageName   : titre du nœud WebPage (défaut : `name`)
 *   - description: description de la page
 *   - image      : visuel principal de la page (chemin absolu du site)
 *   - trail      : niveaux intermédiaires du fil d'Ariane
 *   - commune    : nom d'UNE commune → areaServed limité à cette commune
 *   - service    : { name, type, description } → nœud Service
 *   - faq        : [{ q, a }] → la page devient aussi une FAQPage
 */
export function pageSchema(path, name, options = {}) {
  const { pageName, description, image, trail = [], commune, service, faq } = options;

  const areaServed = commune ? [communeArea(commune)] : zoneParDefaut();

  const graph = [
    ...localBusinessGraph({ areaServed }),
    webPageSchema(path, {
      pageName: pageName || name,
      description,
      image,
      faq,
      serviceId: service ? `${abs(path)}#service` : null,
    }),
    breadcrumbSchema(path, name, trail),
  ];

  if (service) graph.push(serviceSchema(path, service, areaServed));

  return { '@context': 'https://schema.org', '@graph': graph };
}

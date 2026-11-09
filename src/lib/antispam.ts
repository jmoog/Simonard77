// ────────────────────────────────────────────────────────────────────────
// Anti-spam partagé — scoring de contenu piloté par une liste CENTRALE.
//
// Objectif : ne plus éditer le formulaire site par site. La LOGIQUE reste ici
// (stable), mais les DONNÉES (mots-clés, seuil, préfixes tel, mots anglais)
// viennent d'un JSON hébergé à un seul endroit. Tous les sites le lisent →
// ajouter un mot-clé une fois suffit, sans rebuild des sites.
//
// Config (env, par site) :
//   SPAM_RULES_URL → URL du JSON central
//                    ex. https://raw.githubusercontent.com/jmoog/antispam-rules/main/rules.json
//   SPAM_RULES_TTL → durée du cache en secondes (défaut 3600 = 1 h)
//
// Robustesse : si l'URL est absente ou injoignable, on retombe sur les règles
// intégrées ci-dessous (DEFAULT_RULES) → le site reste protégé au niveau
// actuel même si le central tombe.
// ────────────────────────────────────────────────────────────────────────

export interface DevisData {
  nom: string;
  tel: string;
  email: string;
  ville: string;
  prestation: string;
  message?: string;
}

interface KeywordRule { re: string; flags?: string; pts: number; label: string; }
interface EnglishRule { words: string[]; minHits: number; pts: number; }
export interface SpamRules {
  version?: string;
  threshold: number;
  keywords: KeywordRule[];
  phonePrefixes: string[];
  english: EnglishRule;
  linkPts?: number;
  blocklist?: { emailDomains?: string[]; emails?: string[]; phones?: string[]; pts?: number };
}

export interface SpamVerdict { score: number; threshold: number; reasons: string[]; version: string; }

// ── Règles de secours intégrées (= copie du JSON central au moment du déploiement) ──
const DEFAULT_RULES: SpamRules = {
  version: 'builtin-2026-11-09',
  threshold: 5,
  keywords: [
    { re: '\\bavis\\s+(google|positif|5\\s*etoile)', flags: 'i', pts: 4, label: 'avis google' },
    { re: '\\b(google\\s+maps|trustpilot|tripadvisor|thumbtack|yelp)\\b', flags: 'i', pts: 3, label: 'plateformes avis' },
    { re: '\\b(seo|referencement)\\s+(all\\s+)?service', flags: 'i', pts: 3, label: 'seo service' },
    { re: 'marketing\\s+digital', flags: 'i', pts: 3, label: 'marketing digital' },
    { re: '\\b(premiere|1ere)\\s+page\\s+(de\\s+)?google', flags: 'i', pts: 3, label: '1ere page google' },
    { re: '\\bfreelance\\b', flags: 'i', pts: 2, label: 'freelance' },
    { re: '\\b(rank|ranking|classement)\\b.*\\bgoogle\\b', flags: 'i', pts: 2, label: 'ranking google' },
    { re: '\\b(boost|propuls|promo(tion|uvoir))\\b.*\\b(entreprise|business|vente)', flags: 'i', pts: 2, label: 'boost business' },
    { re: '\\b(backlink|backlinks|guest\\s*post)\\b', flags: 'i', pts: 3, label: 'backlinks' },
    { re: '\\b(whatsapp|telegram|skype)\\b', flags: 'i', pts: 2, label: 'messagerie demarchage' },
    { re: '\\borias\\b', flags: 'i', pts: 5, label: 'orias' },
    { re: '\\bcourtier\\b', flags: 'i', pts: 4, label: 'courtier' },
    { re: '\\b(renegocie|renegocier|ajuster)\\b.*\\bcontrat', flags: 'i', pts: 3, label: 'renegocier contrats' },
    { re: "\\bprime(s)?\\s+d['e\\s]assurance", flags: 'i', pts: 3, label: 'primes assurance' },
    { re: '\\bsans\\s+engagement\\b', flags: 'i', pts: 2, label: 'sans engagement' },
    { re: '\\b(economies|economie)\\b.*\\b(prime|contrat|cotisation)', flags: 'i', pts: 2, label: 'economies primes' },
    // Spam « Nicolas Hocquet » : liens vers un faux dossier (mondocs.my.id, monpartage.online), oct. 2026
    { re: '\\bhocquet\\b', flags: 'i', pts: 6, label: 'spam Hocquet (oct. 2026)' },
    { re: '\\b(mondocs|monpartage|mesdocs|mondossier|mesfichiers)\\b|\\.my\\.id\\b', flags: 'i', pts: 5, label: 'lien faux dossier' },
    { re: 'https?://\\S+/btp/', flags: 'i', pts: 3, label: 'lien /btp/' },
    { re: '\\b(tout\\s+le\\s+dossier|dossier\\s+complet|a\\s+lire\\s+sur|consultez?\\s+le\\s+dossier|voir\\s+le\\s+document)\\b', flags: 'i', pts: 2, label: 'renvoi vers un dossier' },
    { re: '\\bmontreal\\b', flags: 'i', pts: 2, label: 'ville hors zone' },
    // Démarchage « audit de fiche Google » (Brandon Vidal / agenceinsight.fr / wecomm, nov. 2026)
    { re: '\\b(agenceinsight|wecomm)\\b', flags: 'i', pts: 6, label: 'spam agenceinsight (nov. 2026)' },
    { re: '\\bfiche\\s+(google|gmb|d.etablissement|etablissement)\\b|\\bgoogle\\s+(my\\s+)?business\\b|\\bgoogle\\s+business\\s+profile\\b', flags: 'i', pts: 3, label: 'fiche google' },
    { re: '\\baudit\\b.*\\b(fiche|google|visibilite|seo|referencement|site\\s+(web|internet))\\b', flags: 'i', pts: 3, label: 'audit marketing' },
    { re: '\\b(calendly|tidycal|savvycal|zcal)\\b|\\bcal\\.com/|meetings\\.hubspot|youcanbook\\.me|\\bgoogle\\s+meet\\b|\\bzoom\\.us\\b', flags: 'i', pts: 5, label: 'lien prise de rendez-vous' },
    { re: '\\brepondez?\\s+(simplement\\s+)?(par\\s+)?.?stop\\b|(souhaitez|voulez)\\s+(plus|pas)\\s+recevoir|plus\\s+recevoir\\s+(de\\s+)?(message|mail|e-?mail|courriel)|\\bdesinscri|\\bdesabonn|retire(r)?\\s+de\\s+(ma|notre)\\s+liste', flags: 'i', pts: 6, label: 'mention de desinscription' },
    { re: '\\bje\\s+reviens\\s+vers\\s+vous\\b|\\bsuite\\s+a\\s+mon\\s+(precedent\\s+|dernier\\s+)?(e-?mail|mail|message|courriel|appel)\\b|\\bmon\\s+(dernier\\s+)?(e-?mail|mail|message)\\s+du\\b', flags: 'i', pts: 1, label: 'relance prospection' },
    { re: '\\bvisibilite\\b', flags: 'i', pts: 2, label: 'visibilite' },
    { re: '\\b(vos|votre|un|quel)\\s+concurrents?\\b|\\bconcurrents?\\s+(passe|passent|devant)', flags: 'i', pts: 2, label: 'concurrents' },
    { re: '\\bagence\\s+(web|seo|marketing|digitale?|de\\s+communication|de\\s+referencement)\\b', flags: 'i', pts: 3, label: 'agence web' },
    { re: '\\b(leads?|prospects?|clients?\\s+potentiels?|nouveaux\\s+clients|plus\\s+de\\s+clients|appels?\\s+entrants?)\\b', flags: 'i', pts: 2, label: 'generation de clients' },
    { re: '\\b(refonte|creation)\\s+de\\s+(votre\\s+)?site\\b|\\bvotre\\s+site\\s+(web|internet)\\b', flags: 'i', pts: 3, label: 'offre site web' },
    { re: '\\b(marseille|lyon|toulouse|nice|bordeaux|nantes|strasbourg|montpellier|lille|rennes)\\b', flags: 'i', pts: 2, label: 'grande ville hors zone' },
  ],
  linkPts: 3,
  blocklist: { emailDomains: ['prodmail.online', 'agenceinsight.fr', 'wecomm.fr'], phones: ['0660826732', '0780989293'], pts: 10 },
  phonePrefixes: ['+880', '+234', '+92', '+91', '+233', '+212255'],
  english: {
    words: ['your', 'business', 'service', 'please', 'will', 'contact', 'provide', 'expert', 'verified', 'review'],
    minHits: 4,
    pts: 2,
  },
};

// ── Cache mémoire (persiste entre requêtes sur un serveur SSR long-running) ──
interface CacheEntry { rules: SpamRules; compiled: Array<{ re: RegExp; pts: number; label: string }>; fetchedAt: number; }
let cache: CacheEntry | null = null;

function compile(rules: SpamRules) {
  return rules.keywords.map((k) => ({
    re: new RegExp(k.re, k.flags ?? 'i'),
    pts: k.pts,
    label: k.label,
  }));
}

// Fusion règles centrales + règles intégrées : les règles ajoutées dans ce
// fichier s'appliquent toujours, même si la liste centrale ne les a pas
// encore (doublons écartés par regex). Seuil et poids anglais : ceux du central.
function mergeRules(central: SpamRules): SpamRules {
  const seen = new Set(central.keywords.map((k) => k.re));
  const keywords = [...central.keywords, ...DEFAULT_RULES.keywords.filter((k) => !seen.has(k.re))];
  const uniq = (a: string[] = [], b: string[] = []) => Array.from(new Set([...a, ...b]));
  const cb = central.blocklist || {};
  const db = DEFAULT_RULES.blocklist || {};
  return {
    ...central,
    version: `${central.version ?? 'central'}+${DEFAULT_RULES.version}`,
    keywords,
    phonePrefixes: uniq(central.phonePrefixes, DEFAULT_RULES.phonePrefixes),
    blocklist: {
      emailDomains: uniq(cb.emailDomains, db.emailDomains),
      emails: uniq(cb.emails, db.emails),
      phones: uniq(cb.phones, db.phones),
      pts: cb.pts ?? db.pts,
    },
  };
}

function isValidRules(x: any): x is SpamRules {
  return x && typeof x.threshold === 'number' && Array.isArray(x.keywords)
    && Array.isArray(x.phonePrefixes) && x.english && Array.isArray(x.english.words);
}

function rulesUrl(): string | undefined {
  // Astro expose les env via import.meta.env ; Node via process.env. On gère les deux.
  return (import.meta as any).env?.SPAM_RULES_URL || process.env.SPAM_RULES_URL;
}
function rulesTtl(): number {
  return Number((import.meta as any).env?.SPAM_RULES_TTL || process.env.SPAM_RULES_TTL) || 3600;
}

async function getRules(): Promise<CacheEntry> {
  const ttlMs = rulesTtl() * 1000;
  if (cache && Date.now() - cache.fetchedAt < ttlMs) return cache;

  const url = rulesUrl();
  if (url) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 2500);
      const res = await fetch(url, { signal: ctrl.signal, headers: { accept: 'application/json' } });
      clearTimeout(t);
      if (res.ok) {
        const json = await res.json();
        if (isValidRules(json)) {
          const merged = mergeRules(json);
          cache = { rules: merged, compiled: compile(merged), fetchedAt: Date.now() };
          return cache;
        }
        console.warn('[antispam] JSON central invalide, fallback sur règles intégrées');
      } else {
        console.warn(`[antispam] HTTP ${res.status} sur SPAM_RULES_URL, fallback`);
      }
    } catch (e) {
      console.warn('[antispam] central injoignable, fallback:', e instanceof Error ? e.message : e);
    }
  }
  cache = { rules: DEFAULT_RULES, compiled: compile(DEFAULT_RULES), fetchedAt: Date.now() };
  return cache;
}

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// ── Scoring ──
export async function spamScore(d: DevisData): Promise<SpamVerdict> {
  const { rules, compiled } = await getRules();
  const reasons: string[] = [];
  let score = 0;

  const haystackRaw = `${d.message || ''} ${d.nom} ${d.ville}`;
  const haystack = normalize(haystackRaw);

  // 1) Mots-clés démarchage
  for (const { re, pts, label } of compiled) {
    if (re.test(haystack)) { score += pts; reasons.push(`kw:${label}(+${pts})`); }
  }

  // 1b) Liste noire : domaine e-mail jetable ou numéro déjà vu en spam
  const bl = rules.blocklist;
  if (bl) {
    const email = (d.email || '').trim().toLowerCase();
    const dom = email.split('@')[1] || '';
    const telBl = (d.tel || '').replace(/[\s.\-()\/]/g, '').replace(/^(\+33|0033)/, '0');
    const blPts = bl.pts ?? 10;
    if ((bl.emails || []).includes(email) || (bl.emailDomains || []).some((x) => dom === x || dom.endsWith('.' + x))) {
      score += blPts; reasons.push(`blocklist:email(+${blPts})`);
    }
    if ((bl.phones || []).includes(telBl)) { score += blPts; reasons.push(`blocklist:tel(+${blPts})`); }
  }

  // 2) Liens dans le message
  const urlMatches = haystackRaw.match(/https?:\/\/|wa\.me|t\.me|bit\.ly|\b\w+\.(ru|cn|top|xyz)\b/gi);
  if (urlMatches) {
    const pts = Math.min(urlMatches.length * (rules.linkPts ?? 3), 6);
    score += pts; reasons.push(`liens×${urlMatches.length}(+${pts})`);
  }

  // 3) Téléphone à indicatif étranger suspect
  const telClean = (d.tel || '').replace(/[\s.\-()]/g, '');
  for (const prefix of rules.phonePrefixes) {
    if (telClean.startsWith(prefix)) { score += 4; reasons.push(`tel:${prefix}(+4)`); break; }
  }

  // 4) Rafale d'emojis
  const emojiCount = (haystackRaw.match(/[☀-➿]|[\uD83C-\uDBFF][\uDC00-\uDFFF]/g) || []).length;
  if (emojiCount >= 4) {
    const pts = Math.min(Math.floor(emojiCount / 2), 5);
    score += pts; reasons.push(`emojis×${emojiCount}(+${pts})`);
  }

  // 5) Message majoritairement en anglais
  const msg = normalize(d.message || '');
  const enRe = new RegExp(`\\b(${rules.english.words.join('|')})\\b`, 'g');
  const enHits = (msg.match(enRe) || []).length;
  if (enHits >= rules.english.minHits) {
    score += rules.english.pts; reasons.push(`anglais×${enHits}(+${rules.english.pts})`);
  }

  return { score, threshold: rules.threshold, reasons, version: rules.version ?? 'unknown' };
}

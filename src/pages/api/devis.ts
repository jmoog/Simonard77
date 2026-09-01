import type { APIRoute } from 'astro';
import { site } from '../../data/site.js';
import { spamScore, type DevisData } from '../../lib/antispam';

// Route rendue à la demande (pas de prérendu statique).
export const prerender = false;

// ────────────────────────────────────────────────────────────────────────
// Variables d'environnement (voir .env.example / README) :
//   BREVO_API_KEY        → Clé API Brevo (commence par xkeysib-...)
//   ADMIN_EMAILS         → destinataires de la notification, séparés par des virgules
//   FROM_EMAIL           → expéditeur vérifié dans Brevo
//   FROM_NAME            → nom de l'expéditeur (facultatif)
//   TURNSTILE_SECRET_KEY → secret Cloudflare Turnstile (facultatif)
//   SPAM_RULES_URL       → JSON de règles anti-spam centralisées (facultatif,
//                          voir src/lib/antispam.ts — repli intégré si absent)
//   SPAM_RULES_TTL       → cache des règles en secondes (facultatif, défaut 3600)
//
// Pourquoi Brevo et pas du SMTP direct : la plupart des hébergeurs bloquent
// les ports SMTP sortants (25/465/587). L'API HTTPS de Brevo passe par le
// port 443, qui n'est jamais bloqué.
//
// Cette route ne fonctionne pas tant que BREVO_API_KEY et ADMIN_EMAILS ne
// sont pas renseignés — c'est attendu tant que le site tourne en local.
// ────────────────────────────────────────────────────────────────────────

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// Doit rester synchronisé avec le tableau `prestations` de
// src/pages/devis-gratuit.astro : ce sont les mêmes clés.
const PRESTATIONS: Record<string, string> = {
  couverture: 'Couverture / rénovation de toiture',
  reparation: 'Réparation & recherche de fuite',
  urgence: 'Urgence (fuite en cours, tempête)',
  entretien: 'Entretien, démoussage, hydrofuge',
  zinguerie: 'Zinguerie, gouttières, noues',
  isolation: 'Isolation de toiture ou de combles',
  etancheite: 'Étanchéité de toit-terrasse',
  autre: 'Autre / à préciser',
};

// Palette identique au site — valeurs reprises des variables CSS de
// src/styles/global.css. Toute modification de la charte doit être
// répercutée ici : un e-mail ne peut pas lire les custom properties CSS.
const BLEU = '#025E95';
const BLEU_NUIT = '#072F4C';
const BLEU_ENCRE = '#04202F';
const ROUGE = '#C2003C';
const CIEL = '#E9F3FB';
const GRIS_CLAIR = '#F5F8FA';
const TEXTE = '#16232E';
const GRIS = '#5B6B78';
const BORDURE = '#E2EAF0';

// Pile de polices : Poppins/Inter (celles du site) pour les clients mail qui
// les possèdent, sinon repli système. Pas de @font-face : Gmail le supprime.
const POLICES = `'Inter','Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif`;

const URL_SITE = site.domain;
// Logo réel : 922 × 200 px (ratio 4,61). Respecter ce ratio dans les
// attributs width/height, sinon Outlook et Gmail l'écrasent.
const LOGO_L = 922;
const LOGO_H = 200;
const logoBox = (l: number) => ({ l, h: Math.round((l * LOGO_H) / LOGO_L) });
// PNG et non WebP : Outlook n'affiche pas le WebP.
const LOGO_URL = `${URL_SITE}/logo-simonard-couvreur-77.png`;
const TEL = site.phone;
const TEL_HREF = `tel:${site.phoneHref}`;
const ENTREPRISE = site.brand;
const ADRESSE = `${site.address.street}, ${site.address.postalCode} ${site.address.city}`;

// ────────────────────────────────────────────────────────────────────────
// Utilitaires
// ────────────────────────────────────────────────────────────────────────

function echapper(s: unknown): string {
  if (s === undefined || s === null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sautsDeLigne(s: unknown): string {
  return echapper(s).replace(/\r?\n/g, '<br>');
}

// ────────────────────────────────────────────────────────────────────────
// Client Brevo (fetch direct sur l'API HTTPS, pas de SDK)
// ────────────────────────────────────────────────────────────────────────

interface BrevoArgs {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  to: Array<{ email: string; name?: string }>;
  replyTo?: { email: string; name?: string };
  subject: string;
  htmlContent: string;
}

async function brevoEnvoyer(args: BrevoArgs): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  const body: Record<string, unknown> = {
    sender: { email: args.fromEmail, name: args.fromName },
    to: args.to,
    subject: args.subject,
    htmlContent: args.htmlContent,
  };
  if (args.replyTo) body.replyTo = args.replyTo;

  try {
    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: { 'api-key': args.apiKey, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const err = await res.json();
        if (err?.message) detail = String(err.message);
        else if (err?.code) detail = String(err.code);
      } catch {}
      return { ok: false, error: detail };
    }

    const json = await res.json().catch(() => ({}) as any);
    return { ok: true, messageId: json?.messageId };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur inconnue' };
  }
}

// ────────────────────────────────────────────────────────────────────────
// Gabarit — Notification (artisan)
//
// L'en-tête est BLANC et non sombre : le logo Simonard est bleu et rose sur
// fond transparent ; posé sur un bandeau bleu nuit, le « S » disparaîtrait.
// Le bandeau de couleur est reporté en pied de message.
// ────────────────────────────────────────────────────────────────────────

function notificationTemplate(d: DevisData) {
  const presta = PRESTATIONS[d.prestation] || d.prestation || 'Non précisé';
  const telNet = (d.tel || '').replace(/[^0-9+]/g, '');
  const subject = `Nouvelle demande ${site.address.department} — ${presta} à ${d.ville}`;
  const prenom = (d.nom || '').split(' ')[0] || 'le client';
  const logo = logoBox(190);
  const urgence = d.prestation === 'urgence';

  const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${echapper(subject)}</title></head>
<body style="margin:0;padding:0;background:${GRIS_CLAIR};font-family:${POLICES};color:${TEXTE};">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${GRIS_CLAIR};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(7,47,76,.08);">
        <tr><td style="padding:26px 32px 20px;border-bottom:1px solid ${BORDURE};">
          <img src="${LOGO_URL}" width="${logo.l}" height="${logo.h}" alt="${ENTREPRISE}" style="display:block;width:${logo.l}px;height:${logo.h}px;border:0;outline:none;text-decoration:none;">
        </td></tr>
        ${urgence ? `<tr><td style="background:${ROUGE};padding:12px 32px;color:#fff;font-size:14px;font-weight:700;text-align:center;">⚠ Demande signalée comme URGENTE</td></tr>` : ''}
        <tr><td style="padding:26px 32px 8px;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:${GRIS};font-weight:700;">Nouvelle demande de devis</div>
          <div style="font-size:22px;font-weight:800;color:${BLEU_NUIT};margin-top:8px;line-height:1.25;">${echapper(presta)}</div>
          <div style="font-size:15px;color:${GRIS};margin-top:4px;">à ${echapper(d.ville)}</div>
        </td></tr>
        <tr><td style="padding:18px 32px 8px;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:${GRIS};font-weight:700;margin-bottom:6px;">Client</div>
          <div style="font-size:18px;font-weight:700;color:${BLEU_NUIT};">${echapper(d.nom)}</div>
        </td></tr>
        <tr><td style="padding:8px 32px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td width="50%" valign="top" style="padding:12px 12px 12px 0;">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:${GRIS};font-weight:700;">Téléphone</div>
                <a href="tel:${echapper(telNet)}" style="display:inline-block;margin-top:4px;color:${BLEU};font-size:17px;font-weight:700;text-decoration:none;">${echapper(d.tel)}</a>
              </td>
              <td width="50%" valign="top" style="padding:12px 0 12px 12px;border-left:1px solid ${BORDURE};">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:${GRIS};font-weight:700;">Email</div>
                <a href="mailto:${echapper(d.email)}" style="display:inline-block;margin-top:4px;color:${BLEU};font-size:14px;font-weight:600;text-decoration:none;word-break:break-all;">${echapper(d.email)}</a>
              </td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:8px 32px 22px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td align="center" style="padding:8px 8px 8px 0;" width="50%">
                <a href="tel:${echapper(telNet)}" style="display:block;background:${ROUGE};color:#fff;text-decoration:none;padding:14px 16px;border-radius:999px;font-weight:700;font-size:14px;">Appeler ${echapper(prenom)}</a>
              </td>
              <td align="center" style="padding:8px 0 8px 8px;" width="50%">
                <a href="mailto:${echapper(d.email)}?subject=${encodeURIComponent(`Re: votre demande de devis — ${ENTREPRISE}`)}" style="display:block;background:${BLEU};color:#fff;text-decoration:none;padding:14px 16px;border-radius:999px;font-weight:700;font-size:14px;">Répondre par email</a>
              </td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 32px 26px;">
          <div style="background:${CIEL};border-radius:12px;padding:18px 20px;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:${GRIS};font-weight:700;margin-bottom:10px;">Description de la demande</div>
            <div style="font-size:14px;line-height:1.65;color:${TEXTE};">
              ${d.message ? sautsDeLigne(d.message) : `<em style="color:${GRIS};">Aucune description fournie.</em>`}
            </div>
          </div>
        </td></tr>
        <tr><td style="background:${BLEU_ENCRE};padding:16px 32px;font-size:12px;color:#9FB6C6;text-align:center;">
          Demande reçue le ${new Date().toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Paris' })}<br>
          via <a href="${URL_SITE}/devis-gratuit/" style="color:#fff;text-decoration:none;">${URL_SITE.replace('https://', '')}/devis-gratuit/</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { subject, html };
}

// ────────────────────────────────────────────────────────────────────────
// Gabarit — Accusé de réception client
// ────────────────────────────────────────────────────────────────────────

function accuseTemplate(d: DevisData) {
  const presta = PRESTATIONS[d.prestation] || d.prestation || 'votre demande';
  const subject = `Nous avons bien reçu votre demande — ${ENTREPRISE}`;
  const prenom = (d.nom || '').split(' ')[0];
  const logo = logoBox(230);

  const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${echapper(subject)}</title></head>
<body style="margin:0;padding:0;background:${GRIS_CLAIR};font-family:${POLICES};color:${TEXTE};">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${GRIS_CLAIR};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(7,47,76,.08);">
        <tr><td align="center" style="padding:34px 32px 24px;border-bottom:1px solid ${BORDURE};">
          <img src="${LOGO_URL}" width="${logo.l}" height="${logo.h}" alt="${ENTREPRISE}" style="display:block;margin:0 auto;width:${logo.l}px;height:${logo.h}px;border:0;outline:none;text-decoration:none;">
          <div style="font-size:13px;color:${GRIS};margin-top:12px;">Artisan couvreur zingueur en ${echapper(site.address.region)} (${echapper(site.address.department)})</div>
        </td></tr>
        <tr><td style="padding:32px 32px 12px;">
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:${BLEU_NUIT};line-height:1.3;">Bonjour ${echapper(prenom)},</h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${TEXTE};">
            J'ai bien reçu votre demande de devis pour <strong>${echapper(presta.toLowerCase())}</strong> à <strong>${echapper(d.ville)}</strong>. Merci de votre confiance.
          </p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${TEXTE};">
            Je vous recontacte rapidement pour convenir d'une visite, monter voir la toiture et évaluer précisément ce qui doit être repris. Vous recevrez ensuite un devis détaillé, poste par poste et sans engagement.
          </p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:${TEXTE};">
            Si votre situation est urgente — une fuite en cours, des tuiles arrachées —, n'attendez pas mon rappel : appelez-moi directement.
          </p>
        </td></tr>
        <tr><td style="padding:0 32px 26px;" align="center">
          <a href="${TEL_HREF}" style="display:inline-block;background:${ROUGE};color:#fff;text-decoration:none;padding:15px 30px;border-radius:999px;font-weight:700;font-size:15px;">Appeler le ${TEL}</a>
        </td></tr>
        <tr><td style="padding:0 32px 28px;">
          <div style="background:${CIEL};border-radius:12px;padding:18px 20px;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:${GRIS};font-weight:700;margin-bottom:12px;">Récapitulatif de votre demande</div>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="font-size:14px;">
              <tr><td style="padding:4px 0;color:${GRIS};width:120px;">Prestation</td>
                  <td style="padding:4px 0;color:${TEXTE};font-weight:600;">${echapper(presta)}</td></tr>
              <tr><td style="padding:4px 0;color:${GRIS};">Commune</td>
                  <td style="padding:4px 0;color:${TEXTE};font-weight:600;">${echapper(d.ville)}</td></tr>
              <tr><td style="padding:4px 0;color:${GRIS};">Téléphone</td>
                  <td style="padding:4px 0;color:${TEXTE};font-weight:600;">${echapper(d.tel)}</td></tr>
            </table>
          </div>
        </td></tr>
        <tr><td style="padding:0 32px 30px;">
          <p style="margin:0;font-size:15px;line-height:1.6;color:${TEXTE};">
            À très vite,<br>
            <strong style="color:${BLEU_NUIT};">${echapper(site.founder)}</strong><br>
            <span style="color:${GRIS};font-size:13px;">${echapper(ENTREPRISE)} — Artisan couvreur zingueur</span>
          </p>
        </td></tr>
        <tr><td style="background:${BLEU_ENCRE};padding:22px 32px;color:#9FB6C6;text-align:center;font-size:12px;line-height:1.7;">
          <strong style="font-size:14px;color:#fff;">${echapper(ENTREPRISE)}</strong><br>
          ${echapper(ADRESSE)}<br>
          <a href="${URL_SITE}" style="color:#fff;text-decoration:underline;">${URL_SITE.replace('https://', '')}</a> &nbsp;·&nbsp; <a href="${TEL_HREF}" style="color:#fff;text-decoration:underline;">${TEL}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { subject, html };
}

// ────────────────────────────────────────────────────────────────────────
// POST /api/devis
//
// Quatre filtres anti-spam se cumulent :
//   1. honeypot     — champ caché qu'un robot remplit et pas un humain ;
//   2. time-trap    — un formulaire envoyé en moins de 3 s n'a pas été lu ;
//   3. Turnstile    — vérification Cloudflare, si le secret est configuré ;
//   4. scoring      — le vrai filtre contre le démarchage SEO, qui remplit
//                     correctement tous les champs (voir lib/antispam.ts).
// Les filtres 1, 2 et 4 rejettent EN SILENCE (réponse 200 ok:true) : le
// spammeur croit son envoi passé et n'adapte pas sa méthode.
// ────────────────────────────────────────────────────────────────────────

const json = (status: number, payload: unknown) =>
  new Response(JSON.stringify(payload), { status, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('[devis] BREVO_API_KEY manquante');
    return json(500, { ok: false, error: 'Configuration serveur incomplète (BREVO_API_KEY manquante — voir .env.example).' });
  }

  let brut: any;
  try {
    brut = await request.json();
  } catch {
    return json(400, { ok: false, error: 'Invalid JSON' });
  }

  // 1) Honeypot
  if (brut?.website && String(brut.website).trim() !== '') {
    console.warn('[devis] spam bloqué (honeypot)');
    return json(200, { ok: true });
  }

  // 2) Time-trap. Absent ⇒ ignoré (rétrocompatible).
  if (brut?.ts) {
    const ecoule = Date.now() - Number(brut.ts);
    if (Number.isFinite(ecoule) && ecoule >= 0 && ecoule < 3000) {
      console.warn(`[devis] spam bloqué (time-trap, ${ecoule}ms)`);
      return json(200, { ok: true });
    }
  }

  // 3) Cloudflare Turnstile — actif uniquement si le secret est configuré.
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    const token = brut?.['cf-turnstile-response'];
    if (!token) {
      return json(400, { ok: false, error: 'Validation anti-robot manquante. Merci de réessayer.' });
    }
    try {
      const verif = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret: turnstileSecret, response: String(token) }),
      });
      const resultat: any = await verif.json().catch(() => ({}));
      if (!resultat?.success) {
        return json(403, { ok: false, error: 'Échec de la validation anti-robot. Merci de réessayer.' });
      }
    } catch {
      return json(502, { ok: false, error: 'Validation anti-robot indisponible, merci de réessayer.' });
    }
  }

  const obligatoires = ['nom', 'tel', 'email', 'ville'] as const;
  for (const champ of obligatoires) {
    if (!brut?.[champ] || String(brut[champ]).trim() === '') {
      return json(400, { ok: false, error: `Champ manquant : ${champ}` });
    }
  }

  const data: DevisData = {
    nom: String(brut.nom).trim().slice(0, 100),
    tel: String(brut.tel).trim().slice(0, 30),
    email: String(brut.email).trim().slice(0, 200),
    ville: String(brut.ville).trim().slice(0, 100),
    prestation: String(brut.prestation || '').trim().slice(0, 80),
    message: String(brut.message || '').trim().slice(0, 4000),
  };

  // 4) Scoring de contenu
  const verdict = await spamScore(data);
  if (verdict.score >= verdict.threshold) {
    console.warn(
      `[devis] spam bloqué (score ${verdict.score}/${verdict.threshold}, règles ${verdict.version}) — ${verdict.reasons.join(', ')}`
    );
    return json(200, { ok: true });
  }

  const destinataires = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (destinataires.length === 0) {
    console.error('[devis] ADMIN_EMAILS manquant');
    return json(500, { ok: false, error: 'Configuration serveur incomplète (ADMIN_EMAILS manquant — voir .env.example).' });
  }

  const fromEmail = process.env.FROM_EMAIL || site.email;
  const fromName = process.env.FROM_NAME || ENTREPRISE;

  // a) Notification à l'artisan — bloquante : si elle échoue, la demande est
  //    perdue, donc on le dit au visiteur plutôt que d'afficher un faux succès.
  const notif = notificationTemplate(data);
  const r1 = await brevoEnvoyer({
    apiKey,
    fromEmail,
    fromName,
    to: destinataires.map((email) => ({ email })),
    replyTo: { email: data.email, name: data.nom },
    subject: notif.subject,
    htmlContent: notif.html,
  });

  if (!r1.ok) {
    console.error('[devis] Erreur envoi notification (Brevo) :', r1.error);
    return json(502, { ok: false, error: `Envoi impossible pour le moment, merci de m'appeler au ${TEL}.` });
  }

  // b) Accusé de réception au client — au mieux : son échec ne doit pas
  //    faire croire au visiteur que sa demande n'est pas partie.
  const accuse = accuseTemplate(data);
  const r2 = await brevoEnvoyer({
    apiKey,
    fromEmail,
    fromName: ENTREPRISE,
    to: [{ email: data.email, name: data.nom }],
    replyTo: { email: fromEmail, name: fromName },
    subject: accuse.subject,
    htmlContent: accuse.html,
  });
  if (!r2.ok) console.error('[devis] Échec accusé client (non bloquant) :', r2.error);

  return json(200, { ok: true });
};

export const GET: APIRoute = () =>
  new Response('Method Not Allowed', { status: 405, headers: { allow: 'POST' } });

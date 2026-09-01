# simonard-77.fr — site Astro

Refonte du site WordPress **simonard-77.fr** (M. Simonard, artisan couvreur
zingueur en Seine-et-Marne) sous Astro, sur le même socle technique que
`richard-toitures-astro`, avec une identité graphique propre.

---

## La règle du projet : les URLs ne bougent pas

Les **47 URLs du site WordPress sont conservées à l'identique**, barre oblique
finale comprise. C'est la condition pour basculer sans redirection et sans
perdre les positions acquises.

Elles sont toutes recensées dans **`src/data/urls.js`**, qui est la source de
vérité unique de l'avancement :

| `status` | Effet |
|---|---|
| `'ok'`   | La page existe : elle est liée dans le menu / le footer / le plan du site, et publiée dans `sitemap.xml`. |
| `'todo'` | La page reste à écrire : elle n'est **ni liée ni publiée**, donc elle ne peut pas générer de 404. |

**Publier une page = créer son fichier dans `src/pages/` puis passer son
`status` à `'ok'`.** Rien d'autre : le sitemap, le plan du site, le menu, le
footer et le balisage schema.org se mettent à jour tout seuls.

État actuel : **4 pages sur 48** (les 47 URLs WordPress + `/devis-gratuit/`,
qui est nouvelle et ne remplace pas `/contact/`).

- `/` — accueil
- `/devis-gratuit/` — formulaire + zone d'intervention *(nouvelle page)*
- `/mentions-legales/`
- `/plan-du-site/` — sert aussi de tableau de bord de la migration

Plus deux pages hors index : `/merci/` et la 404.

---

## Démarrer

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # génère dist/
npm start          # sert le build (node ./dist/server/entry.mjs)
```

Copiez `.env.example` en `.env` pour tester le formulaire en local.

---

## Où se trouve quoi

```
src/
  data/
    site.js      Coordonnées, mentions légales, menu, communes. Point d'entrée
                 pour toute modification d'information sur l'entreprise.
    urls.js      Les 47 URLs WordPress + leur état d'avancement.
    schema.js    Balisage schema.org (JSON-LD) : une entité entreprise unique,
                 référencée par @id partout ailleurs.
  layouts/Layout.astro    En-tête, pied de page, bandeau cookies, métadonnées.
  components/             Ariane, Faq, CartePrestation, AppelMascotte,
                          Icones, IconeWhatsApp, Fleche.
  styles/global.css       Toute la charte. Aucun CSS ailleurs (sauf exceptions
                          commentées dans les pages).
  pages/api/devis.ts      Envoi des e-mails (Brevo) + filtres anti-spam.
  lib/antispam.ts         Scoring de contenu, règles chargées depuis le dépôt
                          central `antispam-rules`.
public/
  photos/     Uniquement les photos utilisées par les pages construites.
              La banque complète reste dans ../webp-astro/ (12 dossiers
              thématiques, ~190 photos triées).
  icones/     Icônes rondes recolorées au bleu du site (#025E95).
  fonts/      Poppins + Inter auto-hébergées (RGPD : zéro requête Google).
```

---

## Charte

Le bleu est relevé **au pixel** sur le logo. Le rouge en reprend la teinte
(341°) en nettement plus sombre : le #F8004F du logo, posé en aplat sur un
bouton, vire au fluo.

| Rôle | Valeur |
|---|---|
| Bleu (structure) | `#025E95` |
| Rouge (action) | `#C2003C` |
| Bleu nuit (bandeaux) | `#072F4C` |
| Bleu encre (footer) | `#04202F` |

Le **rouge est réservé à l'action** : boutons de conversion, tirets de titre,
flèches. S'il se met à habiller des blocs entiers, il cesse d'attirer l'œil là
où il compte. Seule exception assumée : l'aplat derrière le portrait de
l'artisan.

Titres en **Poppins** (géométrique, comme le logotype), texte courant en
**Inter**.

La **géométrie est celle de Richard Toitures** : boutons à coins arrondis de
12 px, cartes et badges à 10 px, bordures grises uniformes (`--bordure`), et
le petit chevron d'angle rouge devant les H2 des blocs texte. Pas de pilules,
pas de bordures colorées, pas de surtitres — ce qui change d'un site à
l'autre, ce sont les couleurs, les photos et le contenu, pas le système.

Seule couleur qui échappe à la charte : le **vert WhatsApp #25D366**, laissé
tel quel. C'est lui qui rend le bouton identifiable au premier coup d'œil ; le
teindre aux couleurs du site ferait perdre ce réflexe.

Le **pied de page s'ouvre sur un appel à l'action** (devis, téléphone,
WhatsApp) avant les colonnes prestations / zones / informations : c'est le
dernier endroit où rattraper un visiteur arrivé au bout de la page.

L'encart **AppelMascotte** est repris tel quel du site WordPress : c'est le
bloc que les visiteurs de l'ancien site reconnaissent, et il porte l'action
« téléphone », distincte de l'action « devis » portée par les boutons rouges.
Il est réutilisable sur les pages de prestation à venir (`titre`, `note`,
`mascotte` et `inverse` sont paramétrables). Les trois mascottes sont trois
**dessins différents**, pas des miroirs : `droite` et `face` ont le pouce à
gauche du cadre, `gauche` l'a à droite — cette dernière est donc à réserver au
montage `inverse`, où la mascotte passe à droite et reste tournée vers le
texte. On alterne d'une page à l'autre pour que le bloc ne donne pas
l'impression d'être recopié.

Deux animations, pas plus : un fondu montant à l'apparition des blocs
(IntersectionObserver) et un dézoom lent de la photo du hero. **L'état masqué
n'est posé que sous la classe `js-anim`**, que le script n'ajoute que s'il a
pu démarrer — sans JavaScript, sans IntersectionObserver, ou si le script
échoue, la page s'affiche normalement. Une animation ne doit jamais pouvoir
cacher le contenu.

L'en-tête passe au menu burger **sous 1200 px** et non 1040 : en dessous, les
cinq rubriques, le bloc téléphone, WhatsApp et le bouton devis ne tiennent
plus sur une ligne. Toute rubrique ajoutée au menu impose de revérifier ce
seuil.

---

## Pages ville (gabarit posé, texte à écrire)

Les onze pages ville existent et se construisent, **mais leur texte est du
lorem ipsum**. Elles sont donc toutes en `status: 'todo'` dans
`data/urls.js`, ce qui suffit à les tenir à l'écart : `noindex`, absentes du
sitemap, du plan du site, du menu et du footer, et aucun lien du site ne
pointe vers elles. Pour publier une ville : écrire son texte, renseigner ses
données locales, puis passer sa ligne à `'ok'` — rien d'autre.

**Un seul gabarit, deux routes.** `components/PageVille.astro` contient toute
la page. Deux fichiers de route l'appellent :

| Route | URLs produites |
| --- | --- |
| `pages/couvreur-[ville].astro` | les dix `/couvreur-annet-sur-marne/`, `/couvreur-charny/`… |
| `pages/claye-souilly.astro` | `/claye-souilly/` — l'exception WordPress, sans préfixe |

**Anti-duplication.** Onze pages bâties sur le même gabarit ne doivent pas
ouvrir sur onze fois la même phrase : `data/villes.js` fournit quatre
variantes de titre et quatre d'accroche, choisies par le rang de la commune
(`rang % 4`). Les trois mascottes tournent de la même façon (`rang % 3`).
Le H1 porte la variante ; le fil d'Ariane garde la forme courte et constante
« Couvreur à {ville} », identique à l'affiché et au balisé.

**Rien n'est inventé sur les communes.** Mairie et quartiers viennent de
`infosVille` dans `data/villes.js`, vide pour l'instant. Tant qu'une commune
n'y figure pas, la page affiche un encart « à compléter » au lieu d'une
adresse ou d'une liste de quartiers qui n'auraient été vérifiées par personne.

**Particularité mobile du hero.** Sous 980 px, la photo remonte juste sous le
titre, avant l'accroche et les arguments. Les deux colonnes sont aplaties en
CSS (`display:contents`) et chaque élément replacé par `order` : le balisage
n'est écrit qu'une seule fois, et l'ordre de lecture pour les lecteurs
d'écran reste celui du DOM.

**Animations.** La photo se dévoile de la gauche vers la droite en dézoomant
et en passant du flou au net (`villeReveal`), puis le titre, l'accroche, les
arguments, les boutons et l'encart montent par paliers (`entree`). Le reste
de la page apparaît au scroll via le mécanisme `js-anim` / `apparait` déjà en
place. Tout cela est en CSS pur et se termine toujours sur l'état visible :
mesuré en nominal, sans JavaScript et en « réduire les animations ».

## Pages de prestation (gabarit posé, texte à écrire)

`src/pages/renovation-refection-de-toiture.astro` est le **gabarit de
référence** des pages de prestation. Les quatre autres piliers — entretien,
zinguerie, isolation, étanchéité — se dupliquent depuis ce fichier : mêmes
sections, mêmes alternances de fond, seul le contenu change. Comme les pages
ville, elle est en lorem ipsum, `'todo'`, donc en noindex, hors sitemap et
sans aucun lien entrant.

Structure reprise des pages de service de lafleurcouvreur77 :

| | |
| --- | --- |
| Fil d'Ariane | forme courte et constante, identique à l'affiché et au balisé |
| Hero deux colonnes | `.hero-page`, le même que les pages ville |
| Réassurance | `.reassurance--plate` |
| 1. Le diagnostic | fond blanc, `.duo`, H2 + deux H3 |
| 2. Les étapes | fond sombre, `.duo--inverse`, liste détaillée + bouton |
| Encart mascotte | |
| 3. Les matériaux | fond blanc, `.duo`, liste détaillée |
| 4. L'isolation | fond gris, `.duo--inverse` |
| FAQ | `.faq`, questions toujours dépliées |
| Bandeau d'appel | |

Trois écarts volontaires par rapport au modèle Lafleur, imposés par la charte :
pas de surtitre au-dessus des H2 (Lafleur en met un par section), pas de
bordure colorée sur les cartes de FAQ (Lafleur pose un filet rouge à gauche),
et pas de bloc d'avis Google — la fiche n'est pas renseignée, et on n'affiche
pas une note qu'on n'a pas.

Le maillage interne du silo (tuile, ardoise, zinc, bac acier, shingle) s'ajoute
au fur et à mesure que ces pages passent à `'ok'` : aucun lien n'est écrit vers
une page qui n'existe pas.

## Deux règles arrivées en cours de route

**Pas de surtitre, y compris déguisé.** Sous 820 px, la barre haute perdait
ses liens et se réduisait à « Devis et déplacement gratuits » centré — c'est
un surtitre, et le site n'en veut nulle part. Elle est masquée à cette taille.
Le téléphone, WhatsApp et le devis restent joignables par la barre basse fixe,
qui est de toute façon le bon endroit sur mobile.

**Le dessin `droite` de la mascotte est hors service.** Contrairement à
`gauche` et `face`, ce n'est pas un détourage mais un gros plan : casquette
coupée en haut, buste coupé en bas, halo blanc autour du personnage. Sur la
carte gris clair, il se lit comme une image tronquée. On n'alterne donc
qu'entre `gauche` (pouce à droite → mascotte à gauche) et `face` (pouce à
gauche → mascotte à droite, montage `inverse`). À redécouper au même cadrage
si l'on veut le remettre en service.

## À compléter avant la mise en ligne

Le texte des mentions légales est celui validé par le client, repris mot pour
mot du site WordPress. Deux écarts délibérés :

- **l'hébergeur** est déclaré **Hetzner** (le VPS qui héberge réellement le
  site) et non Hostinger, qui figurait encore dans l'ancienne version ;
- les renvois « consultez notre politique de confidentialité / de cookies »
  ont été **retirés** : ces deux pages n'existent pas. Le WordPress répond 200
  sur n'importe quelle URL inconnue en servant l'accueil, ce qui masquait des
  liens morts. Les sections 4 et 5 portent déjà l'information ; si les deux
  politiques sont rédigées un jour, il suffira de rétablir les liens.

Restent à renseigner :

1. **Fiche Google Business** (`site.googleReviewUrl`, `site.sameAs`) — le bloc
   « Laissez-nous un avis » du footer n'apparaît que lorsque l'URL est
   renseignée.
2. **Identifiant Google Analytics** — variable `GA_ID` dans `Layout.astro`,
   vide pour l'instant : aucun script tiers n'est chargé tant qu'elle l'est,
   donc aucun cookie n'est déposé.
3. **Clés Brevo et Turnstile** — variables d'environnement, voir `.env.example`.
4. **Année de création** (`site.foundingDate`, facultatif) — alimente
   `foundingDate` en schema.org.
5. **Texte et données des onze pages ville** — voir la section ci-dessus :
   aujourd'hui en lorem ipsum, et `infosVille` (mairie, quartiers) est vide.
6. **Texte des pages de prestation** — le gabarit est posé sur le pilier
   couverture, en lorem ipsum ; les quatre autres piliers restent à créer par
   duplication.

## Déploiement

Identique à `richard-toitures-astro` : image Docker multi-stage (`Dockerfile`),
adaptateur Node en mode standalone, déploiement via Coolify derrière
Cloudflare.

`PUBLIC_TURNSTILE_SITE_KEY` est une variable de **build** (elle est écrite dans
le HTML) : la modifier impose un rebuild complet. Les autres variables sont
lues à l'exécution.

`src/middleware.ts` neutralise un bug du proxy Traefik de Coolify qui corrompt
les réponses de statut ≥ 400 (la page 404 devenait illisible). À supprimer le
jour où Traefik est mis à jour — c'est un contournement, pas une correction.

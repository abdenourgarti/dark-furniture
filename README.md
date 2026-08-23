# Dark Furniture

Site vitrine bilingue (français / arabe) pour un atelier de fabrication de meubles
sur mesure en Algérie. Bobine vidéo de l'atelier en tête de page, galerie de
réalisations filtrable par pièce, formulaire de devis relié à Resend.

موقع تعريفي ثنائي اللغة لورشة تصنيع الأثاث حسب المقاس في الجزائر.

---

## Démarrer

```bash
npm install
cp .env.example .env.local   # puis renseignez RESEND_API_KEY
npm run dev
```

Ouvrez http://localhost:3000 (redirection automatique vers `/fr` ou `/ar` selon la
langue du navigateur).

> Un autre service occupe déjà `127.0.0.1:3000` sur la machine de développement.
> Si la page ne répond pas, utilisez un autre port : `npm run dev -- -p 3100`.

| Commande | Effet |
|---|---|
| `npm run dev` | serveur de développement |
| `npm run build` | build de production |
| `npm start` | sert le build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | vérification des types |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Motion ·
next-themes · react-hook-form + Zod · Resend · Phosphor Icons.

Aucune dépendance 3D : le site ne charge pas de WebGL.

---

## À personnaliser avant la mise en ligne

### 1. Coordonnées de l'atelier

Tout est dans **`src/data/site.ts`** : téléphone, adresse, horaires, réseaux sociaux
et surtout les coordonnées GPS du showroom.

```ts
geo: { lat: 36.7538, lng: 3.0588 },  // actuellement le centre d'Alger
```

Pour trouver le point exact : ouvrez Google Maps, clic droit sur le showroom, le
premier élément du menu affiche `latitude, longitude`. La carte intégrée et le lien
« Itinéraire » se mettent à jour automatiquement, sans clé API.

### 2. Photos et vidéos

| Dossier | Contenu | État |
|---|---|---|
| `public/videos/` | `video 1.mp4` à `video 6.mp4` | fournis |
| `public/images/logo.png` | le monogramme doré, fond transparent | fourni |
| `public/images/realisations/<pièce>/` | un sous-dossier par catégorie | partiellement fourni |
| `public/images/savoir-faire/` | `01.jpg` à `03.jpg` | **à fournir** |

**Réalisations.** Le contenu de la galerie *est* le contenu des dossiers. Déposez un
JPEG dans `public/images/realisations/cuisine/`, il apparaît dans la galerie et sous
le filtre « Cuisines » ; il n'y a aucune liste de fichiers à tenir à jour ailleurs.
Les quatre dossiers reconnus sont `bureau`, `chambre`, `cuisine` et `meubletv`, et
leur ordre d'affichage est fixé dans `src/data/realisations.ts`.

**Savoir-faire.** Les trois photos (relevé, découpe, assemblage) sont celles qui
prouvent que la fabrication est réelle. Tant qu'un fichier manque, la vignette
affiche une plaque « Photo à venir » plutôt qu'une image cassée. Leurs libellés se
modifient dans les dictionnaires, clé `craft.items`.

### 3. Logo

`src/components/ui/logo.tsx` affiche **`public/images/logo.png`**, le monogramme
doré fourni par l'atelier, importé plutôt que référencé par URL : Next lit ainsi ses
dimensions au build et réserve la bonne place, donc le logo ne décale jamais la mise
en page en apparaissant. Le PNG étant à fond transparent, le même fichier sert en
thème clair et en thème sombre.

Le mot « DARK FURNITURE » reste composé en typographie plutôt qu'incrusté dans une
image : il hérite de la couleur du texte courant et reste net à tous les zooms.

**Icône de l'onglet.** `public/favicon.ico`, `icon-192.png`, `icon-512.png` et
`apple-icon.png` sont tous dérivés de ce même `logo.png` : le monogramme est
d'abord recadré sur son encre — sans cette rognure, la marge vide du fichier
d'origine le réduirait à un point au milieu de l'onglet — puis rendu à chaque
taille. Le `.ico` contient trois résolutions (16, 32 et 48 px) et garde son fond
transparent, pour se poser aussi bien sur une barre d'onglets claire que sombre.
L'icône iOS, elle, est sur fond noir : iOS peint la transparence en noir de toute
façon, autant que ce soit le noir de la charte. La déclaration est dans
`generateMetadata`, dans `src/app/[locale]/layout.tsx`.

Si le logo change, ces quatre fichiers sont à régénérer depuis le nouveau PNG.

### 4. Envoi des e-mails (Resend)

Les demandes partent vers l'adresse définie par `CONTACT_TO`, par défaut
`dark.furnitures@gmail.com`.

**Action requise avant la mise en ligne.** La chaîne a été testée de bout en bout et
fonctionne, mais Resend impose aujourd'hui une limite qui bloque la livraison vers
`dark.furnitures@gmail.com` :

> You can only send testing emails to your own email address
> (garti.abdenour@gmail.com). To send emails to other recipients, please verify a
> domain at resend.com/domains, and change the `from` address to an email using
> this domain.

Autrement dit, tant que l'expéditeur est `onboarding@resend.dev`, Resend ne délivre
qu'à l'adresse propriétaire du compte. Deux issues :

- **Solution définitive, recommandée.** Ajoutez votre domaine sur
  https://resend.com/domains, publiez les enregistrements DKIM et SPF affichés, puis
  passez à `CONTACT_FROM="Dark Furniture <contact@votredomaine.dz>"`.
- **Dépannage immédiat.** Mettez `CONTACT_TO=garti.abdenour@gmail.com` et faites
  suivre vers la boîte de l'atelier.

Le champ « E-mail » du formulaire est facultatif ; quand il est rempli, il est
utilisé comme `Reply-To`. La clé placée dans `.env.local` est restreinte à l'envoi,
ce qui est le bon réglage. `.env*` est ignoré par git, sauf `.env.example`.

### 5. Contenu et traductions

Tout le texte visible vit dans deux fichiers, sans exception :

- `src/i18n/dictionaries/fr.ts`
- `src/i18n/dictionaries/ar.ts`

Les deux partagent la même structure : `ar.ts` est typé d'après `fr.ts`, donc si
vous ajoutez une clé en français, TypeScript signalera l'absence de la traduction
arabe au build. Aucune clé ne peut être oubliée en silence.

Les délais et conditions de déplacement énoncés dans la FAQ sont volontairement
formulés sans chiffre : relisez-les avant publication. La page
`/[locale]/mentions-legales` contient un squelette légal à compléter (registre de
commerce, identifiant fiscal, directeur de publication, hébergeur).

---

## Architecture

```
src/
  app/
    layout.tsx                    enveloppe neutre
    [locale]/layout.tsx           <html lang dir>, polices, en-tête, pied de page
    [locale]/page.tsx             assemblage des sections + données structurées
    [locale]/mentions-legales/    mentions légales et données personnelles
    api/contact/route.ts          validation serveur puis envoi Resend
  proxy.ts                        redirige / vers /fr ou /ar
  components/
    sections/                     une section de page par fichier
    site/                         en-tête, pied de page, sélecteurs
    ui/                           primitives (bouton, section, reveal, logo, plate, swatch)
  data/
    site.ts                       coordonnées de l'atelier
    wilayas.ts                    les 58 wilayas
    realisations.ts               catégories et types (client et serveur)
    realisations-photos.ts        lecture du dossier public/ (serveur uniquement)
  i18n/                           configuration et dictionnaires
  lib/contact-schema.ts           schéma Zod partagé client et serveur
```

### La bobine du hero

Le hero est coupé en deux panneaux côte à côte : la promesse et ses deux boutons
d'un côté, les vidéos de l'atelier de l'autre. Le texte est délibérément *à côté*
du film et non par-dessus : un texte posé sur une image animée exige un voile lourd
pour rester lisible, qui ternit la vidéo et échoue quand même dès qu'un plan passe
sur une cuisine claire.

`sections/hero-video.tsx` enchaîne les six clips de `public/videos/` en boucle, sans
son. Il utilise **deux** éléments `<video>` : l'un joue pendant que l'autre décode
déjà le clip suivant, ce qui permet à l'enchaînement d'être instantané. Un seul
élément obligerait à changer son `src` à chaque fin de clip, et le navigateur
détruit l'image courante avant d'avoir décodé la suivante — chaque passage
clignoterait en noir.

Le fondu enchaîné impose alors un ordre : l'élément sortant doit conserver sa
dernière image *sous* l'entrant pendant toute la durée du fondu, et ne peut être
masqué puis rechargé qu'une fois celui-ci terminé. C'est le rôle de l'état `stale`.

Le second élément ne télécharge rien tant que le premier clip n'a pas commencé :
personne ne doit payer deux films pour lire un titre.

Le son est coupé par construction et aucun bouton ne permet de l'activer. C'est
aussi ce qui autorise le navigateur à lancer la lecture automatiquement. Un bouton
pause reste accessible en bas du cadre, et `prefers-reduced-motion` met la bobine à
l'arrêt sur sa première image.

### La galerie de réalisations

Pas de nom de projet, pas de ville, pas de légende : une cuisine terminée plaide
pour elle-même, et une légende sous chaque vignette ne fait que ralentir l'œil.

La section affiche **dix photos** et cinq boutons : « Tous », puis une catégorie par
pièce. Le bouton « Afficher tout », en bas, ouvre une visionneuse plein écran qui
reprend les mêmes cinq filtres, avec deux chevrons pour parcourir la sélection et
une croix pour fermer. Cliquer une vignette ouvre la même visionneuse directement
sur la photo choisie.

En vue « Tous », les photos sont distribuées à tour de rôle entre les catégories
plutôt que concaténées dossier par dossier : le premier écran montre ainsi l'étendue
de ce que fabrique l'atelier au lieu de trois cuisines à la suite.

`realisations-photos.ts` lit le dossier `public/images/realisations` côté serveur et
passe la liste au composant client. C'est pour cela que les types et la liste des
catégories vivent dans un fichier séparé, `realisations.ts` : un `node:fs` importé
depuis un fichier `"use client"` serait embarqué dans le bundle du navigateur, et le
build échouerait.

La visionneuse est rendue dans un portail vers `<body>` : elle doit échapper au
contexte d'empilement de la section, où les transformations d'apparition au scroll
l'emprisonneraient.

### Échantillons de matériaux

Les quatre vignettes de la section « Matériaux d'exception » sont peintes sur un
canvas 2D (`ui/swatch.tsx`) : mat pour la mélamine, réflexions dures pour le high
gloss, fibre compressée pour le MDF, brossé pour la quincaillerie. Pas de photo sous
licence, pas de téléchargement.

### Performance

- Le titre du hero est un composant serveur animé en CSS : il ne dépend pas de
  JavaScript pour devenir visible, ce qui protège le LCP.
- Une seule vidéo est téléchargée au chargement ; la suivante n'est mise en tampon
  qu'une fois la première lancée.
- Les photos passent par `next/image` : AVIF et WebP générés à la volée, et le
  cadrage `sizes` évite de servir une image pleine largeur pour une vignette.
- `prefers-reduced-motion` stoppe la bobine et les apparitions au scroll.

### Bilinguisme et sens de lecture

L'arabe passe la page entière en `dir="rtl"`. Les composants n'utilisent que des
propriétés logiques (`ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-`, `text-start`), la
mise en page se retourne donc sans code spécifique. Les deux exceptions, où CSS n'a
pas d'équivalent logique, sont traitées par les variantes `rtl:` et `ltr:` définies
dans `globals.css`. Dans la visionneuse, les chevrons et les flèches du clavier
suivent eux aussi le sens de lecture : la flèche gauche désigne toujours la photo
qui se trouve à gauche.

L'arabe étant cursif, une règle globale neutralise tout interlettrage sur la page
arabe : appliquer `letter-spacing` à l'arabe sépare les lettres liées et casse les
mots. Seuls les îlots marqués `dir="ltr"` (le logo, les numéros) gardent le leur.

### Polices

Chaque langue reçoit une paire : une police de titre pour les capitales espacées de
la charte, une police de texte pour les paragraphes. Les deux paires sont choisies
pour partager le même squelette, afin que le site ne change pas de personnalité en
changeant de langue.

| | Titres | Texte |
|---|---|---|
| Français | Jost | Manrope |
| العربية | Alexandria | IBM Plex Sans Arabic |

Alexandria est la contrepartie arabe de Jost : mêmes panses circulaires, même trait
régulier, donc les titres gardent leur allure architecturale en RTL. IBM Plex Sans
Arabic porte les longs paragraphes comme Manrope le fait en latin. Rien de
calligraphique, volontairement : c'est une menuiserie, pas un faire-part.

La bascule se fait par la règle `[lang="ar"]` dans `globals.css`, qui réaffecte
`--font-display-active` et `--font-body-active`.

---

## Déploiement

Le projet se déploie tel quel sur Vercel. Ajoutez `RESEND_API_KEY`, `CONTACT_TO` et
`CONTACT_FROM` dans les variables d'environnement du projet. `/fr`, `/ar` et les
pages légales sont générés statiquement au build ; seule la route `/api/contact`
s'exécute à la demande.

Sur un autre hébergeur, `npm run build` puis `npm start` suffisent (Node 20 ou plus).

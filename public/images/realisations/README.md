# Photos de réalisations

Un sous-dossier par catégorie. La galerie du site lit ces dossiers directement :
déposez un fichier, il apparaît. Il n'y a aucune liste à tenir à jour ailleurs, et
aucun fichier à nommer d'une façon particulière.

| Dossier | Filtre affiché sur le site |
|---|---|
| `bureau/` | Bureaux |
| `chambre/` | Chambres |
| `cuisine/` | Cuisines |
| `meubletv/` | Meubles TV |

Les quatre noms de dossiers sont fixés dans `src/data/realisations.ts` ; c'est aussi
là que se change leur ordre d'affichage. Les libellés traduits sont dans les
dictionnaires, clé `realisations.categories`.

## Nommage et ordre

N'importe quel nom en `.jpg`, `.jpeg`, `.png`, `.webp` ou `.avif` convient. À
l'intérieur d'une catégorie, les photos sont classées par nom de fichier avec un tri
numérique : `01.jpg`, `02.jpg`, `10.jpg` sortent dans cet ordre, et non `01`, `10`,
`02`. Numéroter les fichiers reste donc la façon la plus simple de décider quelles
photos passent en premier.

La section n'affiche que les **dix premières** photos de la sélection courante ; le
bouton « Afficher tout » ouvre la visionneuse sur la totalité.

## Proportions attendues

Les vignettes sont des portraits 4:5 recadrés automatiquement (`object-fit: cover`),
et la visionneuse affiche la photo entière sans la recadrer. Une image cadrée en
portrait, autour de 1200 px de large, rend bien dans les deux.

## Conseils

- JPEG de qualité 80 à 85. Next.js les reconvertit en AVIF et WebP au vol, inutile
  de compresser à l'extrême en amont.
- Évitez les photos prises au flash direct : la lumière rasante d'une fenêtre rend
  bien mieux le relief des façades et le grain du bois.
- Photographiez de face ou en léger trois-quarts, appareil à hauteur du plan de
  travail, plutôt que depuis un coin en plongée.
- Rangez le plan de travail avant la prise de vue : deux ou trois objets suffisent.

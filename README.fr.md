# Goose Glance <img src="./public/icons/icon128.png" alt="LOGO" width="30"> </br>Les détails des offres en un coup d’œil

> Ceci est la version française du README du projet.

![Image de bienvenue](./components/pages/public/WelcomeImage.webp)

## Démarrage rapide
Envie d’essayer rapidement ? [![Voir dans le Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-View-blue?logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/goose-glance-for-waterloo/hblfffccmiegiahkolkendnfkaegogjg)

### Qu’est‑ce que Goose Glance
Goose Glance est une extension pour Chrome, propulsée par un LLM (Large Language Model), conçue pour Waterloo Works. Elle extrait automatiquement le contenu des offres publiées sur Waterloo Works et s’appuie sur l’IA pour résumer les informations clés : responsabilités, qualifications requises, durée de la période de travail/stage et localisation. Ces informations sont ensuite injectées directement dans la page de l’offre, pour un aperçu rapide et un filtrage plus efficace des opportunités.

## Confidentialité
Tout le monde n’a pas envie de lire chaque ligne de code pour savoir où vont ses données. [Voici](https://mango-ground-0bd6b9d0f.1.azurestaticapps.net/) un résumé rapide des données utilisées par Goose Glance.

Veuillez noter que Goose Glance est open source sous licence MIT et fourni « tel quel », sans garantie ni condition d’aucune sorte.

## Notes pour les développeurs

### Stack technique de Goose Glance

- TypeScript
- React
- Redux
- Vite
- WebLLM
- Tailwind CSS
- Indexed DB
- Composants Fluent UI

### Développement et build

L’extension se compose de trois parties :

1. Fenêtre popup pour la configuration de l’extension. Voir le dossier `components/popup`.
2. Contenu injecté dans la page Waterloo Works. Voir le dossier `components/content`.
3. Pages ouvertes dans de nouveaux onglets pour l’initialisation et la configuration après une nouvelle installation. Voir le dossier `components/pages`.

L’exécution de `yarn build` appelle `scripts/build.js`, qui construit séparément ces parties, copie le contenu du dossier `public` et produit un dossier `dist`. Pour le développement et les tests, chargez le dossier `dist` dans le navigateur comme extension non empaquetée.

L’exécution de `yarn watch` appelle `scripts/watch.js`, qui relance automatiquement `scripts/build.js` à chaque modification de fichier pour faciliter le développement.

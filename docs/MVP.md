# DevAgentsHub — MVP Solide

## 🧠 Objectif du MVP

Le MVP de DevAgentsHub ne doit pas être une simple démo visuelle.  
Il doit constituer une **base produit propre, maintenable et extensible**, permettant de valider :

- l’intérêt du concept “outils + contenu + communauté”
- la structure technique long terme
- le workflow de développement
- le déploiement automatisé
- le lancement local complet par n’importe quel développeur

Le MVP doit donc être :

- solide techniquement
- minimal en surface fonctionnelle
- prêt à évoluer
- exécutable en local et en environnement distant

---

# 🎯 Périmètre fonctionnel du MVP

Le MVP doit contenir 4 piliers :

## 1. Outils
Le MVP doit proposer 3 outils concrets et utilisables.

### Outil 1 — Générateur de prompts Codex
Permet à l’utilisateur de générer un prompt structuré pour Codex selon :

- type de projet
- stack
- objectif
- contraintes
- niveau de détail

### Outil 2 — Générateur de structure de projet
Permet de générer une arborescence type pour un projet :

- React / Next.js
- Node / Express
- Fullstack monorepo
- Game dev docs

### Outil 3 — Debug Helper
Permet à l’utilisateur de coller :

- un message d’erreur
- un extrait de code
- un contexte technique

Et d’obtenir une réponse structurée :

- causes possibles
- pistes de résolution
- checklist de debug

---

## 2. Contenu
Le MVP doit intégrer une vraie partie contenu.

### Contenus minimum
- 1 landing page
- 1 page “Outils”
- 1 page “Contenu / Guides”
- 3 articles initiaux
- 1 page “Formations”
- 1 page “Communauté”
- 1 page “À propos”

### Articles initiaux recommandés
- Comment bien briefer Codex sur un projet
- Comment structurer un projet IA/dev proprement
- Comment utiliser des agents IA dans un workflow de développement

---

## 3. Formations
Le MVP ne doit pas encore intégrer une plateforme e-learning complexe, mais il doit poser la structure.

### MVP formation
- 1 parcours gratuit
- 1 cours
- 3 leçons
- suivi de progression utilisateur simple

Exemple :
- Parcours : “Bien débuter avec les agents IA pour le développement”
- Module 1 : Comprendre le rôle d’un agent
- Module 2 : Bien rédiger un brief
- Module 3 : Workflow concret avec Git + review

---

## 4. Communauté
La partie communauté doit être simple mais réelle.

### MVP communauté
- liste de discussions
- page détail discussion
- création d’un sujet
- réponse à un sujet
- authentification requise pour publier

Pas besoin de système avancé de réputation au MVP.

---

# 🧱 Périmètre technique du MVP

## Stack retenue

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query

### Backend
- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- Zod

### Monorepo
- Turborepo
- pnpm workspace

### Infra
- Docker Compose pour le local
- GitHub Actions pour la CI
- Render pour le déploiement

---

# 📦 Structure du repository

repo/
  apps/
    web/                 → Frontend Next.js
    api/                 → Backend Express

  packages/
    ui/                  → composants partagés
    config/              → config partagée
    types/               → types partagés
    utils/               → helpers
    validation/          → schémas Zod

  infra/
    docker/              → configuration Docker locale
    render/              → render.yaml
    github/              → documentation CI/CD

  docs/
    100-architecture/
    200-product/
    300-features/
    400-devops/

  .github/
    workflows/

---

# 🗺️ Pages du MVP

## Public
- `/`
- `/tools`
- `/tools/prompt-generator`
- `/tools/project-structure-generator`
- `/tools/debug-helper`
- `/guides`
- `/guides/[slug]`
- `/formations`
- `/formations/[slug]`
- `/community`
- `/community/[slug]`
- `/about`

## Auth
- `/login`
- `/register`

## Dashboard utilisateur
- `/dashboard`
- `/dashboard/profile`
- `/dashboard/progress`
- `/dashboard/saved-runs`
- `/dashboard/templates`
- `/dashboard/templates/[id]`
- `/dashboard/bookmarks`

## Search
- `/search`

## Admin minimal
- `/admin`
- `/admin/analytics`
- `/admin/articles`
- `/admin/tools`
- `/admin/courses`
- `/admin/community`

---

# 🔌 Endpoints API MVP

## Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## Tools
- `POST /api/tools/prompt-generator/run`
- `POST /api/tools/project-structure-generator/run`
- `POST /api/tools/debug-helper/run`
- `GET /api/tools`
- `GET /api/tools/:slug`

## Search
- `GET /api/search?q=...`
- `GET /api/search?q=...&type=tools|guides|courses|discussions`

## Dashboard utilisateur
- `GET /api/me/tool-runs`
- `GET /api/me/tool-runs/:id`
- `GET /api/me/templates`
- `GET /api/me/templates/:id`
- `POST /api/me/templates`
- `PATCH /api/me/templates/:id`
- `GET /api/me/bookmarks`
- `POST /api/me/bookmarks`
- `DELETE /api/me/bookmarks/:id`

## Content
- `GET /api/articles`
- `GET /api/articles/:slug`

## Learning
- `GET /api/courses`
- `GET /api/courses/:slug`
- `GET /api/lessons/:slug`
- `POST /api/lessons/:id/progress`

## Community
- `GET /api/discussions`
- `GET /api/discussions/:slug`
- `POST /api/discussions`
- `POST /api/discussions/:id/replies`

## Admin
- `GET /api/admin/analytics/overview`
- `POST /api/admin/articles`
- `PATCH /api/admin/articles/:id`
- `POST /api/admin/courses`
- `POST /api/admin/tools`

---

# 🗄️ Modèle de données initial

## User
- id
- email
- passwordHash
- role
- createdAt
- updatedAt

## Profile
- id
- userId
- displayName
- bio
- avatarUrl

## Tool
- id
- slug
- name
- description
- category
- isPublished

## ToolRun
- id
- toolId
- userId nullable
- inputJson
- outputJson
- createdAt

## Article
- id
- slug
- title
- excerpt
- content
- isPublished
- createdAt
- updatedAt

## Course
- id
- slug
- title
- description
- isPublished

## Lesson
- id
- courseId
- slug
- title
- content
- order

## LessonProgress
- id
- userId
- lessonId
- completed
- completedAt

## Bookmark
- id
- userId
- articleId nullable
- courseId nullable
- createdAt

## ProductEvent
- id
- eventType
- userId nullable
- entityType nullable
- entityId nullable
- metadata nullable
- createdAt

## Discussion
- id
- userId
- slug
- title
- content
- createdAt

## DiscussionReply
- id
- discussionId
- userId
- content
- createdAt

---

# 🧪 Exigences qualité

Le MVP doit être propre dès le départ.

## Obligatoire
- TypeScript strict
- ESLint
- Prettier
- Zod pour validation des entrées API
- séparation claire controller / service / repository
- gestion propre des erreurs
- variables d’environnement validées
- scripts npm/pnpm documentés

---

# 💻 Environnement local obligatoire

## Objectif
Le projet doit pouvoir être lancé en local par simple clonage du repo et exécution de quelques commandes documentées.

Le setup local doit être mis en place dès le début par Codex.

---

## Base de données locale obligatoire

Codex doit mettre en place un environnement local complet avec PostgreSQL.

### Exigences
- création d’une base PostgreSQL locale via Docker Compose
- création d’un utilisateur dédié
- définition d’un mot de passe dédié
- nom de base explicite
- port exposé localement
- connexion fonctionnelle avec Prisma

### Paramètres recommandés pour le local
- database name : `dev_agents_hub`
- database user : `devagentshub`
- database password : `devagentshub_password`
- database port : `5432`

---

## Docker Compose local

Codex doit créer un `docker-compose.yml` ou `compose.yml` à la racine ou dans `infra/docker/` contenant au minimum :

- un service `postgres`
- volume persistant
- variables d’environnement nécessaires
- healthcheck PostgreSQL si possible

Exemple d’intention attendue :
- lancer PostgreSQL en local
- permettre à l’API de s’y connecter immédiatement
- éviter toute configuration manuelle supplémentaire

---

## Fichiers d’environnement

Codex doit créer :

### Pour l’API
- `.env.example`
- `.env.local` documenté
- schéma de validation des variables d’environnement

### Variables minimales attendues
- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `CORS_ORIGIN`
- `JWT_SECRET`

### Exemple de `DATABASE_URL`
`postgresql://devagentshub:devagentshub_password@localhost:5432/dev_agents_hub`

---

## Scripts obligatoires

Codex doit prévoir des scripts clairs :

### Racine
- `pnpm install`
- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

### Prisma / DB
- `pnpm db:up` → démarre postgres local
- `pnpm db:down` → arrête postgres local
- `pnpm db:reset`
- `pnpm db:migrate`
- `pnpm db:seed`

---

## Initialisation locale attendue

Le projet doit pouvoir être lancé avec un enchaînement simple :

1. installer les dépendances
2. copier `.env.example` vers `.env.local`
3. démarrer PostgreSQL local
4. lancer les migrations Prisma
5. exécuter un seed minimal
6. lancer le front et l’API en mode dev

---

## Seed minimal obligatoire

Codex doit créer un seed de base permettant de tester le projet localement :

### Données minimales
- 1 utilisateur admin
- 3 outils publiés
- 3 articles
- 1 cours
- 3 leçons
- 2 discussions de démonstration

---

# 🌿 Workflow Git obligatoire

Le projet doit respecter le workflow suivant :

## Branches
- `main`
- `develop`
- `feature/*`
- `fix/*`
- `hotfix/*`

## Règles
- toute nouvelle feature part de `develop`
- toute feature est développée dans une branche dédiée
- push sur la branche feature
- PR vers `develop`
- review avant merge
- merge de `develop` vers `main` pour release

## Attendu
Codex doit préparer le projet pour fonctionner proprement dans ce workflow.

---

# 🔁 CI obligatoire

Codex doit mettre en place une CI via GitHub Actions.

## Déclencheurs
- sur pull request vers `develop`
- sur pull request vers `main`
- sur push vers `develop`
- sur push vers `main`

## Jobs minimum
- install
- lint
- typecheck
- tests
- build

## Bonus recommandé
- vérification Prisma
- vérification variables d’environnement
- cache pnpm

---

# 🚀 CD obligatoire

Codex doit préparer le projet pour le déploiement automatisé.

## Cibles
- `develop` → staging
- `main` → production

## Attendu
- compatibilité avec Render
- configuration claire des variables d’environnement
- structure compatible preview deployments
- présence d’un `render.yaml`

---

# ☁️ Déploiement Render

## Services à prévoir

### Web
- application frontend Next.js

### API
- backend Express

### Database
- PostgreSQL managé sur Render

---

## Ce que Codex doit préparer
- structure compatible Render
- commandes de build claires
- commandes de start claires
- variables d’environnement documentées
- blueprint `render.yaml`

---

# 🧪 Tests attendus

Le MVP solide doit prévoir des tests minimum.

## Backend
- tests unitaires sur services critiques
- tests d’intégration sur endpoints principaux

## Frontend
- tests simples sur pages principales ou composants critiques

Pas besoin d’une couverture énorme, mais la base doit exister.

---

# 🔐 Sécurité minimum

- hash des mots de passe
- validation des payloads
- protection des routes admin
- CORS configuré
- pas de secrets hardcodés
- sanitation de base des entrées utilisateur

---

# 📈 Indicateurs de réussite du MVP

Le MVP est validé si :

- le projet se lance en local sans bricolage
- la DB locale fonctionne immédiatement
- les 3 outils fonctionnent
- le contenu est affiché correctement
- un utilisateur peut s’inscrire et se connecter
- un utilisateur connecté peut créer une discussion
- la progression d’une leçon peut être enregistrée
- le lint, build, typecheck et tests passent
- le projet est prêt pour staging et production

---

# 🧨 Conclusion

Ce MVP solide doit être pensé comme une vraie fondation produit.

Il ne doit pas chercher à tout faire, mais il doit déjà faire correctement :

- outils
- contenu
- communauté
- formation
- environnement local
- base de données locale
- workflow Git
- CI/CD
- déploiement automatisé

L’objectif n’est pas seulement de “coder vite”, mais de poser une base propre pour faire de DevAgentsHub une vraie plateforme durable.

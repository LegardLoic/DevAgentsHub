# DevAgentsHub — Architecture Technique & Stack

## 🧠 Vision du projet

DevAgentsHub est une plateforme web combinant :

- 🛠️ Outils (générateurs, helpers, converters)
- 📚 Contenu (guides, articles, docs)
- 🎓 Formations (agents IA, Codex, dev boosté)
- 💬 Communauté (discussions, partage, feedback)

Objectif :
> Devenir la plateforme de référence pour les développeurs utilisant l’IA.

---

# 🏗️ Architecture globale

## Type d’architecture

- Monorepo (Turborepo)
- Fullstack TypeScript
- Séparation claire Front / API / Packages

---

# 📦 Structure du repository

repo/
  apps/
    web/            → Frontend (Next.js)
    api/            → Backend (Node / Express ou NestJS)

  packages/
    ui/             → Composants UI partagés
    config/         → Configs globales
    types/          → Types partagés
    utils/          → Fonctions utilitaires
    validation/     → Schémas Zod

  infra/
    render/         → Config Render (render.yaml)
    github/         → CI/CD config

  docs/
    100-architecture/
    200-product/
    300-features/
    400-devops/

---

# ⚙️ Stack technique

## Frontend

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zod

## Backend

- Node.js
- Express (ou NestJS)
- TypeScript
- Prisma ORM
- PostgreSQL

## Infra & outils

- Render (hébergement)
- GitHub Actions (CI)
- Turborepo (monorepo)
- Cloudinary (uploads)
- Plausible (analytics)

## Extensions futures

- Redis (cache / queue)
- Meilisearch (recherche)
- Stripe (paiements)

---

# 🧩 Architecture applicative

## apps/web

- Landing page
- Outils
- Blog / contenu
- Formations
- Dashboard utilisateur
- Communauté

## apps/api

- Auth
- Users
- Tools
- Content
- Community
- Learning
- Admin

---

# 📦 Packages

## ui
Composants réutilisables

## types
Types partagés front/back

## validation
Schémas Zod

## utils
Helpers globaux

---

# 🧠 Modules métier

## Auth & Users
- login/register
- profils
- rôles (user / admin)

## Tools
- générateurs
- debug helpers
- converters
- tracking usage

## Content
- articles
- catégories
- tags
- SEO

## Community
- discussions
- commentaires
- réponses
- likes

## Learning
- parcours
- modules
- leçons
- progression

## Admin
- gestion contenu
- modération
- gestion outils

---

# 🗄️ Base de données

- User
- Session
- Account
- Profile
- Tool
- ToolRun
- Article
- Course
- Lesson
- Discussion
- Comment
- Like
- Bookmark
- AuditLog

---

# 🌿 Workflow Git

## Branches

- main → production
- develop → intégration
- feature/*
- fix/*
- hotfix/*

## Règles

- Feature → develop
- PR obligatoire
- Review obligatoire
- Tests obligatoires
- Merge develop → main

---

# 🔁 CI/CD

## CI

- install
- lint
- typecheck
- tests
- build

## CD

- develop → staging
- main → production
- PR → preview (Render)

---

# 🌍 Environnements

## Local
- Docker
- Postgres

## Staging
- develop

## Production
- main

---

# 🚀 Déploiement (Render)

## Services

- Front (Next.js)
- API (Node)
- PostgreSQL

## Futur

- Worker
- Cron jobs

---

# 💡 Bonnes pratiques

- validation Zod
- types partagés
- logs propres
- feature flags
- monitoring

---

# 🔮 Évolutions

- SaaS
- premium tools
- marketplace
- agents IA

---

# 🧨 Conclusion

DevAgentsHub = plateforme scalable + trafic + business
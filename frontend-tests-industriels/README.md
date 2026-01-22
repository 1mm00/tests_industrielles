# 🔬 Frontend - Système de Gestion des Tests Industriels

Application React moderne et professionnelle pour la gestion des tests industriels, équipements, non-conformités et KPIs.

## 🚀 Technologies

- **React 18+** avec TypeScript
- **Vite** - Build tool ultra-rapide
- **TailwindCSS** - Framework CSS utility-first
- **React Router v6** - Navigation
- **TanStack Query (React Query)** - Gestion de l'état serveur
- **Zustand** - State management global
- **Axios** - Client HTTP
- **React Hook Form** - Gestion des formulaires
- **Lucide React** - Icônes modernes
- **Recharts** - Graphiques et visualisations

## 📁 Structure du Projet

```
frontend-tests-industriels/
├── public/                 # Fichiers statiques
├── src/
│   ├── components/        # Composants réutilisables
│   │   ├── layout/       # Layouts (MainLayout, etc.)
│   │   ├── ui/           # Composants UI génériques
│   │   └── ...
│   ├── pages/            # Pages de l'application
│   │   ├── auth/         # Pages d'authentification
│   │   ├── dashboard/    # Dashboard
│   │   ├── tests/        # Gestion des tests
│   │   └── ...
│   ├── services/         # Services API
│   │   ├── authService.ts
│   │   ├── testsService.ts
│   │   └── ...
│   ├── hooks/            # Custom React hooks
│   ├── store/            # State management (Zustand)
│   ├── types/            # Types TypeScript
│   ├── utils/            # Utilitaires et helpers
│   ├── config/           # Configuration (API, etc.)
│   ├── App.tsx           # Composant principal
│   ├── main.tsx          # Point d'entrée
│   └── index.css         # Styles globaux
├── .env                  # Variables d'environnement
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## 🛠️ Installation

### Prérequis

- Node.js 18+ et npm
- Backend Laravel en cours d'exécution (port 8000)

### Étapes

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Configurer les variables d'environnement**
   
   Créer un fichier `.env` à la racine :
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_APP_NAME="Gestion Tests Industriels"
   VITE_APP_VERSION=1.0.0
   ```

3. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

4. **Accéder à l'application**
   
   Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur

## 📦 Scripts Disponibles

```bash
# Développement
npm run dev              # Lancer le serveur de développement

# Build
npm run build            # Compiler pour la production
npm run preview          # Prévisualiser le build de production

# Qualité du code
npm run lint             # Linter le code
npm run type-check       # Vérifier les types TypeScript
```

## 🎨 Design System

L'application utilise un design system cohérent avec :

### Couleurs

- **Primary** : Bleu (tests, actions principales)
- **Secondary** : Violet (actions secondaires)
- **Success** : Vert (#22c55e)
- **Warning** : Orange (#f59e0b)
- **Error** : Rouge (#ef4444)
- **Info** : Bleu clair (#3b82f6)

### Composants Utilitaires

Classes CSS personnalisées disponibles :

- **Boutons** : `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-success`, `.btn-danger`
- **Cartes** : `.card`, `.card-header`, `.card-title`
- **Formulaires** : `.form-label`, `.form-input`, `.form-select`, `.form-error`
- **Badges** : `.badge`, `.badge-success`, `.badge-warning`, `.badge-error`
- **Tables** : `.table-container`, `.table`

## 🔐 Authentification

L'application utilise :

- **JWT Tokens** pour l'authentification
- **Zustand** pour le state management de l'auth
- **Axios Interceptors** pour ajouter automatiquement le token
- **Protected Routes** pour sécuriser les pages

### Flow d'authentification

1. Login → Récupération du token
2. Stockage dans localStorage et Zustand
3. Ajout automatique dans les headers via interceptor
4. Redirection automatique si token invalide/expiré

## 📡 API Integration

Configuration API dans `src/config/api.ts` :

```typescript
const API_BASE_URL = 'http://localhost:8000/api';
```

### Services disponibles

- **authService** : Login, register, logout, etc.
- **testsService** : CRUD tests industriels
- **equipementsService** : Gestion équipements (à créer)
- **ncService** : Non-conformités (à créer)
- Plus à venir...

## 🚧 Pages Actuelles

✅ **Implémentées** :
- Page de connexion (`/login`)
- Dashboard (`/`)

🔜 **À développer** :
- Liste des tests (`/tests`)
- Détail d'un test
- Gestion des équipements (`/equipements`)
- Non-conformités (`/non-conformites`)
- Instruments de mesure
- Rapports
- Planning
- KPIs
- Paramètres

## 🎯 Prochaines Étapes

1. ✅ Setup initial et configuration
2. ✅ Authentification et layout
3. ✅ Dashboard avec statistiques
4. 🔜 Page liste des tests avec filtres
5. 🔜 Formulaires de création/modification
6. 🔜 Détails et visualisation
7. 🔜 Gestion des équipements
8. 🔜 Module NC
9. 🔜 Rapports et exports

## 🤝 Conventions de Code

- **TypeScript** : Types stricts, pas de `any`
- **Composants** : Fonctionnels avec hooks
- **Naming** : PascalCase pour composants, camelCase pour fonctions
- **Imports** : Path aliases (`@/...`)
- **CSS** : TailwindCSS uniquement, pas de CSS inline

## 📚 Documentation Utile

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [TanStack Query](https://tanstack.com/query/)
- [Zustand](https://github.com/pmndrs/zustand)

## 📝 License

Projet privé - Tous droits réservés

---

**Développé pour le système de gestion des tests industriels** 🏭

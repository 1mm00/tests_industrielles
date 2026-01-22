# 🚀 Guide de Démarrage Rapide

## Installation en 3 étapes

### 1️⃣ Installer les dépendances
```bash
npm install
```

### 2️⃣ Lancer l'application
```bash
npm run dev
```

### 3️⃣ Ouvrir dans le navigateur
```
http://localhost:3000
```

## 🔐 Se Connecter

### Compte de test (à créer dans le backend)
```
Email: admin@example.com
Password: password
```

## 📁 Fichiers Importants

| Fichier | Description |
|---------|-------------|
| `src/App.tsx` | Routing principal |
| `src/pages/auth/LoginPage.tsx` | Page de connexion |
| `src/pages/dashboard/DashboardPage.tsx` | Dashboard |
| `src/components/layout/MainLayout.tsx` | Layout avec sidebar |
| `src/services/authService.ts` | API Authentification |
| `src/store/authStore.ts` | State management |
| `src/types/index.ts` | Types TypeScript |
| `.env` | Configuration API |

## 🛠️ Configuration Backend

Assurez-vous que le backend Laravel est lancé :

```bash
# Dans le dossier backend
cd ../backend-tests-industriels
php artisan serve
```

Le frontend est configuré pour communiquer avec : `http://localhost:8000/api`

## 🎨 Personnalisation

### Changer l'URL de l'API
Modifier le fichier `.env` :
```env
VITE_API_BASE_URL=http://votre-api.com/api
```

### Couleurs
Modifier `tailwind.config.js` :
```javascript
colors: {
  primary: { /* vos couleurs */ },
  secondary: { /* vos couleurs */ }
}
```

## 📖 Apprendre Plus

- Documentation complète : `README.md`
- État du projet : `PROJET_STATUS.md`
- Types TypeScript : `src/types/index.ts`

## ❓ Problèmes Courants

### Le serveur ne démarre pas
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Erreur de connexion à l'API
- Vérifier que le backend Laravel est lancé
- Vérifier l'URL dans `.env`
- Vérifier les CORS dans Laravel

### Erreur TypeScript
```bash
# Vérifier les types
npm run type-check
```

## 🎯 Prochaines Pages à Développer

1. Liste des tests (`/tests`)
2. Détail d'un test
3. Formulaire nouveau test
4. Gestion équipements
5. Non-conformités

Consultez `PROJET_STATUS.md` pour plus de détails !

---

**Bon développement ! 🚀**

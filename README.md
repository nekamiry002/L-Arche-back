# L-Arche Backend 🐾

Backend API REST pour la plateforme **PawCare** (L'Arche) - une marketplace de garde d'animaux.

## Description

L'Arche est une application qui met en relation des propriétaires d'animaux avec des gardiens qualifiés. Ce backend fournit une API REST complète pour gérer :
- L'authentification et les utilisateurs
- Les profils de gardiens et de propriétaires
- La gestion des animaux
- Les demandes et les gardes
- La messagerie
- Les avis et évaluations
- Le journal de garde

## Technologies

- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: JWT (JSON Web Tokens)
- **Environnement**: dotenv

## Installation

### 1. Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn
- Compte Supabase avec les identifiants disponibles

### 2. Clone et installation des dépendances

```bash
cd L-Arche-back
npm install
```

### 3. Configuration des variables d'environnement

Copie le fichier `.env.example` en `.env` et remplis les variables :

```bash
cp .env.example .env
```

Édite `.env` avec tes identifiants Supabase :

```env
SUPABASE_URL=https://mpjeevstdscslpachyrt.supabase.co
SUPABASE_KEY=your_supabase_key_here
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:3000
```

## Démarrage

### Mode développement (avec auto-restart)

```bash
npm run dev
```

Le serveur redémarrera automatiquement à chaque modification de fichier.

### Mode production

```bash
npm start
```

## Structure du projet

```
L-Arche-back/
├── src/
│   ├── server.js           # Point d'entrée principal
│   ├── config/
│   │   └── supabase.js     # Configuration Supabase
│   ├── middleware/
│   │   └── auth.js         # Middleware d'authentification
│   ├── routes/             # Routes de l'API
│   ├── controllers/        # Logique métier
│   ├── models/             # Modèles de données
│   └── utils/              # Utilitaires
├── .env.example            # Variables d'environnement (exemple)
├── .gitignore              # Fichiers ignorés par Git
├── package.json            # Dépendances et scripts
└── TODO.md                 # Plan d'implémentation
```

## Points de terminaison disponibles

### Santé du serveur

```
GET /api/health
```

Retourne le statut du serveur.

> ⚠️ **Autres endpoints**: À implémenter selon le plan dans [TODO.md](./TODO.md)

## Prochaines étapes

Consulte [TODO.md](./TODO.md) pour voir le plan complet d'implémentation du backend.

**Prochaine phase**: Configuration Supabase et création des tables de base de données.

## Logs et débogage

Le serveur utilise `console.log` pour les logs. Tous les erreurs et événements importants sont loggés dans la console.

## Contribution

À remplir selon les conventions du projet.

## Licence

À définir

---

Projet développé pour L'Arche 🐾

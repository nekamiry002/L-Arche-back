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
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

> `SUPABASE_SERVICE_ROLE_KEY` est requis pour la création de comptes et le ban d'utilisateurs.

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

## Points de terminaison

Voir [ENDPOINTS.md](./ENDPOINTS.md) pour la liste complète et détaillée de toutes les routes.

Routes disponibles :
- `/api/auth` — inscription, connexion, refresh, déconnexion
- `/api/users` — profil, recherche gardiens, actions admin
- `/api/animals` — CRUD animaux + upload photo
- `/api/species` — espèces/races
- `/api/reservations` — demandes de garde, gestion statuts
- `/api/disponibilites` — créneaux disponibles des gardiens
- `/api/reviews` — avis et notations
- `/api/journaux` — journal de garde en temps réel
- `/api/carnets-sante` — carnet de santé des animaux
- `/api/signalements` — signalements utilisateurs

## Logs et débogage

Le serveur utilise `console.log` pour les logs. Tous les erreurs et événements importants sont loggés dans la console.

## Contribution

À remplir selon les conventions du projet.

## Licence

À définir

---

Projet développé pour L'Arche 🐾

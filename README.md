# CRYSTAL RENT CAR — Premium Full-Stack MERN Car Rental Platform (Tunisia)

Plateforme web de location de véhicules de prestige et citadines en Tunisie pour **Crystal Rent Car**.
Architecture complète MERN (MongoDB Atlas, Express.js, React 19, Node.js) avec système de réservation en temps réel, conseiller intelligent **Crystal Assistant IA** (propulsé par Gemini 3.8 Flash), tableau de bord administratif complet et support trilingue (Français, Anglais, Arabe avec support RTL).

---

## 1. Technologies & Architecture

- **Base de données :** MongoDB Atlas (NoSQL persistant via Mongoose) avec connecteur résilient local automatique.
- **Backend :** Node.js, Express.js, TypeScript, JWT (JSON Web Tokens), bcryptjs pour le hachage sécurisé des mots de passe, Zod pour la validation stricte des requêtes.
- **Frontend :** React 19, Vite, Tailwind CSS, Recharts (analyses administratives), Lucide React (icônes premium), React Router v7.
- **Intelligence Artificielle :** SDK `@google/genai` (modèle `gemini-3.8-flash`) exécuté exclusivement côté serveur pour ancrer les recommandations sur la flotte réelle en stock.

---

## 2. Démarrage Rapide

### Prérequis
- Node.js >= 18
- npm ou yarn

### Installation
```bash
npm install
```

### Configuration des variables d'environnement (`.env`)
Copiez le fichier `.env.example` vers `.env` :
```env
# Connexion MongoDB Atlas (optionnel pour démarrage immédiat, le mode local résilient prend le relais en l'absence d'URI)
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/crystal_rent_car?retryWrites=true&w=majority"

# Clé API Google Gemini (pour Crystal Assistant IA)
GEMINI_API_KEY="votre_cle_gemini_api"

# Secret JWT pour l'authentification
JWT_SECRET="crystal_rent_car_jwt_super_secret_key_2026"

# Port d'écoute du serveur
PORT=3000

# Compte Administrateur Bootstrap initial
ADMIN_NAME="Crystal Administrator"
ADMIN_EMAIL="admin@crystalrentcar.com"
ADMIN_PASSWORD="AdminCrystal2026!Secure"
ADMIN_PHONE="+216 71 888 999"
```

### Lancement en Développement
```bash
npm run dev
```
L'application démarre sur `http://localhost:3000`.

---

## 3. Comptes de Test Pré-configurés

| Rôle | Email | Mot de passe | Accès |
| :--- | :--- | :--- | :--- |
| **Administrateur** | `admin@crystalrentcar.com` | `AdminCrystal2026!Secure` | `/admin` (Gestion flotte, réservations, métriques) |
| **Client** | `client@crystalrentcar.com` | `ClientCrystal2026!` | `/dashboard` (Réservations, annulation, favoris) |

Des boutons de remplissage rapide "Client Démo" et "Admin Démo" sont également disponibles directement sur la page `/login`.

---

## 4. Endpoints API Versionnés (`/api/v1`)

### Authentification
- `POST /api/v1/auth/register` : Création de compte client
- `POST /api/v1/auth/login` : Connexion et émission de token JWT
- `POST /api/v1/auth/logout` : Déconnexion
- `GET /api/v1/auth/me` : Profil de l'utilisateur connecté
- `PATCH /api/v1/auth/profile` : Mise à jour du nom et téléphone
- `POST /api/v1/auth/favorites/:vehicleId` : Ajout / retrait d'un véhicule favori

### Véhicules
- `GET /api/v1/cars` : Liste filtrable (catégorie, boîte, carburant, prix, places, recherche)
- `GET /api/v1/cars/featured` : Modèles phares
- `GET /api/v1/cars/:id` : Fiche détaillée et véhicules similaires

### Réservations
- `POST /api/v1/bookings/availability` : Contrôle de disponibilité sans conflit de dates
- `POST /api/v1/bookings` : Création d'une réservation avec référence unique (ex: `CRC-2026-XXXX`)
- `GET /api/v1/bookings/my` : Réservations du client connecté
- `POST /api/v1/bookings/my/:id/cancellation-request` : Demande d'annulation client avec motif

### Assistant IA & Recommandations
- `POST /api/v1/chat/recommend` : Analyse de la demande, filtrage sur le stock réel, appel Gemini 3.8 Flash ou moteur déterministe avec propositions et CTA "Réserver"

### Administration (Protégé par rôle admin)
- `GET /api/v1/admin/dashboard` : Métriques consolidées, taux d'occupation, graphiques Recharts
- `GET / POST /api/v1/admin/cars` : Consultation et ajout de véhicule
- `PATCH / DELETE /api/v1/admin/cars/:id` : Modification et suppression
- `GET /api/v1/admin/bookings` : Supervision de toutes les réservations
- `PATCH /api/v1/admin/bookings/:id/status` : Changement de statut (confirmée, en cours, terminée, rejetée)
- `GET /api/v1/admin/reports/csv` : Exportation du fichier CSV des réservations

---

## 5. Configuration MongoDB Atlas

1. Créez un compte gratuit sur [MongoDB Atlas](https://www.mongodb.com/atlas/database).
2. Créez un cluster (ex: M0 Free Sandbox).
3. Dans **Database Access**, créez un utilisateur avec mot de passe.
4. Dans **Network Access**, autorisez l'adresse IP (`0.0.0.0/0` pour le cloud).
5. Cliquez sur **Connect** > **Drivers** et copiez votre chaîne de connexion.
6. Renseignez-la dans `MONGODB_URI` dans votre fichier `.env`.
Au démarrage, Crystal Rent Car détecte automatiquement votre cluster Atlas et synchronise la flotte et les réservations.

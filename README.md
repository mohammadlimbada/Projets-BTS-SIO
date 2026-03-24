# VoyageExpress — Agence de Voyage en ligne

![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=flat&logo=vue.js&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat&logo=mysql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat&logo=vite&logoColor=white)

Application web d'agence de voyage développée dans le cadre du **BTS SIO SLAM** (2ème année).
Le projet suit une architecture **client-serveur** : une API REST Node.js/Express côté backend, une SPA Vue.js 3 côté frontend, et une base de données **MySQL** gérée via Laragon.

Les deux serveurs se lancent **en une seule commande** depuis la racine du projet.

---

## Sommaire

- [Fonctionnalités principales](#fonctionnalités-principales)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation et lancement](#installation-et-lancement)
- [Structure du projet](#structure-du-projet)
- [Endpoints API](#endpoints-api)
- [Base de données](#base-de-données)
- [Auteur](#auteur)

---

## Fonctionnalités principales

### Catalogue de voyages
- 30 destinations avec photo, prix, durée et catégorie
- Filtrage par catégorie : Plage, Ville, Montagne, Aventure, Culturel
- Recherche dynamique par nom ou destination
- Note moyenne calculée depuis les avis en base de données

### Page de détail
- Description complète, prix, dates, places disponibles
- Liste des prestations incluses
- Lecteur vidéo YouTube intégré (selon la destination)

### Réservation
- Formulaire complet avec calcul automatique du prix total
- Validation des champs côté client
- Enregistrement en base MySQL avec statut `en_attente_paiement`

### Avis clients
- Consultation et ajout d'avis par voyage (note 1 à 5 étoiles)
- Moyenne calculée dynamiquement depuis la base

### Paiement simulé
- Confirmation de paiement via l'API — passe le statut à `confirmée` en base
- Aucune transaction réelle effectuée

### Contact
- Formulaire de contact enregistré en base de données

---

## Stack technique

| Couche | Technologie | Rôle |
|---|---|---|
| Backend | Node.js | Environnement d'exécution JavaScript |
| Backend | Express 4.x | Framework HTTP — API REST |
| Backend | mysql2 | Pilote Node.js pour MySQL |
| Backend | dotenv | Variables d'environnement |
| Backend | CORS | Requêtes cross-origin |
| Frontend | Vue.js 3 | Framework JavaScript (Composition API) |
| Frontend | Axios 1.6 | Requêtes HTTP vers l'API |
| Frontend | Vite 5 | Build tool et serveur de développement |
| BDD | MySQL (Laragon) | Base de données relationnelle |
| Lancement | concurrently | Démarre backend + frontend en une seule commande |

---

## Prérequis

### 1. Node.js
- Version **LTS v18 ou supérieure** — https://nodejs.org/
- Vérification :
```bash
node -v
npm -v
```

### 2. Laragon
- Laragon fournit MySQL et un environnement de développement local pour Windows
- Téléchargement : https://laragon.org/download/ (version **Full**)
- Lancer Laragon et cliquer sur **Start All** pour démarrer MySQL

### 3. Git
- https://git-scm.com/

> VS Code n'est **pas obligatoire** pour lancer le projet — un simple CMD suffit.

---

## Installation et lancement

### Étape 1 — Récupérer le projet

```bash
git clone https://github.com/mohammadlimbada/Projets-BTS-SIO.git
cd mon-agence-voyage
```

Ou télécharger le ZIP depuis GitHub et extraire dans un dossier.

---

### Étape 2 — Créer la base de données

1. Ouvrir **Laragon** → cliquer sur **Start All**
2. Cliquer sur **Database** pour ouvrir HeidiSQL
3. Se connecter : hôte `localhost`, utilisateur `root`, mot de passe vide
4. Aller dans **Fichier > Exécuter un fichier SQL**, sélectionner `backend/database.sql`
5. Exécuter — la base `agence_voyage` est créée avec les 30 voyages et 40 avis

---

### Étape 3 — Créer le fichier `.env`

Dans le dossier `backend/`, créer un fichier `.env` :

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=agence_voyage
```

> Laragon n'a pas de mot de passe root par défaut — laisser `DB_PASSWORD` vide.

---

### Étape 4 — Installer les dépendances

Ouvrir un **CMD** à la racine du projet (`mon-agence-voyage/`) :

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

---

### Étape 5 — Lancer le projet

Toujours depuis la **racine du projet**, une seule commande suffit :

```bash
npm run dev
```

Le terminal affiche alors les deux serveurs démarrés simultanément :

```
[BACKEND]  > node server.js
[FRONTEND] > vite
[BACKEND]  Backend démarré sur http://localhost:5000
[BACKEND]  ✅ Connexion MySQL OK — base agence_voyage accessible
[FRONTEND] VITE v5.4.20  ready in 256 ms
[FRONTEND] ➜  Local:   http://localhost:3000/
```

---

### Étape 6 — Ouvrir l'application

Dans un navigateur, accéder à :

```
http://localhost:3000
```

---

## Variables d'environnement

| Variable | Valeur par défaut | Description |
|---|---|---|
| `DB_HOST` | `localhost` | Hôte du serveur MySQL |
| `DB_PORT` | `3306` | Port MySQL |
| `DB_USER` | `root` | Utilisateur MySQL |
| `DB_PASSWORD` | *(vide)* | Mot de passe MySQL |
| `DB_NAME` | `agence_voyage` | Nom de la base de données |

---

## Structure du projet

```
mon-agence-voyage/
│
├── backend/
│   ├── server.js          # Serveur Express — toutes les routes API + connexion MySQL
│   ├── database.sql       # Schéma SQL + données initiales (30 voyages, 40 avis)
│   ├── package.json       # Dépendances : Express, mysql2, cors, dotenv
│   └── .env               # Variables d'environnement (à créer, non versionné)
│
├── frontend/
│   ├── src/
│   │   ├── App.vue        # Composant principal Vue.js (toute l'interface)
│   │   ├── main.js        # Initialisation Vue
│   │   └── style.css      # Styles globaux
│   ├── index.html         # Point d'entrée HTML
│   ├── vite.config.js     # Configuration Vite
│   └── package.json       # Dépendances : Vue, Axios, Vite
│
└── package.json           # Script racine — lance backend + frontend en une commande
```

---

## Endpoints API

Le backend expose une API REST sur `http://localhost:5000/api`.

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/voyages` | Liste tous les voyages (`?categorie=` et `?recherche=` optionnels) |
| `GET` | `/api/voyages/:id` | Détail d'un voyage |
| `GET` | `/api/avis` | 6 avis récents, ou `?voyageId=X` pour un voyage précis |
| `GET` | `/api/avis/stats` | Nombre d'avis par voyage |
| `POST` | `/api/avis` | Ajouter un avis `{ voyageId, auteur, note, texte }` |
| `POST` | `/api/reservations` | Créer une réservation |
| `POST` | `/api/paiement` | Confirmer le paiement `{ reservationId }` |
| `POST` | `/api/contact` | Enregistrer un message de contact |

---

## Base de données

La base `agence_voyage` contient 4 tables :

| Table | Description |
|---|---|
| `voyages` | 30 destinations : titre, destination, description, prix, durée, image, vidéo, inclus (JSON), catégorie, note |
| `avis` | Avis clients liés à un voyage (note 1-5, auteur, texte, date) |
| `reservations` | Réservations avec statut (`en_attente_paiement` / `confirmée`) |
| `messages` | Messages reçus via le formulaire de contact |

Le fichier `backend/database.sql` génère toute la structure et insère les données de démonstration.

---

## Auteur

**Mohammad LIMBADA**
BTS SIO SLAM — 2ème année
mohammad.limbada97494@gmail.com

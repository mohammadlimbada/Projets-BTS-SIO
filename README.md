#  VoyageExpress — Agence de Voyage en ligne

Application web d'agence de voyage développée dans le cadre du **BTS SIO SLAM** (2ème année).  
Le projet met en œuvre **Node.js / Express** côté serveur et **Vue.js 3** côté client, dans une architecture REST API + SPA.

---

##  Sommaire

- [Présentation du projet](#présentation-du-projet)
- [Fonctionnalités principales](#fonctionnalités-principales)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation et lancement](#installation-et-lancement)
- [Utilisation](#utilisation)
- [Structure du projet](#structure-du-projet)
- [Auteur](#auteur)

---

## Présentation du projet

VoyageExpress est une application web qui permet à des utilisateurs de consulter un catalogue de voyages, de filtrer les destinations par catégorie, de voir le détail de chaque offre et de soumettre une réservation en ligne.

Le projet est découpé en deux parties bien distinctes :
- Un **backend REST** développé avec Express, qui expose les données et gère les réservations
- Un **frontend SPA** développé avec Vue.js 3, qui consomme l'API et affiche l'interface

---

## Fonctionnalités principales

###  Catalogue de voyages
- Affichage de **30 destinations** avec photo, prix, durée et catégorie
- Filtrage par catégorie : Plage, Ville, Montagne, Aventure, Culture
- Barre de recherche par nom de destination ou pays
- Affichage en grille responsive adapté mobile/desktop

### 📄 Page de détail
- Description complète du voyage
- Photo principale + galerie
- Vidéo de présentation de la destination (pour certains voyages)
- Liste des prestations incluses (vol, hôtel, guide...)
- Prix total et places disponibles

### 📝 Réservation
- Formulaire de réservation avec nom, prénom, email, date et nombre de personnes
- Validation des champs côté client
- Envoi de la réservation vers l'API backend (POST)
- Confirmation affichée à l'utilisateur
- Les réservations reçues s'affichent dans le terminal du serveur en temps réel

### 📞 Page Contact
- Informations de l'agence (adresse, téléphone, horaires)
- Email de contact : mohammad.limbada97494@gmail.com
- Formulaire de message

---

## Stack technique

| Côté | Technologie | Rôle |
|------|-------------|------|
| Backend | Node.js | Environnement d'exécution JavaScript |
| Backend | Express | Framework HTTP / création de l'API REST |
| Backend | CORS | Middleware pour autoriser les requêtes cross-origin |
| Frontend | Vue.js 3 | Framework JavaScript (Composition API) |
| Frontend | Axios | Client HTTP pour consommer l'API |
| Frontend | Vite | Outil de build et serveur de développement |
| Données | Mémoire (Array JS) | Stockage des voyages et réservations en mémoire |

> Aucune base de données externe n'est requise. Les données sont chargées directement en mémoire au démarrage du serveur.

---

## Prérequis

Avant de lancer le projet, les éléments suivants doivent être installés sur la machine :

### 1. Node.js (obligatoire)
- Version recommandée : **LTS (v18 ou supérieure)**
- Téléchargement : https://nodejs.org/
- Vérification de l'installation :
```bash
node -v
npm -v
```

### 2. Visual Studio Code (recommandé)
- Téléchargement : https://code.visualstudio.com/
- Extensions recommandées :
  - `Volar` (support Vue.js)
  - `ESLint`

### 3. Un navigateur web récent
- Chrome, Firefox, Edge — n'importe lequel fait l'affaire

>  Aucun compte, aucune clé API externe, aucune base de données à configurer. Le projet fonctionne entièrement en local.

---

## Installation et lancement

### Étape 1 — Cloner ou télécharger le projet

```bash
git clone https://github.com/votre-utilisateur/voyage-app.git
cd voyage-app
```

Ou télécharger le ZIP depuis GitHub et l'extraire dans un dossier.

---

### Étape 2 — Installer et lancer le backend

Ouvrir un **premier terminal** dans VS Code (`Ctrl + J`) :

```bash
cd backend
npm install
npm start
```

 Si tout va bien, le terminal affiche :
```
Serveur démarré sur le port 5000
```

Le backend est accessible sur : http://localhost:5000

---

### Étape 3 — Installer et lancer le frontend

Ouvrir un **second terminal** dans VS Code (`+` en haut à droite du terminal) :

```bash
cd frontend
npm install
npm run dev
```

 Si tout va bien, le terminal affiche :
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

---

### Étape 4 — Ouvrir l'application

Ouvrir un navigateur web et aller sur :

```
http://localhost:3000
```

Le site est maintenant visible et fonctionnel. 

---

## Utilisation

### Naviguer dans le catalogue
Sur la page d'accueil, cliquer sur **"Voir les voyages"** pour accéder au catalogue.  
Utiliser les boutons de filtre (Plage, Ville, Montagne...) ou la barre de recherche pour trouver une destination.

### Voir le détail d'un voyage
Cliquer sur la carte d'un voyage pour accéder à sa page de détail avec les informations complètes.

### Faire une réservation
Depuis la page de détail, cliquer sur **"Réserver"**.  
Remplir le formulaire et valider. La réservation est enregistrée côté serveur et une confirmation s'affiche.

### Vérifier les réservations (côté serveur)
Les réservations reçues s'affichent directement dans le **terminal du backend** (Terminal 1).

---

## Structure du projet

```
voyage-app/
│
├── backend/
│   ├── package.json        → Dépendances backend (Express, CORS)
│   └── server.js           → Serveur Express + routes API + données des 30 voyages
│
└── frontend/
    ├── package.json        → Dépendances frontend (Vue, Axios, Vite)
    ├── vite.config.js      → Configuration Vite (proxy vers l'API)
    ├── index.html          → Point d'entrée HTML
    └── src/
        ├── main.js         → Initialisation de l'application Vue
        ├── App.vue         → Composant principal (toute l'interface)
        └── style.css       → Styles globaux
```

---

## Endpoints API (Backend)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/voyages` | Récupère la liste de tous les voyages |
| GET | `/api/voyages/:id` | Récupère un voyage par son identifiant |
| POST | `/api/reservations` | Enregistre une nouvelle réservation |

---

## Auteur

**Mohammad LIMBADA**  
BTS SIO SLAM — 2ème année  
 mohammad.limbada97494@gmail.com  


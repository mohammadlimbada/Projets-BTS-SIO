// ================================================
// FICHIER : server.js
// RÔLE    : Serveur backend de l'agence de voyage.
//           Node.js + Express.js + MySQL (mysql2).
//           API REST sur le port 5000.
// DÉMARRAGE : node server.js
// ================================================

// ---- Imports des dépendances ----
import express from 'express';        // Framework web pour créer le serveur HTTP et les routes
import cors from 'cors';              // Middleware qui autorise le frontend (port 3000) à appeler le backend (port 5000)
import mysql from 'mysql2/promise';   // Driver MySQL avec support des Promesses (async/await)
import * as dotenv from 'dotenv';     // Charge les variables d'environnement depuis le fichier .env
import bcrypt from 'bcryptjs';        // Librairie de hashage de mots de passe (algorithme bcrypt, irréversible)
import jwt from 'jsonwebtoken';       // Librairie pour créer et vérifier des tokens JWT (JSON Web Token)

// Charge les variables du fichier .env dans process.env
// Exemple : process.env.DB_HOST, process.env.JWT_SECRET
dotenv.config();

// Crée l'application Express — c'est l'objet principal du serveur
const app = express();

// Lit le port depuis .env, sinon utilise 5000 par défaut
const PORT = process.env.PORT || 5000;

// ================================================
// MIDDLEWARES GLOBAUX
// Un middleware est une fonction qui s'exécute sur CHAQUE requête,
// avant d'arriver dans la route. Ordre important : déclarés avant les routes.
// ================================================

// cors() : autorise les requêtes Cross-Origin (frontend sur :3000 → backend sur :5000)
// Sans ce middleware, le navigateur bloquerait toutes les requêtes Axios du frontend.
app.use(cors());

// Sert les fichiers statiques du frontend buildé (dist → public)
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(join(__dirname, 'public')));

// express.json() : parse automatiquement le body des requêtes au format JSON
// Permet d'accéder à req.body dans les routes POST (sinon req.body serait undefined)
app.use(express.json());

// ================================================
// CONNECTION POOL MYSQL
// Un "pool" est un ensemble de connexions réutilisables à la base de données.
// Plus efficace qu'ouvrir/fermer une connexion à chaque requête.
// ================================================
const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost', // Adresse du serveur MySQL
  port:               parseInt(process.env.DB_PORT || '3306'), // Port MySQL (3306 par défaut)
  user:               process.env.DB_USER     || 'root',      // Nom d'utilisateur MySQL
  password:           process.env.DB_PASSWORD || '',          // Mot de passe MySQL (vide = pas de mot de passe)
  database:           process.env.DB_NAME     || 'agence_voyage', // Nom de la base de données
  waitForConnections: true,   // Met en file d'attente si toutes les connexions sont occupées
  connectionLimit:    10,     // Maximum 10 connexions simultanées dans le pool
  queueLimit:         0       // 0 = pas de limite sur la file d'attente
});

// Test de connexion au démarrage du serveur
// getConnection() emprunte une connexion du pool pour vérifier qu'elle fonctionne
pool.getConnection()
  .then(conn => {
    console.log('✅ Connexion MySQL OK — base agence_voyage accessible');
    conn.release(); // IMPORTANT : libère la connexion pour qu'elle retourne dans le pool
  })
  .catch(err => {
    console.error('❌ ERREUR connexion MySQL :', err.message);
    console.error('→ Vérifie que MySQL est démarré et que la base agence_voyage existe.');
  });

// ================================================
// HELPER : parse le champ inclus (JSON → tableau JS)
// mysql2 retourne parfois la colonne JSON en string selon la version du driver.
// Ce helper garantit que voyage.inclus est toujours un tableau JavaScript,
// que le driver l'ait déjà converti ou non.
// ================================================
function parseInclus(voyage) {
  // typeof voyage.inclus === 'string' : le driver n'a pas converti automatiquement
  if (voyage && typeof voyage.inclus === 'string') {
    voyage.inclus = JSON.parse(voyage.inclus); // Convertit la string JSON en tableau JS
  }
  return voyage; // Retourne le voyage (avec inclus maintenant garanti en tableau)
}

// ================================================
// MIDDLEWARES D'AUTHENTIFICATION JWT
// Ces middlewares protègent certaines routes.
// Ils s'utilisent comme paramètres dans la définition de route :
//   app.post('/route', verifierToken, verifierAdmin, handler)
// ================================================

// ---- verifierToken ----
// Vérifie que le header "Authorization: Bearer <token>" est présent et valide.
// Si valide, décode le token et stocke les infos dans req.utilisateur.
// Si invalide ou absent, répond directement avec 401 ou 403 (sans appeler next()).
const verifierToken = (req, res, next) => {
  // req.headers['authorization'] contient le header complet, ex: "Bearer eyJhbGciO..."
  const authHeader = req.headers['authorization'];

  // split(' ')[1] : découpe sur l'espace et prend la 2e partie = le token seul
  // Le && court-circuite : si authHeader est undefined, token = undefined
  const token = authHeader && authHeader.split(' ')[1];

  // Aucun token fourni → 401 Unauthorized (non authentifié)
  if (!token) {
    return res.status(401).json({ message: 'Accès refusé : token manquant' });
  }

  try {
    // jwt.verify() : décode ET valide la signature du token avec le secret
    // Si la signature ne correspond pas ou le token est expiré → lance une exception
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Stocke le payload décodé sur req pour que les middlewares suivants y accèdent
    // Structure : { id, email, role, iat (émis à), exp (expire à) }
    req.utilisateur = decoded;

    next(); // Passe au middleware ou à la route suivante
  } catch (err) {
    // Token falsifié ou expiré → 403 Forbidden (authentifié mais token invalide)
    return res.status(403).json({ message: 'Token invalide ou expiré' });
  }
};

// ---- verifierAdmin ----
// À utiliser APRÈS verifierToken (req.utilisateur doit déjà exister).
// Vérifie que le rôle de l'utilisateur est 'admin'.
// Empêche un utilisateur normal d'accéder aux routes d'administration.
const verifierAdmin = (req, res, next) => {
  if (req.utilisateur.role !== 'admin') {
    // L'utilisateur est connecté mais n'a pas le droit → 403 Forbidden
    return res.status(403).json({ message: 'Accès réservé à l\'administrateur' });
  }
  next(); // L'utilisateur est bien admin : on continue vers le handler de la route
};

// ================================================
// ROUTES API
// Chaque route suit le format : app.METHODE('/chemin', handler)
// Le handler reçoit (req = requête, res = réponse) et retourne une réponse JSON.
// ================================================

// ------------------------------------------------
// POST /api/auth/register
// Inscrit un nouvel utilisateur.
// Corps JSON attendu : { nom, prenom, email, mot_de_passe }
// Retourne : { success, message, token, utilisateur }
// ------------------------------------------------
app.post('/api/auth/register', async (req, res) => {
  // Déstructuration : extrait les champs du corps de la requête
  const { nom, prenom, email, mot_de_passe } = req.body;

  // Validation 1 : tous les champs obligatoires doivent être présents
  if (!nom || !prenom || !email || !mot_de_passe) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  // Validation 2 : format email (regex simple mais efficace)
  // ^ = début, [^\s@]+ = au moins 1 caractère ni espace ni @, etc.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Email invalide' });
  }

  // Validation 3 : mot de passe d'au moins 6 caractères
  if (mot_de_passe.length < 6) {
    return res.status(400).json({ message: 'Mot de passe trop court (6 caractères minimum)' });
  }

  try {
    // Vérifie si cet email est déjà enregistré dans la base
    // On normalise l'email en minuscules pour éviter les doublons (ex: "Jean@" et "jean@")
    const [existant] = await pool.execute(
      'SELECT id FROM utilisateurs WHERE email = ?',
      [email.toLowerCase().trim()]
    );
    if (existant.length > 0) {
      // 409 Conflict : ressource déjà existante
      return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    }

    // bcrypt.hash(mot_de_passe, 12) :
    // - Calcule un hash sécurisé et IRRÉVERSIBLE du mot de passe
    // - Le "12" est le "cost factor" (nombre de rounds) : plus élevé = plus sécurisé mais plus lent
    // - 12 rounds est un bon équilibre (~250ms de calcul) — on ne stocke JAMAIS le mot de passe en clair
    const hash = await bcrypt.hash(mot_de_passe, 12);

    // Date de création pour horodater l'inscription
    const now = new Date();

    // INSERT dans la table utilisateurs avec le rôle 'user' par défaut
    // On insère le hash bcrypt, pas le mot de passe brut
    const [result] = await pool.execute(
      `INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, dateCreation)
       VALUES (?, ?, ?, ?, 'user', ?)`,
      [nom.trim(), prenom.trim(), email.toLowerCase().trim(), hash, now]
    );

    // jwt.sign(payload, secret, options) : crée un token JWT signé
    // - payload : les données encodées dans le token ({ id, email, role })
    // - process.env.JWT_SECRET : clé secrète pour signer — seul le serveur la connaît
    // - expiresIn : durée de validité (ici 7 jours d'après .env)
    const token = jwt.sign(
      { id: result.insertId, email: email.toLowerCase().trim(), role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    console.log(`✅ NOUVEL UTILISATEUR : ${prenom} ${nom} (${email})`);

    // 201 Created : ressource créée avec succès
    // On retourne le token directement pour que le frontend connecte l'utilisateur après inscription
    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès !',
      token,                    // Le frontend stocke ce token dans localStorage
      utilisateur: {
        id: result.insertId,    // result.insertId = id auto-incrémenté par MySQL
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.toLowerCase().trim(),
        role: 'user'            // Rôle par défaut : utilisateur normal
      }
    });
  } catch (err) {
    console.error('❌ Erreur POST /api/auth/register :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ------------------------------------------------
// POST /api/auth/login
// Connecte un utilisateur existant (utilisateur OU admin).
// Corps JSON attendu : { email, mot_de_passe }
// Retourne : { success, message, token, utilisateur }
// ------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  const { email, mot_de_passe } = req.body;

  // Validation basique : les deux champs sont obligatoires
  if (!email || !mot_de_passe) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }

  try {
    // Cherche l'utilisateur par email (normalisé en minuscules)
    // On sélectionne mot_de_passe pour pouvoir le comparer avec bcrypt
    const [rows] = await pool.execute(
      'SELECT id, nom, prenom, email, mot_de_passe, role FROM utilisateurs WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    // SÉCURITÉ : message volontairement vague ("Email ou mot de passe incorrect")
    // Si on disait "Email introuvable", un attaquant pourrait deviner quels emails sont enregistrés
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const utilisateur = rows[0]; // L'utilisateur trouvé en base

    // bcrypt.compare(saisi, hashEnBase) :
    // - Compare le mot de passe saisi avec le hash stocké en DB
    // - Retourne true si ça correspond, false sinon
    // - bcrypt gère automatiquement le sel (salt) intégré dans le hash
    const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' }); // Même message vague
    }

    // Génère un nouveau token JWT avec les infos de l'utilisateur
    // Le rôle est encodé dans le token → le frontend sait si c'est un admin sans appel supplémentaire
    const token = jwt.sign(
      { id: utilisateur.id, email: utilisateur.email, role: utilisateur.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    console.log(`✅ CONNEXION : ${utilisateur.prenom} ${utilisateur.nom} (rôle: ${utilisateur.role})`);

    // 200 OK (res.json sans .status() = 200 par défaut)
    // On NE retourne PAS le mot_de_passe hashé (on envoie seulement les infos non-sensibles)
    res.json({
      success: true,
      message: 'Connexion réussie !',
      token,
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role   // 'user' ou 'admin' → le frontend adapte l'interface
      }
    });
  } catch (err) {
    console.error('❌ Erreur POST /api/auth/login :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ------------------------------------------------
// GET /api/auth/me
// Route protégée par verifierToken.
// Vérifie un token existant et retourne l'utilisateur correspondant.
// Utilisé au rechargement de la page : le frontend lit le token dans localStorage,
// appelle cette route pour vérifier qu'il est encore valide, et restaure la session.
// ------------------------------------------------
app.get('/api/auth/me', verifierToken, async (req, res) => {
  try {
    // req.utilisateur.id a été rempli par le middleware verifierToken (payload du JWT)
    // On relit depuis la DB pour avoir les données les plus récentes (ex: si le rôle a changé)
    const [rows] = await pool.execute(
      'SELECT id, nom, prenom, email, role FROM utilisateurs WHERE id = ?',
      [req.utilisateur.id] // L'id vient du token décodé, pas du body
    );
    if (rows.length === 0) {
      // Le token est valide mais l'utilisateur a été supprimé depuis → 404
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }
    res.json({ utilisateur: rows[0] }); // Retourne les infos fraîches depuis la DB
  } catch (err) {
    console.error('❌ Erreur GET /api/auth/me :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ------------------------------------------------
// GET /api/voyages
// Retourne la liste des voyages avec filtres optionnels.
// Paramètres de requête optionnels : ?categorie=plage  ?recherche=bali
// ------------------------------------------------
app.get('/api/voyages', async (req, res) => {
  try {
    const { categorie, recherche } = req.query; // Paramètres de l'URL après le ?

    // Construction dynamique de la requête SQL avec des filtres optionnels.
    // COALESCE(x, 0) : retourne x si non null, sinon 0 (voyages sans avis = note 0)
    // ROUND(x, 1)    : arrondit à 1 décimale (ex: 4.333... → 4.3)
    // AVG(note)      : moyenne de la colonne note dans la table avis pour ce voyage
    // Sous-requête corrélée : calculée pour chaque ligne de voyages (v.id change à chaque ligne)
    let sql = `SELECT v.id, v.titre, v.destination, v.description, v.prix, v.duree,
      v.dateDepart, v.dateRetour, v.image, v.video, v.placesDisponibles, v.categorie, v.inclus,
      COALESCE(ROUND((SELECT AVG(note) FROM avis WHERE voyageId = v.id), 1), 0) AS noteGlobale
      FROM voyages v WHERE 1=1`;
    // WHERE 1=1 : toujours vrai — facilite l'ajout de conditions avec "AND" sans cas spéciaux

    const params = []; // Tableau des paramètres pour les placeholders ?

    if (categorie && categorie !== 'tous') {
      sql += ' AND v.categorie = ?'; // Ajoute le filtre catégorie
      params.push(categorie);
    }

    if (recherche) {
      // LIKE %terme% : cherche le terme n'importe où dans le champ (avant ET après)
      // OR : la recherche s'applique sur le titre, la destination ET la description
      sql += ' AND (v.titre LIKE ? OR v.destination LIKE ? OR v.description LIKE ?)';
      const terme = `%${recherche}%`; // Encadre le terme avec des % pour LIKE
      params.push(terme, terme, terme); // Le même terme est utilisé 3 fois (pour les 3 champs)
    }

    const [rows] = await pool.execute(sql, params); // Exécute la requête avec les paramètres
    res.json(rows.map(parseInclus)); // map() applique parseInclus à chaque voyage du tableau
  } catch (err) {
    console.error('Erreur GET /api/voyages :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ------------------------------------------------
// GET /api/voyages/:id
// Retourne un seul voyage par son identifiant.
// :id est un paramètre d'URL dynamique (ex: /api/voyages/5)
// ------------------------------------------------
app.get('/api/voyages/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      // Même calcul noteGlobale que dans GET /api/voyages
      // Filtre par id : WHERE v.id = ? avec parseInt pour s'assurer que c'est un entier
      `SELECT v.id, v.titre, v.destination, v.description, v.prix, v.duree,
        v.dateDepart, v.dateRetour, v.image, v.video, v.placesDisponibles, v.categorie, v.inclus,
        COALESCE(ROUND((SELECT AVG(note) FROM avis WHERE voyageId = v.id), 1), 0) AS noteGlobale
        FROM voyages v WHERE v.id = ?`,
      [parseInt(req.params.id)] // req.params.id est une string, parseInt la convertit en nombre
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Voyage non trouvé' }); // 404 = ressource inexistante
    }
    res.json(parseInclus(rows[0])); // rows[0] = premier (et seul) résultat de la requête
  } catch (err) {
    console.error('Erreur GET /api/voyages/:id :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ------------------------------------------------
// POST /api/voyages
// Route protégée : admin uniquement (verifierToken + verifierAdmin).
// Ajoute un nouveau voyage au catalogue.
// Corps JSON attendu : tous les champs de la table voyages
// ------------------------------------------------
app.post('/api/voyages', verifierToken, verifierAdmin, async (req, res) => {
  // Déstructuration de tous les champs attendus dans le body
  const {
    titre, destination, description, prix, duree,
    dateDepart, dateRetour, image, video,
    placesDisponibles, categorie, inclus
  } = req.body;

  // Validation : tous les champs obligatoires doivent être remplis
  // (video est optionnel, inclus peut être vide)
  if (!titre || !destination || !description || !prix || !duree ||
      !dateDepart || !dateRetour || !image || !placesDisponibles || !categorie) {
    return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis' });
  }

  // Validation de la catégorie : doit être une des 5 valeurs de l'ENUM MySQL
  // .includes() vérifie si la valeur est dans le tableau
  const categoriesValides = ['plage', 'ville', 'montagne', 'aventure', 'culturel'];
  if (!categoriesValides.includes(categorie)) {
    return res.status(400).json({ message: 'Catégorie invalide' });
  }

  try {
    // Array.isArray(inclus) : vérifie si inclus est bien un tableau (envoyé depuis le formulaire)
    // Si le frontend envoie autre chose (null, string...), on utilise un tableau vide par sécurité
    const inclusArray = Array.isArray(inclus) ? inclus : [];

    const [result] = await pool.execute(
      `INSERT INTO voyages
         (titre, destination, description, prix, duree,
          dateDepart, dateRetour, image, video,
          placesDisponibles, categorie, inclus, noteGlobale)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.0)`,
      [
        titre.trim(),                          // trim() supprime les espaces en début/fin
        destination.trim(),
        description.trim(),
        parseFloat(prix),                      // parseFloat : string → nombre décimal (ex: "1200" → 1200)
        parseInt(duree),                       // parseInt : string → entier (ex: "7" → 7)
        dateDepart,                            // Format "YYYY-MM-DD" (déjà correct depuis l'input date)
        dateRetour,
        image.trim(),
        video ? video.trim() : '',             // Opérateur ternaire : si video fourni → trim, sinon chaîne vide
        parseInt(placesDisponibles),
        categorie,
        JSON.stringify(inclusArray)            // Convertit le tableau JS en string JSON pour la colonne JSON de MySQL
      ]
    );

    // Recharge le voyage depuis la DB pour retourner les données officielles (avec noteGlobale = 0)
    // result.insertId = l'id auto-incrémenté que MySQL a attribué au nouveau voyage
    const [rows] = await pool.execute(
      `SELECT v.id, v.titre, v.destination, v.description, v.prix, v.duree,
        v.dateDepart, v.dateRetour, v.image, v.video, v.placesDisponibles, v.categorie, v.inclus,
        0 AS noteGlobale FROM voyages v WHERE v.id = ?`,
      [result.insertId]
    );

    const nouveauVoyage = parseInclus(rows[0]); // Convertit inclus de JSON string vers tableau JS
    console.log(`✅ ADMIN : nouveau voyage créé — "${titre}" (id: ${result.insertId})`);

    res.status(201).json({ // 201 Created : nouvelle ressource créée
      success: true,
      message: `Voyage "${titre}" ajouté avec succès !`,
      voyage: nouveauVoyage // Retourne le voyage complet pour que le frontend puisse l'afficher
    });
  } catch (err) {
    console.error('❌ Erreur POST /api/voyages :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ------------------------------------------------
// GET /api/avis/stats
// IMPORTANT : déclarée AVANT /api/avis/:id pour éviter
//             qu'Express interprète "stats" comme un id numérique.
// Retourne le nombre d'avis par voyage : { "1": 3, "2": 5, ... }
// ------------------------------------------------
app.get('/api/avis/stats', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      // GROUP BY voyageId : regroupe les avis par voyage
      // COUNT(*) : compte le nombre de lignes dans chaque groupe
      'SELECT voyageId, COUNT(*) AS count FROM avis GROUP BY voyageId'
    );
    const stats = {}; // Objet vide qui va recevoir { voyageId: count }
    rows.forEach(row => {
      stats[row.voyageId] = row.count; // Ex: stats[5] = 3 (le voyage #5 a 3 avis)
    });
    res.json(stats); // Retourne l'objet : { "1": 2, "5": 3, ... }
  } catch (err) {
    console.error('Erreur GET /api/avis/stats :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ------------------------------------------------
// GET /api/avis
// ?voyageId=X → tous les avis du voyage X, triés du plus récent au plus ancien
// (aucun paramètre) → les 6 avis les plus récents (pour la page d'accueil)
// ------------------------------------------------
app.get('/api/avis', async (req, res) => {
  try {
    if (req.query.voyageId) {
      const voyageId = parseInt(req.query.voyageId); // Convertit en entier pour la sécurité SQL
      const [rows] = await pool.execute(
        'SELECT * FROM avis WHERE voyageId = ? ORDER BY date DESC', // DESC = du plus récent au plus ancien
        [voyageId]
      );
      return res.json(rows); // return empêche d'exécuter le code du cas sans paramètre
    }

    // Sans paramètre : 6 derniers avis toutes destinations confondues
    // Utilisé sur la page d'accueil pour montrer des témoignages récents
    const [rows] = await pool.execute(
      'SELECT * FROM avis ORDER BY date DESC LIMIT 6' // LIMIT 6 = maximum 6 résultats
    );
    res.json(rows);
  } catch (err) {
    console.error('Erreur GET /api/avis :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ------------------------------------------------
// POST /api/avis
// Soumet un nouvel avis pour un voyage.
// Corps attendu : { voyageId, auteur, note (1-5), texte }
// ------------------------------------------------
app.post('/api/avis', async (req, res) => {
  const { voyageId, auteur, note, texte } = req.body;

  // Validation des champs obligatoires
  if (!auteur || !texte || !voyageId) {
    return res.status(400).json({ message: 'auteur, texte et voyageId sont requis' });
  }

  // parseInt(note) : la note arrive en string depuis le formulaire, on la convertit
  const noteNum = parseInt(note);
  // isNaN(noteNum) : vérifie que la conversion a réussi (parseInt("abc") = NaN)
  // noteNum < 1 || noteNum > 5 : la note doit être entre 1 et 5 étoiles
  if (isNaN(noteNum) || noteNum < 1 || noteNum > 5) {
    return res.status(400).json({ message: 'La note doit être entre 1 et 5' });
  }

  try {
    const now = new Date(); // Horodatage exact de l'avis
    const [result] = await pool.execute(
      'INSERT INTO avis (voyageId, auteur, note, texte, date) VALUES (?, ?, ?, ?, ?)',
      [parseInt(voyageId), auteur.trim(), noteNum, texte.trim(), now]
    );

    // Construit l'objet avis à retourner sans refaire une requête SELECT
    const nouvelAvis = {
      id:       result.insertId,      // Id généré par MySQL
      voyageId: parseInt(voyageId),
      auteur:   auteur.trim(),
      note:     noteNum,
      texte:    texte.trim(),
      date:     now.toISOString()     // Format ISO 8601 standard pour les dates
    };

    console.log(`NOUVEL AVIS : ${auteur} - ${noteNum}/5 pour voyage #${voyageId}`);
    res.status(201).json(nouvelAvis); // 201 Created
  } catch (err) {
    console.error('Erreur POST /api/avis :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ------------------------------------------------
// POST /api/reservations
// Crée une nouvelle réservation avec le statut 'en_attente_paiement'.
// Corps : infos du formulaire + voyageId, titre, prix + utilisateurId (optionnel)
// ------------------------------------------------
app.post('/api/reservations', async (req, res) => {
  try {
    const now = new Date(); // Date de création de la réservation
    const {
      voyageId,
      utilisateurId, // Optionnel : l'id de l'utilisateur connecté (null si non connecté)
      nom, prenom, email, telephone,
      dateDepart, dateRetour, nombrePersonnes, commentaires,
      titre, destination, prix // Dénormalisés : copiés depuis le voyage pour l'historique
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO reservations
         (voyageId, utilisateurId, nom, prenom, email, telephone,
          dateDepart, dateRetour, nombrePersonnes, commentaires,
          titre, destination, prix, dateReservation, statut)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'en_attente_paiement')`,
      // 'en_attente_paiement' : statut initial, passera à 'confirmée' après le paiement
      [
        voyageId,
        utilisateurId || null,  // Si utilisateurId est undefined/null/0 → null en DB (pas de compte lié)
        nom, prenom, email,
        telephone || '',        // Si pas de téléphone fourni → chaîne vide (champ optionnel)
        dateDepart, dateRetour, nombrePersonnes,
        commentaires || '',     // Si pas de commentaire → chaîne vide
        titre,
        destination || '',      // Destination dénormalisée pour garder l'historique même si le voyage change
        prix,
        now
      ]
    );

    // Construit l'objet réservation à retourner
    // ...req.body : copie tous les champs du body (spread operator)
    const reservation = {
      id: result.insertId,    // Id auto-incrémenté par MySQL
      ...req.body,            // Recopie tous les champs envoyés par le frontend
      dateReservation: now,   // Écrase/ajoute la date de réservation (calculée côté serveur)
      statut: 'en_attente_paiement' // Écrase le statut avec la valeur initiale officielle
    };

    console.log('NOUVELLE RESERVATION (en attente de paiement)');
    console.log(`Voyage : ${titre}`);
    console.log(`Client : ${nom} ${prenom}`);
    console.log(`Prix total : ${prix * nombrePersonnes}€`); // Prix x nombre de personnes

    res.status(201).json({
      success: true,
      message: 'Réservation créée, en attente de paiement.',
      reservation // L'objet complet pour que le frontend affiche la page paiement
    });
  } catch (err) {
    console.error('Erreur POST /api/reservations :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ------------------------------------------------
// POST /api/paiement
// Simule la confirmation du paiement d'une réservation.
// Corps : { reservationId }
// (Pas de vrai traitement bancaire — c'est une simulation pédagogique)
// ------------------------------------------------
app.post('/api/paiement', async (req, res) => {
  const { reservationId } = req.body;

  try {
    // Vérifie que la réservation existe avant de la confirmer
    const [rows] = await pool.execute(
      'SELECT * FROM reservations WHERE id = ?',
      [parseInt(reservationId)]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Réservation introuvable' });
    }

    // Met à jour le statut de 'en_attente_paiement' → 'confirmée'
    // C'est la seule modification : le paiement est simulé, pas réel
    await pool.execute(
      "UPDATE reservations SET statut = 'confirmée' WHERE id = ?",
      [parseInt(reservationId)]
    );

    // Construit la réservation mise à jour en mémoire (sans refaire SELECT)
    // ...rows[0] : copie toutes les colonnes de la réservation depuis la DB
    // statut : 'confirmée' écrase l'ancien statut 'en_attente_paiement'
    const reservation = { ...rows[0], statut: 'confirmée' };

    console.log('PAIEMENT CONFIRME !');
    console.log(`Réservation #${reservationId} — ${reservation.titre}`);
    console.log(`Client : ${reservation.nom} ${reservation.prenom}`);
    console.log(`Montant : ${reservation.prix * reservation.nombrePersonnes}€`);

    res.status(200).json({ success: true, message: 'Paiement confirmé !', reservation });
  } catch (err) {
    console.error('Erreur POST /api/paiement :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ------------------------------------------------
// POST /api/contact
// Enregistre un message de contact en base de données.
// Corps : { nom, email, telephone, sujet, message }
// ------------------------------------------------
app.post('/api/contact', async (req, res) => {
  const { nom, email, telephone, sujet, message } = req.body;

  // Validation des champs obligatoires (téléphone et sujet sont optionnels)
  if (!nom || !email || !message) {
    return res.status(400).json({ message: 'Nom, email et message sont requis' });
  }

  try {
    const now = new Date();
    // Si aucun sujet fourni, utilise "Question générale" comme valeur par défaut
    const sujetFinal = sujet || 'Question générale';

    await pool.execute(
      'INSERT INTO messages (nom, email, telephone, sujet, message, date) VALUES (?, ?, ?, ?, ?, ?)',
      [
        nom.trim(),
        email.trim(),
        telephone ? telephone.trim() : '', // Opérateur ternaire : si téléphone fourni → trim, sinon ''
        sujetFinal,
        message.trim(),
        now
      ]
    );

    console.log('NOUVEAU MESSAGE CONTACT !');
    console.log(`De : ${nom} (${email})`);
    console.log(`Sujet : ${sujetFinal}`);

    res.status(201).json({ success: true, message: 'Message envoyé avec succès !' });
  } catch (err) {
    console.error('Erreur POST /api/contact :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Catch-all : renvoie index.html pour que Vue Router gère les routes côté client
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// ================================================
// DÉMARRAGE DU SERVEUR
// app.listen(PORT, callback) : démarre le serveur sur le port défini
// Le callback est exécuté une fois que le serveur est prêt à recevoir des requêtes
// ================================================
app.listen(PORT, () => {
  console.log(`Backend démarré sur http://localhost:${PORT}`);
});

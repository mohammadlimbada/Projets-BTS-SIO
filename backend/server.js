// ================================================
// FICHIER : server.js
// RÔLE    : Serveur backend de l'agence de voyage.
//           Node.js + Express.js + MySQL (mysql2).
//           API REST sur le port 5000.
// DÉMARRAGE : node server.js
// ================================================

import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

// Charge les variables d'environnement depuis .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ================================================
// MIDDLEWARES
// ================================================
app.use(cors());
app.use(express.json());

// ================================================
// CONNECTION POOL MYSQL
// ================================================
const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT || '3306'),
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'agence_voyage',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0
});

// Test de connexion au démarrage
pool.getConnection()
  .then(conn => {
    console.log('✅ Connexion MySQL OK — base agence_voyage accessible');
    conn.release();
  })
  .catch(err => {
    console.error('❌ ERREUR connexion MySQL :', err.message);
    console.error('→ Vérifie que MySQL est démarré et que la base agence_voyage existe.');
  });

// ================================================
// HELPER : parse le champ inclus (JSON → tableau JS)
// mysql2 retourne parfois la colonne JSON en string
// selon la version du driver — ce helper garantit
// la compatibilité dans tous les cas.
// ================================================
function parseInclus(voyage) {
  if (voyage && typeof voyage.inclus === 'string') {
    voyage.inclus = JSON.parse(voyage.inclus);
  }
  return voyage;
}

// ================================================
// ROUTES API
// ================================================

// ------------------------------------------------
// GET /api/voyages
// Paramètres optionnels : ?categorie=plage  ?recherche=bali
// ------------------------------------------------
app.get('/api/voyages', async (req, res) => {
  try {
    const { categorie, recherche } = req.query;

    let sql = `SELECT v.id, v.titre, v.destination, v.description, v.prix, v.duree,
      v.dateDepart, v.dateRetour, v.image, v.video, v.placesDisponibles, v.categorie, v.inclus,
      COALESCE(ROUND((SELECT AVG(note) FROM avis WHERE voyageId = v.id), 1), 0) AS noteGlobale
      FROM voyages v WHERE 1=1`;
    const params = [];

    if (categorie && categorie !== 'tous') {
      sql += ' AND v.categorie = ?';
      params.push(categorie);
    }

    if (recherche) {
      sql += ' AND (v.titre LIKE ? OR v.destination LIKE ? OR v.description LIKE ?)';
      const terme = `%${recherche}%`;
      params.push(terme, terme, terme);
    }

    const [rows] = await pool.execute(sql, params);
    res.json(rows.map(parseInclus));
  } catch (err) {
    console.error('Erreur GET /api/voyages :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ------------------------------------------------
// GET /api/voyages/:id
// ------------------------------------------------
app.get('/api/voyages/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT v.id, v.titre, v.destination, v.description, v.prix, v.duree,
        v.dateDepart, v.dateRetour, v.image, v.video, v.placesDisponibles, v.categorie, v.inclus,
        COALESCE(ROUND((SELECT AVG(note) FROM avis WHERE voyageId = v.id), 1), 0) AS noteGlobale
        FROM voyages v WHERE v.id = ?`,
      [parseInt(req.params.id)]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Voyage non trouvé' });
    }
    res.json(parseInclus(rows[0]));
  } catch (err) {
    console.error('Erreur GET /api/voyages/:id :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ------------------------------------------------
// GET /api/avis/stats
// IMPORTANT : déclarée AVANT /api/avis pour éviter
//             qu'Express interprète "stats" comme un id.
// Retourne { "1": 3, "2": 5, ... }
// ------------------------------------------------
app.get('/api/avis/stats', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT voyageId, COUNT(*) AS count FROM avis GROUP BY voyageId'
    );
    const stats = {};
    rows.forEach(row => {
      stats[row.voyageId] = row.count;
    });
    res.json(stats);
  } catch (err) {
    console.error('Erreur GET /api/avis/stats :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ------------------------------------------------
// GET /api/avis
// ?voyageId=X → tous les avis de ce voyage, tri date DESC
// (aucun param) → 6 avis les plus récents
// ------------------------------------------------
app.get('/api/avis', async (req, res) => {
  try {
    if (req.query.voyageId) {
      const voyageId = parseInt(req.query.voyageId);
      const [rows] = await pool.execute(
        'SELECT * FROM avis WHERE voyageId = ? ORDER BY date DESC',
        [voyageId]
      );
      return res.json(rows);
    }

    const [rows] = await pool.execute(
      'SELECT * FROM avis ORDER BY date DESC LIMIT 6'
    );
    res.json(rows);
  } catch (err) {
    console.error('Erreur GET /api/avis :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ------------------------------------------------
// POST /api/avis
// Corps attendu : { voyageId, auteur, note, texte }
// ------------------------------------------------
app.post('/api/avis', async (req, res) => {
  const { voyageId, auteur, note, texte } = req.body;

  if (!auteur || !texte || !voyageId) {
    return res.status(400).json({ message: 'auteur, texte et voyageId sont requis' });
  }

  const noteNum = parseInt(note);
  if (isNaN(noteNum) || noteNum < 1 || noteNum > 5) {
    return res.status(400).json({ message: 'La note doit être entre 1 et 5' });
  }

  try {
    const now = new Date();
    const [result] = await pool.execute(
      'INSERT INTO avis (voyageId, auteur, note, texte, date) VALUES (?, ?, ?, ?, ?)',
      [parseInt(voyageId), auteur.trim(), noteNum, texte.trim(), now]
    );

    const nouvelAvis = {
      id:       result.insertId,
      voyageId: parseInt(voyageId),
      auteur:   auteur.trim(),
      note:     noteNum,
      texte:    texte.trim(),
      date:     now.toISOString()
    };

    console.log(`NOUVEL AVIS : ${auteur} - ${noteNum}/5 pour voyage #${voyageId}`);
    res.status(201).json(nouvelAvis);
  } catch (err) {
    console.error('Erreur POST /api/avis :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ------------------------------------------------
// POST /api/reservations
// Corps : infos du formulaire + voyageId, titre, prix
// ------------------------------------------------
app.post('/api/reservations', async (req, res) => {
  try {
    const now = new Date();
    const {
      voyageId, nom, prenom, email, telephone,
      dateDepart, dateRetour, nombrePersonnes, commentaires,
      titre, destination, prix
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO reservations
         (voyageId, nom, prenom, email, telephone,
          dateDepart, dateRetour, nombrePersonnes, commentaires,
          titre, destination, prix, dateReservation, statut)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'en_attente_paiement')`,
      [
        voyageId, nom, prenom, email, telephone || '',
        dateDepart, dateRetour, nombrePersonnes, commentaires || '',
        titre, destination || '', prix, now
      ]
    );

    const reservation = {
      id: result.insertId,
      ...req.body,
      dateReservation: now,
      statut: 'en_attente_paiement'
    };

    console.log('NOUVELLE RESERVATION (en attente de paiement)');
    console.log(`Voyage : ${titre}`);
    console.log(`Client : ${nom} ${prenom}`);
    console.log(`Prix total : ${prix * nombrePersonnes}€`);

    res.status(201).json({
      success:     true,
      message:     'Réservation créée, en attente de paiement.',
      reservation
    });
  } catch (err) {
    console.error('Erreur POST /api/reservations :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ------------------------------------------------
// POST /api/paiement
// Corps : { reservationId }
// ------------------------------------------------
app.post('/api/paiement', async (req, res) => {
  const { reservationId } = req.body;

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM reservations WHERE id = ?',
      [parseInt(reservationId)]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Réservation introuvable' });
    }

    await pool.execute(
      "UPDATE reservations SET statut = 'confirmée' WHERE id = ?",
      [parseInt(reservationId)]
    );

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
// Corps : { nom, email, telephone, sujet, message }
// ------------------------------------------------
app.post('/api/contact', async (req, res) => {
  const { nom, email, telephone, sujet, message } = req.body;

  if (!nom || !email || !message) {
    return res.status(400).json({ message: 'Nom, email et message sont requis' });
  }

  try {
    const now = new Date();
    const sujetFinal = sujet || 'Question générale';

    await pool.execute(
      'INSERT INTO messages (nom, email, telephone, sujet, message, date) VALUES (?, ?, ?, ?, ?, ?)',
      [nom.trim(), email.trim(), telephone ? telephone.trim() : '', sujetFinal, message.trim(), now]
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

// ================================================
// DÉMARRAGE DU SERVEUR
// ================================================
app.listen(PORT, () => {
  console.log(`Backend démarré sur http://localhost:${PORT}`);
});

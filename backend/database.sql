-- ================================================
-- BASE DE DONNÉES : agence_voyage
-- Exécuter une seule fois : mysql -u root -p < database.sql
-- ================================================

CREATE DATABASE IF NOT EXISTS agence_voyage
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE agence_voyage;

-- ------------------------------------------------
-- TABLE : voyages
-- inclus stocké en JSON (MySQL 5.7.8+)
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS voyages (
  id                INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  titre             VARCHAR(255)      NOT NULL,
  destination       VARCHAR(255)      NOT NULL,
  description       TEXT              NOT NULL,
  prix              DECIMAL(10,2)     NOT NULL,
  duree             TINYINT UNSIGNED  NOT NULL,
  dateDepart        DATE              NOT NULL,
  dateRetour        DATE              NOT NULL,
  image             VARCHAR(512)      NOT NULL DEFAULT '',
  video             VARCHAR(512)      NOT NULL DEFAULT '',
  placesDisponibles SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  categorie         ENUM('plage','ville','montagne','aventure','culturel') NOT NULL,
  inclus            JSON              NOT NULL,
  noteGlobale       DECIMAL(3,1)      NOT NULL DEFAULT 0.0,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------
-- TABLE : avis
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS avis (
  id        INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  voyageId  INT UNSIGNED     NOT NULL,
  auteur    VARCHAR(255)     NOT NULL,
  note      TINYINT UNSIGNED NOT NULL,
  texte     TEXT             NOT NULL,
  date      DATETIME(3)      NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_avis_voyageId (voyageId),
  INDEX idx_avis_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------
-- TABLE : reservations
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS reservations (
  id              INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  voyageId        INT UNSIGNED      NOT NULL,
  nom             VARCHAR(255)      NOT NULL,
  prenom          VARCHAR(255)      NOT NULL,
  email           VARCHAR(255)      NOT NULL,
  telephone       VARCHAR(50)       NOT NULL DEFAULT '',
  dateDepart      DATE              NOT NULL,
  dateRetour      DATE              NOT NULL,
  nombrePersonnes TINYINT UNSIGNED  NOT NULL DEFAULT 1,
  commentaires    TEXT,
  titre           VARCHAR(255)      NOT NULL,
  destination     VARCHAR(255)      NOT NULL DEFAULT '',
  prix            DECIMAL(10,2)     NOT NULL,
  dateReservation DATETIME(3)       NOT NULL,
  statut          VARCHAR(50)       NOT NULL DEFAULT 'en_attente_paiement',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------
-- TABLE : messages
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
  id        INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nom       VARCHAR(255)  NOT NULL,
  email     VARCHAR(255)  NOT NULL,
  telephone VARCHAR(50)   NOT NULL DEFAULT '',
  sujet     VARCHAR(255)  NOT NULL DEFAULT 'Question générale',
  message   TEXT          NOT NULL,
  date      DATETIME(3)   NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- DONNÉES : 30 voyages
-- ================================================
INSERT INTO voyages (id, titre, destination, description, prix, duree, dateDepart, dateRetour, image, video, placesDisponibles, categorie, inclus, noteGlobale) VALUES
(1,  'Maldives Paradisiaques', 'Maldives', 'Plages de sable blanc, eaux turquoise cristallines et complexes luxueux sur pilotis', 1200, 7, '2024-07-01', '2024-07-08', 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800', '', 20, 'plage', '["Vol aller-retour","Hôtel 5* sur pilotis","Pension complète","Activités nautiques"]', 4.9),
(2,  'Bali - Île des Dieux', 'Indonésie', 'Temples mystiques, rizières en terrasses, plages paradisiaques et culture balinaise', 950, 10, '2024-08-15', '2024-08-25', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', '', 15, 'plage', '["Vol","Hôtel 4*","Petit-déjeuner","Guide francophone","Excursions temples"]', 4.8),
(3,  'Tokyo Moderne', 'Japon', 'Métropole futuriste, temples traditionnels, gastronomie raffinée et technologie de pointe', 1800, 8, '2024-09-10', '2024-09-18', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', 'https://www.youtube.com/watch?v=5umEUBDXfU0', 12, 'ville', '["Vol","Hôtel centre-ville","JR Pass 7 jours","Guide local","Dîner kaiseki"]', 4.9),
(4,  'New York - Big Apple', 'États-Unis', 'Gratte-ciels emblématiques, Broadway, Central Park et diversité culturelle unique', 1600, 6, '2024-10-05', '2024-10-11', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800', '', 18, 'ville', '["Vol direct","Hôtel Manhattan","New York Pass","Tour guidé"]', 4.7),
(5,  'Alpes Suisses', 'Suisse', 'Sommets enneigés majestueux, villages alpins pittoresques et activités outdoor', 1400, 7, '2024-12-15', '2024-12-22', 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800', 'https://www.youtube.com/watch?v=z2kEKZ6jyQQ', 12, 'montagne', '["Train panoramique","Hôtel vue montagne","Forfait ski 7 jours","Location équipement"]', 4.9),
(6,  'Safari Kenya', 'Kenya', 'Big Five, savane africaine, tribus Masai et lever de soleil sur le Kilimandjaro', 2200, 10, '2024-07-20', '2024-07-30', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800', 'https://www.youtube.com/watch?v=EJ7P3j40GXA', 8, 'aventure', '["Vol","Lodge luxe","Pension complète","Safaris 4x4","Guide ranger"]', 5.0),
(7,  'Seychelles Exclusives', 'Seychelles', 'Archipel préservé, plages Anse Source d\'Argent, nature luxuriante et fonds marins', 1800, 9, '2024-11-01', '2024-11-10', 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800', '', 12, 'plage', '["Vol","Villa privée","Pension complète","Snorkeling","Spa"]', 4.8),
(8,  'Thaïlande Authentique', 'Thaïlande', 'Temples dorés, îles paradisiaques, street food délicieuse et massages traditionnels', 890, 12, '2024-08-01', '2024-08-13', 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800', '', 20, 'plage', '["Vol","Hôtels 3*","Petit-déjeuner","Circuit Bangkok-Phuket","Cours cuisine thaï"]', 4.7),
(9,  'Polynésie Française', 'Tahiti & Bora Bora', 'Lagons turquoise, bungalows sur pilotis, montagnes volcaniques et culture polynésienne', 3500, 14, '2024-06-15', '2024-06-29', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', '', 6, 'plage', '["Vol long-courrier","Bungalow lune de miel","Demi-pension","Excursions lagon","Massage polynésien"]', 5.0),
(10, 'Paris Romantique', 'France', 'Ville lumière, Tour Eiffel, musées d\'art, gastronomie française et promenades Seine', 750, 4, '2024-05-01', '2024-05-05', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', '', 25, 'ville', '["Train","Hôtel 4* quartier Marais","Museum Pass","Croisière Seine","Dîner gastronomique"]', 4.8),
(11, 'Dubaï Futuriste', 'Émirats Arabes Unis', 'Gratte-ciels records, shopping luxueux, désert doré et attractions grandioses', 1300, 5, '2024-11-20', '2024-11-25', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', '', 15, 'ville', '["Vol","Hôtel 5* Marina","Demi-pension","Burj Khalifa","Safari désert 4x4"]', 4.6),
(12, 'Londres Historique', 'Royaume-Uni', 'Monarchie britannique, musées gratuits, marchés vintage et culture cosmopolite', 850, 5, '2024-10-12', '2024-10-17', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800', '', 20, 'ville', '["Train Eurostar","Hôtel zone 1","London Pass","Afternoon tea","Comédie musicale West End"]', 4.5),
(13, 'Népal - Himalaya', 'Népal', 'Trekking mythique, temples bouddhistes, vue sur l\'Everest et spiritualité', 1100, 12, '2024-10-01', '2024-10-13', 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800', '', 10, 'montagne', '["Vol","Lodge montagne","Pension complète","Guide sherpa","Trek Annapurna"]', 4.9),
(14, 'Dolomites Italiennes', 'Italie', 'Pics calcaires spectaculaires, refuges alpins, Via Ferrata et gastronomie tyrolienne', 980, 6, '2024-09-05', '2024-09-11', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', '', 12, 'montagne', '["Vol Milan","Hôtel montagne","Demi-pension","Guide randonnée","Équipement via ferrata"]', 4.7),
(15, 'Patagonie Sauvage', 'Argentine & Chili', 'Glaciers millénaires, pics enneigés, pumas et condors dans les paysages les plus reculés', 2800, 15, '2024-03-10', '2024-03-25', 'https://images.unsplash.com/photo-1535890696255-dd5bcd79e6df?w=800', '', 8, 'montagne', '["Vols internationaux","Hôtels + refuges","Pension complète","Treks guidés","Glacier Perito Moreno"]', 5.0),
(16, 'Rocheuses Canadiennes', 'Canada', 'Lacs turquoise, wapitis, ours noirs et paysages de cartes postales dans l\'Ouest canadien', 1700, 10, '2024-08-05', '2024-08-15', 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800', '', 14, 'montagne', '["Vol","Location voiture","Hôtels lodges","Demi-pension","Pass parcs nationaux"]', 4.8),
(17, 'Amazonie Brésilienne', 'Brésil', 'Forêt tropicale dense, faune exotique, pirogues sur le fleuve et tribus indigènes', 1600, 8, '2024-11-10', '2024-11-18', 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800', '', 10, 'aventure', '["Vol Manaus","Lodge jungle","Pension complète","Excursions pirogue","Guide naturaliste"]', 4.7),
(18, 'Islande - Terre de Feu et Glace', 'Islande', 'Geysers bouillonnants, aurores boréales, cascades puissantes et lagons géothermiques', 1450, 7, '2024-02-15', '2024-02-22', 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800', '', 12, 'aventure', '["Vol direct","Location 4x4","Hôtels","Blue Lagoon","Chasse aurores"]', 4.9),
(19, 'Désert de Namibie', 'Namibie', 'Dunes rouges géantes de Sossusvlei, désert côtier, safaris et ciel étoilé exceptionnel', 2100, 11, '2024-06-01', '2024-06-12', 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800', '', 8, 'aventure', '["Vol","4x4 équipé","Camps désert","Pension complète","Safaris Etosha"]', 4.8),
(20, 'Nouvelle-Zélande - Seigneur des Anneaux', 'Nouvelle-Zélande', 'Fjords majestueux, montagnes dramatiques, culture maorie et décors de films épiques', 3200, 18, '2024-03-01', '2024-03-19', 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800', '', 10, 'aventure', '["Vols","Location camping-car","Activités outdoor","Milford Sound","Tour Hobbiton"]', 5.0),
(21, 'Égypte Antique', 'Égypte', 'Pyramides de Gizeh, temples de Louxor, croisière sur le Nil et trésors pharaoniques', 950, 8, '2024-04-10', '2024-04-18', 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800', '', 18, 'culturel', '["Vol","Hôtel + croisière Nil","Pension complète","Égyptologue francophone","Tous sites"]', 4.6),
(22, 'Grèce des Îles', 'Grèce', 'Santorin au coucher de soleil, ruines antiques, cuisine méditerranéenne et mer Égée', 1100, 10, '2024-06-20', '2024-06-30', 'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=800', '', 16, 'culturel', '["Vol + ferries","Hôtels charme","Demi-pension","3 îles (Santorin, Mykonos, Naxos)","Dégustation vins"]', 4.8),
(23, 'Pérou - Machu Picchu', 'Pérou', 'Cité perdue des Incas, Cusco colonial, Lac Titicaca et culture andine millénaire', 1850, 12, '2024-09-15', '2024-09-27', 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800', '', 12, 'culturel', '["Vol","Hôtels + lodges","Pension complète","Train Machu Picchu","Guide archéologue"]', 4.9),
(24, 'Maroc Impérial', 'Maroc', 'Médinas colorées, palais somptueux, désert du Sahara et tajines authentiques', 720, 7, '2024-10-20', '2024-10-27', 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800', '', 20, 'culturel', '["Vol","Riads charme","Demi-pension","Circuit villes impériales","Nuit désert"]', 4.5),
(25, 'Inde - Rajasthan', 'Inde', 'Palais maharajas, Taj Mahal majestueux, épices envoûtantes et spiritualité vibrante', 1200, 12, '2024-11-05', '2024-11-17', 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800', '', 14, 'culturel', '["Vol","Hôtels heritage","Pension complète","Circuit triangle d\'or","Guide francophone"]', 4.7),
(26, 'Madagascar Unique', 'Madagascar', 'Lémuriens endémiques, baobabs géants, plages désertes et biodiversité exceptionnelle', 1400, 10, '2024-08-10', '2024-08-20', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800', '', 10, 'culturel', '["Vol","Hôtels + lodges","Pension complète","Parcs nationaux","Guide nature"]', 4.6),
(27, 'Cuba Salsa', 'Cuba', 'Voitures vintage, cigares Cohiba, rhum, plages Varadero et musique omniprésente', 1250, 9, '2024-12-01', '2024-12-10', 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800', '', 16, 'culturel', '["Vol","Casas particulares","Demi-pension","Tour La Havane vintage","Cours salsa"]', 4.4),
(28, 'Australie Côte Est', 'Australie', 'Grande Barrière de Corail, Sydney Opera House, kangourous et plages infinies', 3800, 21, '2024-01-15', '2024-02-05', 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800', '', 12, 'culturel', '["Vols","Location campervan","Activités","Plongée Grande Barrière","Pass parcs"]', 4.9),
(29, 'Norvège Fjords', 'Norvège', 'Fjords majestueux, aurores boréales, villages colorés et croisière Hurtigruten', 1900, 8, '2024-01-20', '2024-01-28', 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800', '', 10, 'culturel', '["Vol","Croisière fjords","Hôtels","Pension complète","Excursions nature"]', 4.8),
(30, 'Vietnam du Nord au Sud', 'Vietnam', 'Baie d\'Halong mystique, ruelles Hanoï, delta Mékong et cuisine de rue délicieuse', 1050, 14, '2024-10-10', '2024-10-24', 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=800', '', 18, 'culturel', '["Vol","Hôtels","Demi-pension","Circuit complet","Croisière Halong 2J/1N"]', 4.7);

-- ================================================
-- DONNÉES : 40 avis
-- ================================================
INSERT INTO avis (id, voyageId, auteur, note, texte, date) VALUES
(1,  1,  'Sophie Martin',    5, 'Expérience incroyable ! Le voyage était parfaitement organisé, les paysages à couper le souffle. Je recommande vivement !', '2025-02-15 10:00:00.000'),
(2,  1,  'Thomas Dubois',    5, 'Un voyage inoubliable ! Le guide était exceptionnel, très professionnel et passionné. Chaque journée était une nouvelle aventure.', '2025-01-20 14:30:00.000'),
(3,  1,  'Marie Lefebvre',   4, 'Très beau voyage, bien organisé. Quelques petits imprévus mais l\'équipe a su s\'adapter. Je reviendrai !', '2024-12-10 09:15:00.000'),
(4,  2,  'Julien Morel',     5, 'Bali est tout simplement paradisiaque. Les temples, les rizières, la culture... Un dépaysement total garanti !', '2025-02-28 08:00:00.000'),
(5,  2,  'Inès Fontaine',    4, 'Superbe séjour à Bali ! Les hébergements étaient de grande qualité et le programme bien rythmé. Seul bémol : un peu chaud en journée.', '2025-01-05 11:00:00.000'),
(6,  3,  'Claire Bernard',   5, 'Tokyo m\'a complètement fascinée ! La ville est incroyable, le mélange tradition/modernité est unique au monde.', '2025-02-10 16:00:00.000'),
(7,  3,  'Romain Petit',     4, 'Voyage au Japon très bien organisé. Les visites étaient variées et enrichissantes. Je recommande ce circuit sans hésitation.', '2024-11-22 13:00:00.000'),
(8,  4,  'Antoine Dupont',   5, 'Le safari au Kenya était une expérience hors du commun. Voir les animaux dans leur habitat naturel est quelque chose que je n\'oublierai jamais.', '2025-01-14 07:30:00.000'),
(9,  4,  'Camille Girard',   5, 'Quelle aventure ! Le Kenya est magnifique. Les guides locaux étaient passionnants et nous ont appris énormément sur la faune africaine.', '2024-12-18 09:00:00.000'),
(10, 5,  'Karim Mansouri',   4, 'Le Maroc est un pays fascinant. Marrakech, les souks, le désert... Tout était au rendez-vous. Attention à la chaleur en été !', '2025-01-30 10:30:00.000'),
(11, 5,  'Lucie Moreau',     5, 'Voyage au Maroc absolument magique. Les couleurs, les odeurs, les gens... Une immersion culturelle totale. Merci pour cette belle aventure !', '2024-11-08 15:00:00.000'),
(12, 6,  'Pierre Leroy',     3, 'Beau voyage dans l\'ensemble mais quelques problèmes logistiques. Le personnel était réactif pour résoudre les soucis.', '2025-02-05 08:00:00.000'),
(13, 6,  'Amandine Roussel', 5, 'L\'Islande est une destination de rêve ! Les aurores boréales, les geysers, les cascades... On en prend plein les yeux à chaque tournant.', '2024-10-25 12:00:00.000'),
(14, 7,  'Nicolas Garnier',  5, 'Les îles grecques sont tout simplement parfaites. Santorin était comme sur les photos, peut-être encore plus beau en vrai !', '2025-03-01 09:00:00.000'),
(15, 7,  'Élodie Blanc',     4, 'Très beau séjour en Grèce. Les hébergements avec vue sur la mer Égée étaient fantastiques. On reviendra !', '2024-09-14 14:00:00.000'),
(16, 8,  'Fatima Benali',    5, 'New York, c\'est une ville à part entière ! Le rythme, l\'énergie, les quartiers... 8 jours ce n\'était pas assez !', '2025-02-20 17:00:00.000'),
(17, 8,  'Maxime Chevalier', 4, 'Séjour new-yorkais au top. Le guide connaissait la ville parfaitement et nous a fait découvrir des endroits hors des sentiers battus.', '2024-12-30 10:00:00.000'),
(18, 9,  'Laura Simon',      5, 'Le Pérou dépasse toutes mes espérances. Machu Picchu est un lieu sacré, la randonnée Inca Trail était physique mais tellement gratifiante.', '2025-01-08 08:30:00.000'),
(19, 9,  'Bastien Richard',  4, 'Voyage au Pérou vraiment exceptionnel. Machu Picchu est à couper le souffle. Prévoir des médicaments contre l\'altitude !', '2024-11-15 11:00:00.000'),
(20, 10, 'Chloé Martin',     5, 'La Thaïlande est un pays enchanteur. Les temples, la cuisine, les plages de Phuket... Un voyage qui donne envie de tout plaquer et repartir !', '2025-02-12 13:00:00.000'),
(21, 10, 'Dylan Mercier',    4, 'Super séjour en Thaïlande ! Bangkok est impressionnante et les plages du sud sont paradisiaques. La cuisine de rue est délicieuse.', '2024-10-02 09:00:00.000'),
(22, 11, 'Nathalie Dupont',  5, 'Cuba est une île hors du temps. La musique, les voitures américaines des années 50, la Havane... Un dépaysement total et une expérience inoubliable.', '2025-01-25 16:00:00.000'),
(23, 12, 'Hugo Lambert',     3, 'Voyage correct mais l\'hébergement n\'était pas à la hauteur de la description. Le programme des visites était bien. L\'Australie reste superbe.', '2024-09-20 10:00:00.000'),
(24, 13, 'Manon Giraud',     5, 'Voyage en Inde absolument incroyable ! Le Taj Mahal, Jaipur, Varanasi... Un pays qui bouleverse, qui dépayse, qui enrichit. Une expérience qui change.', '2025-02-08 07:00:00.000'),
(25, 14, 'Alexandre Duval',  5, 'Le Vietnam du nord au sud, c\'est une aventure magnifique. La baie d\'Along, Hoi An, Ho Chi Minh... Chaque ville avait son caractère unique.', '2024-12-05 12:00:00.000'),
(26, 15, 'Sarah Perrin',     4, 'Superbe circuit ! Bien organisé, les hébergements étaient très bien. On recommande !', '2025-03-02 11:00:00.000'),
(27, 16, 'Youssef Alami',    5, 'Les Maldives, c\'est le paradis sur Terre. Le lagon turquoise, les bungalows sur pilotis, le snorkeling avec les raies... Parfait pour une lune de miel.', '2025-01-18 14:00:00.000'),
(28, 17, 'Pauline Renard',   4, 'Road trip mémorable ! Les paysages sont à couper le souffle. Prévoyez un imperméable !', '2024-11-30 09:30:00.000'),
(29, 18, 'Clément Bonnet',   5, 'Le voyage m\'a conquis ! Les paysages sont irréels. Un pays à découvrir absolument !', '2025-02-25 10:00:00.000'),
(30, 19, 'Océane Fournier',  4, 'Très beau voyage. Le désert était féerique. Une destination trop méconnue !', '2025-01-12 08:00:00.000'),
(31, 5,  'Julien Marchand',  2, 'Très déçu de ce voyage. L\'hébergement ne correspondait pas du tout aux photos. Beaucoup de temps perdu dans les transports et guide peu professionnel.', '2025-02-18 11:00:00.000'),
(32, 8,  'Sandrine Poirot',  1, 'Catastrophique ! Guide absent le deuxième jour, hôtel classé 4 étoiles mais niveau 2 en réalité. Repas inclus annulés sans prévenir. Je demande un remboursement.', '2025-01-22 09:00:00.000'),
(33, 3,  'Marc Tissier',     2, 'Organisation chaotique. Les visites étaient bâclées et les repas de très mauvaise qualité. Rien ne correspondait au programme annoncé. Vraiment décevant.', '2025-01-10 14:00:00.000'),
(34, 12, 'Isabelle Ferrand', 1, 'Le pire voyage de ma vie. Vols ratés, hôtel perdu, aucune assistance de l\'agence. 3 heures d\'attente à l\'aéroport sans information. Scandaleux.', '2024-12-08 10:00:00.000'),
(35, 7,  'Franck Lebrun',    2, 'Très déçu. Les bateaux étaient bondés et en mauvais état. Les "excursions exclusives" étaient en réalité des visites de groupe de 50 personnes.', '2024-11-05 08:00:00.000'),
(36, 9,  'Corinne Bataille', 2, 'Machu Picchu était magnifique mais l\'organisation du voyage était désastreuse. Hôtels sous-standard, guides peu formés, planning non respecté.', '2025-02-03 12:00:00.000'),
(37, 6,  'Bruno Chabot',     1, 'Voyage raté. La nuit des aurores boréales était nuageuse et personne ne nous a proposé de remplacer l\'activité. Programme bâclé, hôtel décevant. À éviter.', '2024-10-15 16:00:00.000'),
(38, 14, 'Patricia Gros',    2, 'Le pays était beau mais le voyage mal géré. Transferts chaotiques, chambres données à d\'autres clients à notre arrivée, repas du soir souvent annulés.', '2024-12-22 09:30:00.000'),
(39, 4,  'Sébastien Marin',  1, 'Safari catastrophique. Véhicule en panne pendant 4 heures en pleine savane. Guide ne parlait pas français malgré la promesse. Aucun remboursement proposé.', '2025-01-28 07:00:00.000'),
(40, 10, 'Virginie Collet',  2, 'Très décevant. Les plages promises dans la brochure étaient fermées. Pas d\'alternative proposée. On s\'est retrouvés à rien faire pendant 3 jours.', '2025-02-22 11:00:00.000');

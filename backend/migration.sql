-- ================================================
-- MIGRATION : Ajout de l'authentification
-- À exécuter UNE SEULE FOIS dans MySQL :
--   mysql -u root -p agence_voyage < migration.sql
-- ================================================

-- TABLE : utilisateurs
-- Stocke les comptes des utilisateurs et de l'admin.
-- Le mot de passe est hashé avec bcrypt (jamais en clair).
-- role : 'user' pour les clients, 'admin' pour l'accès backoffice.
CREATE TABLE IF NOT EXISTS utilisateurs (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nom           VARCHAR(255)  NOT NULL,
  prenom        VARCHAR(255)  NOT NULL,
  email         VARCHAR(255)  NOT NULL,
  mot_de_passe  VARCHAR(255)  NOT NULL,
  role          ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  dateCreation  DATETIME(3)   NOT NULL,
  PRIMARY KEY (id),
  UNIQUE INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ajout d'une colonne dans reservations pour lier une réservation à un compte utilisateur.
-- NULL = réservation faite sans compte (compatibilité avec l'existant).
ALTER TABLE reservations
  ADD COLUMN utilisateurId INT UNSIGNED NULL DEFAULT NULL AFTER voyageId,
  ADD INDEX idx_reservations_utilisateur (utilisateurId);

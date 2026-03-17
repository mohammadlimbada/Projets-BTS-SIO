<template>
  <!-- Conteneur racine de toute l'application Vue.js -->
  <div class="app">

    <!-- ================================================
         HEADER — Barre de navigation fixée en haut de page
         Elle reste visible quand l'utilisateur fait défiler la page (position sticky).
         Les boutons changent la variable "pageActive" pour afficher la bonne page.
         ================================================ -->
    <header class="header">
      <div class="container">
        <!-- Logo de l'agence -->
        <h1 class="logo">✈️ Voyage Express</h1>

        <!-- Navigation principale — 4 onglets -->
        <nav class="nav">
          <!-- @click : quand on clique, change la page active -->
          <!-- :class="{ active: ... }" : ajoute la classe "active" si c'est la page courante -->
          <button @click="pageActive = 'home'" :class="{ active: pageActive === 'home' }">
            Accueil
          </button>
          <button @click="pageActive = 'catalogue'" :class="{ active: pageActive === 'catalogue' }">
            Catalogue
          </button>
          <button @click="pageActive = 'contact'" :class="{ active: pageActive === 'contact' }">
            Contact
          </button>
          <button @click="pageActive = 'projet'" :class="{ active: pageActive === 'projet' }" class="btn-projet">
            📋 Projet
          </button>
        </nav>
      </div>
    </header>

    <!-- ================================================
         PAGE ACCUEIL
         Affichée uniquement si pageActive === 'home'
         v-if : directive Vue qui masque/affiche un élément selon une condition
         ================================================ -->
    <div v-if="pageActive === 'home'" class="page">

      <!-- Section hero : grande bannière d'accueil avec appel à l'action -->
      <div class="hero">
        <h1 class="hero-title">Découvrez le Monde</h1>
        <p class="hero-subtitle">80 Destinations Exceptionnelles vous attendent</p>
        <!-- Bouton qui appelle la fonction allerAuCatalogue() -->
        <button @click="allerAuCatalogue" class="btn-primary">
          Voir les Voyages
        </button>
      </div>

      <!-- Section avis clients sur la page d'accueil
           Affiche les 6 avis les plus récents chargés depuis l'API -->
      <div class="home-avis-section">
        <h2>💬 Ce que disent nos clients</h2>
        <p class="home-avis-subtitle">Des milliers de voyageurs nous font confiance</p>

        <!-- v-for : boucle Vue qui génère une carte pour chaque avis
             :key="avisItem.id" : identifiant unique pour que Vue gère la liste efficacement -->
        <div class="home-avis-grid">
          <div v-for="avisItem in avisAccueil" :key="avisItem.id" class="avis-card">
            <div class="avis-header">
              <div class="avis-auteur">
                <div class="avis-avatar">👤</div>
                <div>
                  <!-- {{ }} : interpolation Vue — affiche la valeur de la variable -->
                  <strong>{{ avisItem.auteur }}</strong>
                  <!-- formatDateAvis() convertit la date ISO en texte lisible ("Il y a 3 jours") -->
                  <div class="avis-date">{{ formatDateAvis(avisItem.date) }}</div>
                </div>
              </div>
              <!-- etoilesNote() retourne une chaîne d'étoiles ⭐ selon la note -->
              <div class="avis-note">{{ etoilesNote(avisItem.note) }}</div>
            </div>
            <p class="avis-texte">"{{ avisItem.texte }}"</p>
            <!-- Tag indiquant à quel voyage correspond cet avis (affiché seulement si trouvé) -->
            <div v-if="getNomVoyage(avisItem.voyageId)" class="avis-voyage-tag">
              {{ getNomVoyage(avisItem.voyageId) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================================================
         PAGE CATALOGUE
         Liste de tous les voyages avec filtres et recherche.
         Affichée uniquement si pageActive === 'catalogue'
         ================================================ -->
    <div v-if="pageActive === 'catalogue'" class="page">
      <div class="container">
        <h2 class="page-title">Nos Destinations</h2>

        <!-- FILTRES PAR CATÉGORIE
             v-for génère un bouton pour chaque catégorie définie dans le script
             Le clic met à jour categorieActive, ce qui déclenche un rechargement -->
        <div class="filtres">
          <button
            v-for="cat in categories"
            :key="cat.value"
            @click="categorieActive = cat.value"
            :class="{ active: categorieActive === cat.value }"
            class="btn-filtre"
          >
            {{ cat.icon }} {{ cat.nom }}
          </button>
        </div>

        <!-- BARRE DE RECHERCHE
             v-model : lie la valeur de l'input à la variable "recherche" en temps réel.
             Chaque frappe de touche met à jour "recherche" → le watcher recharge les voyages -->
        <input
          v-model="recherche"
          type="text"
          placeholder="🔍 Rechercher une destination..."
          class="input-recherche"
        >

        <!-- COMPTEUR — affiche le nombre de résultats filtrés -->
        <div class="compteur-voyages">
          {{ voyagesFiltres.length }} destination(s) trouvée(s)
        </div>

        <!-- MESSAGE SI AUCUN RÉSULTAT -->
        <div v-if="voyagesFiltres.length === 0" class="no-results">
          Aucun voyage trouvé 😢
        </div>

        <!-- GRILLE DES CARTES VOYAGES
             v-else : s'affiche uniquement si v-if (au-dessus) est faux
             Chaque carte déclenche ouvrirDetail(voyage) au clic -->
        <div v-else class="voyages-grid">
          <div
            v-for="voyage in voyagesFiltres"
            :key="voyage.id"
            @click="ouvrirDetail(voyage)"
            class="voyage-card"
          >
            <!-- :src="..." et :alt="..." : attributs liés dynamiquement à des variables Vue -->
            <img :src="voyage.image" :alt="voyage.titre" class="voyage-img" @error="(e) => { e.target.onerror=null; e.target.style.background='linear-gradient(135deg,#1e3c72,#2a5298)'; e.target.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 800 500\'%3E%3Crect width=\'800\' height=\'500\' fill=\'%231e3c72\'/%3E%3C/svg%3E' }">
            <div class="voyage-content">
              <h3 class="voyage-titre">{{ voyage.titre }}</h3>
              <p class="voyage-destination">📍 {{ voyage.destination }}</p>
              <!-- .substring(0, 80) : tronque la description à 80 caractères -->
              <p class="voyage-description">{{ voyage.description.substring(0, 80) }}...</p>
              <div class="voyage-footer">
                <span class="voyage-prix">{{ voyage.prix }}€</span>
                <span class="voyage-duree">⏱ {{ voyage.duree }} jours</span>
              </div>
              <div class="voyage-note">
                <template v-if="getNombreAvis(voyage.id) > 0">
                  ⭐ {{ voyage.noteGlobale }} / 5
                  <span class="avis-count">{{ getNombreAvis(voyage.id) }} avis clients</span>
                </template>
                <template v-else>
                  <span class="avis-count">Nouveau — pas encore d'avis</span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================================================
         PAGE DÉTAIL D'UN VOYAGE
         Affichée quand pageActive === 'detail' ET qu'un voyage est sélectionné.
         Montre toutes les infos, les dates, la vidéo YouTube et les avis.
         ================================================ -->
    <div v-if="pageActive === 'detail' && voyageSelectionne" class="page">
      <div class="container">

        <!-- Bouton retour vers le catalogue -->
        <button @click="pageActive = 'catalogue'" class="btn-retour">
          ← Retour
        </button>

        <div class="detail-header">
          <!-- Grande image du voyage -->
          <img :src="voyageSelectionne.image" :alt="voyageSelectionne.titre" class="detail-img" @error="(e) => { e.target.onerror=null; e.target.style.background='linear-gradient(135deg,#1e3c72,#2a5298)'; e.target.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 800 500\'%3E%3Crect width=\'800\' height=\'500\' fill=\'%231e3c72\'/%3E%3C/svg%3E' }">

          <div class="detail-info">
            <h2 class="detail-titre">{{ voyageSelectionne.titre }}</h2>
            <p class="detail-destination">📍 {{ voyageSelectionne.destination }}</p>
            <p class="detail-description">{{ voyageSelectionne.description }}</p>

            <!-- Grille des caractéristiques du voyage (prix, durée, dates, places, note) -->
            <div class="detail-specs">
              <div class="spec">
                <strong>💰 Prix:</strong> {{ voyageSelectionne.prix }}€ / personne
              </div>
              <div class="spec">
                <strong>⏱ Durée:</strong> {{ voyageSelectionne.duree }} jours
              </div>
              <div class="spec">
                <!-- formatDate() convertit "2024-07-01" en "1 juillet 2024" -->
                <strong>📅 Départ:</strong> {{ formatDate(voyageSelectionne.dateDepart) }}
              </div>
              <div class="spec">
                <strong>📅 Retour:</strong> {{ formatDate(voyageSelectionne.dateRetour) }}
              </div>
              <div class="spec">
                <strong>🎫 Places:</strong> {{ voyageSelectionne.placesDisponibles }} disponibles
              </div>
              <div class="spec">
                <strong>⭐ Note:</strong>
                <span v-if="getNombreAvis(voyageSelectionne.id) > 0">{{ voyageSelectionne.noteGlobale }} / 5</span>
                <span v-else>Pas encore d'avis</span>
              </div>
            </div>

            <!-- SÉLECTEUR DE DATES
                 L'utilisateur choisit ses dates avant de réserver.
                 :min="dateMin" empêche de choisir une date passée.
                 Les dates choisies sont pré-remplies dans le formulaire de réservation. -->
            <div class="dates-section">
              <h3>📅 Choisissez votre date de départ et d'arrivée</h3>
              <p class="dates-hint">Sélectionnez vos dates pour réserver ce voyage.</p>
              <div class="dates-grid">
                <div class="form-group">
                  <label>📅 Date de départ *</label>
                  <!-- v-model lie l'input à detailDateDepart -->
                  <!-- :min="dateMin" = on ne peut pas choisir une date passée -->
                  <input v-model="detailDateDepart" type="date" :min="dateMin" class="date-input">
                  <span class="date-label-info">Suggéré : {{ formatDate(voyageSelectionne.dateDepart) }}</span>
                </div>
                <div class="form-group">
                  <label>🏁 Date d'arrivée (retour) *</label>
                  <!-- :min="detailDateDepart || dateMin" = retour ne peut pas être avant le départ -->
                  <input v-model="detailDateRetour" type="date" :min="detailDateDepart || dateMin" class="date-input">
                  <span class="date-label-info">Suggéré : {{ formatDate(voyageSelectionne.dateRetour) }}</span>
                </div>
              </div>
              <!-- Résumé des dates affiché seulement si les deux sont sélectionnées -->
              <div v-if="detailDateDepart && detailDateRetour" class="dates-resume">
                ✅ Départ : {{ formatDate(detailDateDepart) }} — Arrivée : {{ formatDate(detailDateRetour) }}
              </div>
            </div>

            <!-- Bouton réserver — désactivé si les deux dates ne sont pas choisies -->
            <button @click="allerReserver" class="btn-reserver" :disabled="!detailDateDepart || !detailDateRetour">
              🎫 Réserver Maintenant
            </button>

            <!-- Liste des services inclus dans le prix -->
            <div class="inclus">
              <h3>✅ Inclus dans le voyage:</h3>
              <ul>
                <!-- v-for sur le tableau inclus[] du voyage -->
                <li v-for="item in voyageSelectionne.inclus" :key="item">
                  {{ item }}
                </li>
              </ul>
            </div>

            <!-- VIDÉO YOUTUBE — s'affiche uniquement si le voyage a une URL vidéo
                 v-if="" : affiche ce bloc seulement si la propriété video est non vide
                 getYoutubeEmbed() convertit l'URL YouTube en URL d'intégration (embed) -->
            <div v-if="voyageSelectionne.video" class="video-container">
              <h3>🎥 Vidéo de présentation</h3>
              <iframe
                :src="getYoutubeEmbed(voyageSelectionne.video)"
                frameborder="0"
                allowfullscreen
                class="video-player"
              ></iframe>
            </div>

            <!-- ================================================
                 AVIS CLIENTS DU VOYAGE (chargés dynamiquement)
                 Les avis sont chargés depuis l'API quand on ouvre la page détail.
                 ================================================ -->
            <div class="avis-section">
              <h3>⭐ Avis des Voyageurs ({{ avisVoyage.length }})</h3>

              <!-- État de chargement : affiché pendant la requête API -->
              <div v-if="loadingAvis" class="avis-loading">
                Chargement des avis...
              </div>

              <!-- Message si aucun avis pour ce voyage -->
              <div v-else-if="avisVoyage.length === 0" class="avis-vide">
                Aucun avis pour ce voyage. Soyez le premier à partager votre expérience !
              </div>

              <!-- Liste des avis (triés du plus récent au plus ancien) -->
              <div v-else class="avis-grid">
                <div v-for="avisItem in avisVoyage" :key="avisItem.id" class="avis-card">
                  <div class="avis-header">
                    <div class="avis-auteur">
                      <div class="avis-avatar">👤</div>
                      <div>
                        <strong>{{ avisItem.auteur }}</strong>
                        <div class="avis-date">{{ formatDateAvis(avisItem.date) }}</div>
                      </div>
                    </div>
                    <div class="avis-note">{{ etoilesNote(avisItem.note) }}</div>
                  </div>
                  <p class="avis-texte">"{{ avisItem.texte }}"</p>
                </div>
              </div>

              <!-- FORMULAIRE POUR LAISSER UN AVIS
                   @submit.prevent : empêche le rechargement de la page à la soumission
                   et appelle la fonction envoyerAvis() -->
              <div class="avis-form-section">
                <h4>✏️ Laisser un avis</h4>
                <form @submit.prevent="envoyerAvis" class="avis-form">
                  <div class="form-group">
                    <label>Votre prénom *</label>
                    <input v-model="formAvis.auteur" type="text" placeholder="Ex: Sophie" required>
                  </div>
                  <div class="form-group">
                    <label>Note *</label>
                    <!-- Sélecteur d'étoiles interactif (1 à 5) -->
                    <div class="note-selector">
                      <button
                        v-for="n in [1, 2, 3, 4, 5]"
                        :key="n"
                        type="button"
                        @click="formAvis.note = n"
                        :class="{ active: formAvis.note >= n }"
                        class="btn-etoile"
                      >⭐</button>
                      <span class="note-texte">{{ formAvis.note }}/5</span>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Votre avis *</label>
                    <textarea
                      v-model="formAvis.texte"
                      rows="3"
                      placeholder="Partagez votre expérience..."
                      required
                    ></textarea>
                  </div>
                  <!-- :disabled : bouton grisé pendant l'envoi pour éviter les doubles clics -->
                  <button type="submit" class="btn-submit" :disabled="envoyerAvisLoading">
                    {{ envoyerAvisLoading ? 'Publication...' : 'Publier mon avis' }}
                  </button>
                </form>
                <!-- Message de succès ou d'erreur après l'envoi de l'avis -->
                <div v-if="messageAvisEnvoye" class="message-avis">{{ messageAvisEnvoye }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================================================
         PAGE RÉSERVATION
         Formulaire complet pour réserver un voyage.
         Accessible seulement si un voyage est sélectionné.
         ================================================ -->
    <div v-if="pageActive === 'reservation' && voyageSelectionne" class="page">
      <div class="container">

        <!-- Retour vers la page détail -->
        <button @click="pageActive = 'detail'" class="btn-retour">
          ← Retour
        </button>

        <div class="reservation-card">
          <h2>Réserver : {{ voyageSelectionne.titre }}</h2>

          <!-- Formulaire de réservation
               @submit.prevent : intercepte la soumission HTML et appelle envoyerReservation() -->
          <form @submit.prevent="envoyerReservation" class="form">

            <!-- Prénom + Nom côte à côte (2 colonnes) -->
            <div class="form-row">
              <div class="form-group">
                <label>Prénom *</label>
                <!-- v-model lie le champ à form.prenom — chaque frappe met à jour la variable -->
                <input v-model="form.prenom" type="text" required>
              </div>
              <div class="form-group">
                <label>Nom *</label>
                <input v-model="form.nom" type="text" required>
              </div>
            </div>

            <!-- Email + Téléphone côte à côte -->
            <div class="form-row">
              <div class="form-group">
                <label>Email *</label>
                <input v-model="form.email" type="email" required>
              </div>
              <div class="form-group">
                <label>Téléphone *</label>
                <input v-model="form.telephone" type="tel" required>
              </div>
            </div>

            <!-- Dates de départ et retour (pré-remplies depuis la page détail) -->
            <div class="form-row">
              <div class="form-group">
                <label>Date de départ souhaitée *</label>
                <input v-model="form.dateDepart" type="date" :min="dateMin" required>
              </div>
              <div class="form-group">
                <label>Date de retour souhaitée *</label>
                <!-- :min="form.dateDepart" = la date de retour ne peut pas être avant le départ -->
                <input v-model="form.dateRetour" type="date" :min="form.dateDepart" required>
              </div>
            </div>

            <!-- Nombre de personnes (entre 1 et 10) -->
            <div class="form-group">
              <label>Nombre de personnes *</label>
              <!-- v-model.number : convertit automatiquement la valeur en nombre entier -->
              <input v-model.number="form.nombrePersonnes" type="number" min="1" max="10" required>
            </div>

            <!-- Commentaires optionnels -->
            <div class="form-group">
              <label>Commentaires / Demandes spéciales</label>
              <textarea v-model="form.commentaires" rows="4"></textarea>
            </div>

            <!-- Prix total calculé en temps réel : prix * nombre de personnes -->
            <div class="prix-total">
              <strong>Prix Total:</strong>
              {{ voyageSelectionne.prix * form.nombrePersonnes }}€
            </div>

            <!-- Bouton de soumission — grisé pendant l'envoi -->
            <button type="submit" class="btn-submit" :disabled="loading">
              {{ loading ? 'Envoi en cours...' : 'Confirmer la Réservation' }}
            </button>
          </form>

          <!-- Message d'erreur si la réservation échoue -->
          <div v-if="messageConfirmation" class="message-succes">
            {{ messageConfirmation }}
          </div>
        </div>
      </div>
    </div>

    <!-- ================================================
         PAGE PAIEMENT
         Formulaire de carte bancaire (simulation — pas de vrai paiement).
         Affiche un récapitulatif de la commande avant de payer.
         ================================================ -->
    <div v-if="pageActive === 'paiement' && voyageSelectionne" class="page">
      <div class="container">
        <div class="paiement-card">
          <h2>💳 Paiement Sécurisé</h2>

          <!-- Récapitulatif de la réservation avant paiement -->
          <div class="paiement-resume">
            <div class="paiement-resume-ligne">
              <span>🏝️ Voyage</span>
              <strong>{{ voyageSelectionne.titre }}</strong>
            </div>
            <div class="paiement-resume-ligne">
              <span>📅 Dates</span>
              <strong>{{ formatDate(form.dateDepart) }} → {{ formatDate(form.dateRetour) }}</strong>
            </div>
            <div class="paiement-resume-ligne">
              <span>👥 Personnes</span>
              <strong>{{ form.nombrePersonnes }}</strong>
            </div>
            <!-- Ligne du total en bas du récapitulatif -->
            <div class="paiement-resume-ligne paiement-total-ligne">
              <span>💰 Total à payer</span>
              <strong class="paiement-total">{{ voyageSelectionne.prix * form.nombrePersonnes }}€</strong>
            </div>
          </div>

          <!-- Formulaire de carte bancaire
               @submit.prevent : appelle effectuerPaiement() sans recharger la page -->
          <form @submit.prevent="effectuerPaiement" class="form">
            <div class="form-group">
              <label>Nom sur la carte *</label>
              <!-- style="text-transform:uppercase" : met le nom en majuscules automatiquement -->
              <input v-model="formPaiement.nomCarte" type="text" placeholder="JEAN DUPONT" style="text-transform:uppercase" required>
            </div>

            <div class="form-group carte-numero-group">
              <label>Numéro de carte *</label>
              <!-- Le watcher dans le script formate automatiquement en groupes de 4 : "4242 4242 4242 4242" -->
              <div class="carte-input-wrapper">
                <input v-model="formPaiement.numeroCarte" type="text" placeholder="4242 4242 4242 4242" maxlength="19" class="carte-input" required>
                <span class="carte-icones">💳</span>
              </div>
            </div>

            <!-- Expiration + CVV côte à côte -->
            <div class="form-row">
              <div class="form-group">
                <label>Date d'expiration *</label>
                <!-- Le watcher dans le script formate automatiquement en "MM/AA" -->
                <input v-model="formPaiement.expiration" type="text" placeholder="MM/AA" maxlength="5" required>
              </div>
              <div class="form-group">
                <label>CVV *</label>
                <!-- type="password" : masque les 3 chiffres du code de sécurité -->
                <input v-model="formPaiement.cvv" type="password" placeholder="•••" maxlength="3" required>
              </div>
            </div>

            <!-- Badge de sécurité (visuel de réassurance) -->
            <div class="securite-badge">🔒 Paiement 100% sécurisé — Chiffrement SSL</div>

            <!-- Bouton de paiement — affiche un message de chargement pendant le traitement -->
            <button type="submit" class="btn-submit btn-payer" :disabled="paiementLoading">
              {{ paiementLoading ? '⏳ Traitement en cours...' : `💳 Payer ${voyageSelectionne.prix * form.nombrePersonnes}€` }}
            </button>
          </form>

          <!-- Message d'erreur si le paiement échoue -->
          <div v-if="messagePaiement" class="message-erreur">{{ messagePaiement }}</div>
        </div>
      </div>
    </div>

    <!-- ================================================
         PAGE CONFIRMATION
         Affichée après un paiement réussi.
         Montre le récapitulatif final de la réservation confirmée.
         ================================================ -->
    <div v-if="pageActive === 'confirmation'" class="page">
      <div class="container">
        <div class="confirmation-card">
          <div class="confirmation-icone">✅</div>
          <h2>Réservation Confirmée !</h2>
          <p class="confirmation-texte">Votre paiement a bien été traité. Merci pour votre confiance !</p>

          <!-- Détails de la réservation confirmée
               v-if="reservationEnCours" : s'affiche seulement si l'objet réservation existe -->
          <div v-if="reservationEnCours" class="confirmation-details">
            <p>🏝️ <strong>{{ reservationEnCours.titre }}</strong></p>
            <p>👤 <strong>{{ reservationEnCours.prenom }} {{ reservationEnCours.nom }}</strong></p>
            <p>📧 Un email de confirmation sera envoyé à <strong>{{ reservationEnCours.email }}</strong></p>
            <p>🎫 Référence : <strong>#{{ reservationEnCours.id }}</strong></p>
          </div>

          <!-- Retour à l'accueil -->
          <button @click="pageActive = 'home'" class="btn-primary" style="margin-top:30px">
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>

    <!-- ================================================
         PAGE CONTACT
         Permet aux visiteurs d'envoyer un message à l'agence.
         Composée de 3 blocs d'info + un formulaire + réseaux sociaux.
         ================================================ -->
    <div v-if="pageActive === 'contact'" class="page">
      <div class="container">
        <h2 class="page-title">Contactez-nous</h2>

        <!-- BLOCS D'INFORMATIONS DE CONTACT (email, téléphone, adresse) -->
        <div class="contact-info-grid">
          <div class="contact-info-item">
            <div class="contact-info-icone">📧</div>
            <h3>Email</h3>
            <p>mohammad.limbada97494@gmail.com</p>
          </div>
          <div class="contact-info-item">
            <div class="contact-info-icone">📞</div>
            <h3>Téléphone</h3>
            <p>+33 6 12 34 56 78</p>
            <p class="contact-horaires">Lun-Ven 9h–18h · Sam 10h–16h</p>
          </div>
          <div class="contact-info-item">
            <div class="contact-info-icone">📍</div>
            <h3>Adresse</h3>
            <p>123 Rue du Voyage<br>75001 Paris, France</p>
          </div>
        </div>

        <!-- FORMULAIRE DE CONTACT
             @submit.prevent : intercepte la soumission et appelle envoyerMessage() -->
        <div class="contact-form-section">
          <h3>📩 Envoyez-nous un message</h3>
          <form @submit.prevent="envoyerMessage" class="form">

            <!-- Nom + Prénom côte à côte -->
            <div class="form-row">
              <div class="form-group">
                <label>Nom *</label>
                <input v-model="formContact.nom" type="text" placeholder="Dupont" required>
              </div>
              <div class="form-group">
                <label>Prénom *</label>
                <input v-model="formContact.prenom" type="text" placeholder="Jean" required>
              </div>
            </div>

            <!-- Email + Téléphone (téléphone facultatif) -->
            <div class="form-row">
              <div class="form-group">
                <label>Email *</label>
                <input v-model="formContact.email" type="email" placeholder="jean@email.com" required>
              </div>
              <div class="form-group">
                <label>Téléphone</label>
                <input v-model="formContact.telephone" type="tel" placeholder="+33 6 12 34 56 78">
              </div>
            </div>

            <!-- Sujet : menu déroulant avec plusieurs options -->
            <div class="form-group">
              <label>Sujet *</label>
              <!-- v-model lie la valeur sélectionnée à formContact.sujet -->
              <select v-model="formContact.sujet" required class="contact-select">
                <option value="">-- Choisissez un sujet --</option>
                <option value="Question générale">❓ Question générale</option>
                <option value="Réservation">✈️ Réservation</option>
                <option value="Réclamation">⚠️ Réclamation</option>
                <option value="Partenariat">🤝 Partenariat</option>
                <option value="Autre">💬 Autre</option>
              </select>
            </div>

            <!-- Zone de texte pour le message (6 lignes de hauteur) -->
            <div class="form-group">
              <label>Message *</label>
              <textarea v-model="formContact.message" rows="6" placeholder="Décrivez votre demande..." required></textarea>
            </div>

            <button type="submit" class="btn-submit">
              📩 Envoyer le message
            </button>
          </form>

          <!-- Message de confirmation après envoi réussi -->
          <div v-if="messageContactEnvoye" class="message-succes">
            ✅ Message envoyé ! Nous vous répondrons sous 24h.
          </div>

          <!-- Message d'erreur en cas de problème -->
          <div v-if="messageContactErreur" class="message-erreur">
            {{ messageContactErreur }}
          </div>
        </div>

        <!-- LIENS RÉSEAUX SOCIAUX (href="#" = placeholder, pas de vraies pages) -->
        <div class="contact-social">
          <h3>Suivez-nous</h3>
          <div class="social-btns">
            <a href="#" class="social-btn social-fb">📘 Facebook</a>
            <a href="#" class="social-btn social-ig">📸 Instagram</a>
            <a href="#" class="social-btn social-tw">🐦 Twitter</a>
            <a href="#" class="social-btn social-wa">💬 WhatsApp</a>
          </div>
        </div>
      </div>
    </div>

    <!-- ================================================
         PAGE PROJET
         Présente le contexte académique et les détails techniques du projet.
         Page de documentation destinée à l'évaluation BTS SIO SLAM.
         ================================================ -->
    <div v-if="pageActive === 'projet'" class="page">
      <div class="container">
        <div class="projet-card">
          <h2 class="page-title">📋 À Propos du Projet</h2>

          <div class="projet-content">
            <div class="projet-section">
              <h3>🎓 Contexte Académique</h3>
              <p>Ce projet a été réalisé dans le cadre du <strong>BTS SIO SLAM</strong> (Services Informatiques aux Organisations - Solutions Logicielles et Applications Métiers).</p>
            </div>

            <div class="projet-section">
              <h3>🎯 Objectifs du Projet</h3>
              <ul>
                <li>Développer une application web complète avec architecture client-serveur</li>
                <li>Utiliser des frameworks JavaScript modernes (Vue.js et Node.js)</li>
                <li>Créer une interface utilisateur intuitive et responsive</li>
                <li>Implémenter un système de gestion de données dynamique</li>
              </ul>
            </div>

            <div class="projet-section">
              <h3>💻 Technologies Utilisées</h3>
              <div class="tech-grid">
                <div class="tech-card">
                  <h4>🎨 Frontend</h4>
                  <ul>
                    <li>Vue.js 3 (Composition API)</li>
                    <li>HTML5 / CSS3</li>
                    <li>Axios (requêtes HTTP)</li>
                    <li>Vite (build tool)</li>
                  </ul>
                </div>
                <div class="tech-card">
                  <h4>⚙️ Backend</h4>
                  <ul>
                    <li>Node.js</li>
                    <li>Express.js</li>
                    <li>API REST</li>
                    <li>CORS</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="projet-section">
              <h3>✨ Fonctionnalités Principales</h3>
              <div class="features-grid">
                <div class="feature-item">
                  <span class="feature-icon">🌍</span>
                  <h4>Catalogue de 80 Destinations</h4>
                  <p>Destinations variées à travers le monde avec photos haute qualité</p>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🔍</span>
                  <h4>Système de Filtres</h4>
                  <p>Filtrage par catégories et recherche dynamique</p>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">📝</span>
                  <h4>Réservation en Ligne</h4>
                  <p>Formulaire complet de réservation de voyages</p>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">📱</span>
                  <h4>Design Responsive</h4>
                  <p>Compatible mobile, tablette et desktop</p>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">⭐</span>
                  <h4>Système de Notation</h4>
                  <p>Notes et avis pour chaque destination</p>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🎨</span>
                  <h4>Interface Moderne</h4>
                  <p>Design violet/rose avec animations fluides</p>
                </div>
              </div>
            </div>

            <div class="projet-section">
              <h3>📊 Architecture du Projet</h3>
              <div class="architecture-box">
                <p><strong>Architecture Client-Serveur</strong></p>
                <ul>
                  <li><strong>Frontend (Client) :</strong> Vue.js 3 - Interface utilisateur interactive</li>
                  <li><strong>Backend (Serveur) :</strong> Node.js + Express - API REST</li>
                  <li><strong>Communication :</strong> HTTP/HTTPS avec Axios</li>
                  <li><strong>Données :</strong> Stockage en mémoire (80 destinations)</li>
                </ul>
              </div>
            </div>

            <div class="projet-section">
              <h3>📈 Statistiques du Projet</h3>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-number">80</div>
                  <div class="stat-label">Destinations</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">2</div>
                  <div class="stat-label">Frameworks</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">5</div>
                  <div class="stat-label">Catégories</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">3</div>
                  <div class="stat-label">API Endpoints</div>
                </div>
              </div>
            </div>

            <div class="projet-section">
              <h3>👨‍💻 Développeur</h3>
              <div class="developer-info">
                <p><strong>Étudiant BTS SIO SLAM</strong></p>
                <p>📧 Email : mohammad.limbada97494@gmail.com</p>
                <p>🎓 Formation : Services Informatiques aux Organisations</p>
                <p>💼 Option : Solutions Logicielles et Applications Métiers</p>
              </div>
            </div>

            <div class="projet-section">
              <h3>🚀 Perspectives d'Évolution</h3>
              <ul>
                <li>Intégration d'une vraie base de données (MongoDB/PostgreSQL)</li>
                <li>Système d'authentification utilisateurs</li>
                <li>Paiement en ligne avec Stripe</li>
                <li>Envoi d'emails de confirmation automatiques</li>
                <li>Dashboard administrateur</li>
                <li>Application mobile React Native</li>
              </ul>
            </div>

            <div class="projet-footer">
              <p>✨ Projet réalisé avec passion pour le BTS SIO SLAM</p>
              <p>© 2024 Voyage Express - Tous droits réservés</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================================================
         FOOTER — Pied de page affiché sur toutes les pages
         ================================================ -->
    <footer class="footer">
      <div class="container">
        <p>© 2024 Voyage Express - Projet BTS SIO SLAM</p>
        <p>✨ Développé avec Vue.js + Node.js + Express</p>
      </div>
    </footer>

  </div>
</template>

<!-- ================================================
     SCRIPT — Logique JavaScript de l'application
     Utilise la "Composition API" de Vue.js 3 (<script setup>).
     Toutes les variables et fonctions déclarées ici sont
     automatiquement disponibles dans le <template> ci-dessus.
     ================================================ -->
<script setup>
// Imports des fonctions Vue.js utilisées dans ce composant :
// - ref      : crée une variable réactive (la page se met à jour quand elle change)
// - computed : crée une valeur calculée automatiquement depuis d'autres variables
// - onMounted: exécute du code au chargement initial de la page
// - watch    : surveille une variable et exécute du code quand elle change
import { ref, computed, onMounted, watch } from 'vue'

// Axios : librairie pour faire des requêtes HTTP vers le backend
// Remplace fetch() avec une syntaxe plus simple et une meilleure gestion des erreurs
import axios from 'axios'

// URL de base de l'API backend — toutes les requêtes commencent par cette URL
const API_URL = 'http://localhost:5000/api'

// ================================================
// VARIABLES RÉACTIVES (ref)
// ref() crée une variable "réactive" : quand sa valeur change,
// Vue met automatiquement à jour l'interface utilisateur.
// On accède à la valeur avec .value dans le script (ex: pageActive.value = 'catalogue')
// Dans le template, on l'utilise directement sans .value (ex: v-if="pageActive === 'home'")
// ================================================

// Page actuellement affichée ('home', 'catalogue', 'detail', 'reservation', 'paiement', 'confirmation', 'contact', 'projet')
const pageActive = ref('home')

// Tableau de tous les voyages chargés depuis l'API
const voyages = ref([])

// Voyage actuellement sélectionné (quand on clique sur une carte)
const voyageSelectionne = ref(null)

// Catégorie de filtre active dans le catalogue ('tous', 'plage', 'ville', etc.)
const categorieActive = ref('tous')

// Texte saisi dans la barre de recherche du catalogue
const recherche = ref('')

// Indique si une requête est en cours (affiche "Envoi en cours..." sur le bouton)
const loading = ref(false)

// Message affiché après la soumission du formulaire de réservation
const messageConfirmation = ref('')

// Indique si le message de contact a été envoyé avec succès (booléen)
const messageContactEnvoye = ref(false)

// ---- Variables liées aux avis clients ----

// Tableau des avis du voyage actuellement affiché sur la page détail
const avisVoyage = ref([])

// Indique si les avis sont en cours de chargement
const loadingAvis = ref(false)

// Données du formulaire pour laisser un avis (prénom, note, texte)
const formAvis = ref({ auteur: '', note: 5, texte: '' })

// Message affiché après l'envoi d'un avis (succès ou erreur)
const messageAvisEnvoye = ref('')

// Indique si l'envoi d'un avis est en cours
const envoyerAvisLoading = ref(false)

// Les 6 avis les plus récents affichés sur la page d'accueil
const avisAccueil = ref([])

// Objet contenant le nombre d'avis par voyage { voyageId: nombreAvis }
// Exemple : { 1: 3, 2: 5 } = voyage 1 a 3 avis, voyage 2 a 5 avis
const statsAvis = ref({})

// ---- Variables liées aux dates sur la page détail ----

// Date de départ choisie sur la page détail (avant de passer à la réservation)
const detailDateDepart = ref('')

// Date de retour choisie sur la page détail
const detailDateRetour = ref('')

// ---- Liste des catégories de voyages ----
// Utilisée pour générer les boutons de filtre dans le catalogue
const categories = [
  { value: 'tous',     nom: 'Tous',      icon: '🌍' },
  { value: 'plage',    nom: 'Plage',     icon: '🏖️' },
  { value: 'ville',    nom: 'Ville',     icon: '🏙️' },
  { value: 'montagne', nom: 'Montagne',  icon: '⛰️' },
  { value: 'aventure', nom: 'Aventure',  icon: '🎒' },
  { value: 'culturel', nom: 'Culturel',  icon: '🎭' }
]

// ---- Formulaire de réservation ----
// Toutes les données saisies par l'utilisateur dans le formulaire de réservation
const form = ref({
  prenom: '',
  nom: '',
  email: '',
  telephone: '',
  nombrePersonnes: 1,   // Par défaut : 1 personne
  dateDepart: '',
  dateRetour: '',
  commentaires: ''
})

// ---- Date minimum (aujourd'hui) pour les champs de date ----
// computed : recalculé automatiquement (mais ici statique en pratique)
// Empêche de choisir une date dans le passé
const dateMin = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]  // Format "YYYY-MM-DD"
})

// ---- Formulaire de contact ----
const formContact = ref({
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  sujet: '',
  message: ''
})

// Message d'erreur du formulaire contact
const messageContactErreur = ref('')

// ---- Variables liées au paiement ----

// Réservation créée par le backend, stockée pour l'afficher sur la page de confirmation
const reservationEnCours = ref(null)

// Données de la carte bancaire saisies dans le formulaire de paiement
const formPaiement = ref({ nomCarte: '', numeroCarte: '', expiration: '', cvv: '' })

// Indique si le paiement est en cours de traitement
const paiementLoading = ref(false)

// Message d'erreur si le paiement échoue
const messagePaiement = ref('')

// ================================================
// FONCTIONS ASYNCHRONES — Requêtes vers l'API
// async/await : permet d'attendre la réponse du serveur avant de continuer
// try/catch   : gère les erreurs si le serveur ne répond pas
// ================================================

// Charge tous les voyages depuis l'API en appliquant les filtres actifs
const chargerVoyages = async () => {
  try {
    // Envoie GET /api/voyages?categorie=...&recherche=... au backend
    const response = await axios.get(`${API_URL}/voyages`, {
      params: {
        categorie: categorieActive.value,
        recherche: recherche.value
      }
    })
    // Met à jour le tableau de voyages avec les données reçues
    voyages.value = response.data
  } catch (error) {
    console.error('Erreur chargement voyages:', error)
  }
}

// ---- Propriété calculée : voyages filtrés ----
// computed : recalculée automatiquement quand voyages, categorieActive ou recherche changent.
// Applique un double filtrage côté frontend (en plus du filtrage backend).
const voyagesFiltres = computed(() => {
  let resultats = voyages.value

  // Filtre par catégorie (si différente de "tous")
  if (categorieActive.value !== 'tous') {
    resultats = resultats.filter(v => v.categorie === categorieActive.value)
  }

  // Filtre par texte de recherche (titre, destination ou description)
  if (recherche.value) {
    const terme = recherche.value.toLowerCase()
    resultats = resultats.filter(v =>
      v.titre.toLowerCase().includes(terme) ||
      v.destination.toLowerCase().includes(terme) ||
      v.description.toLowerCase().includes(terme)
    )
  }

  return resultats
})

// Charge les avis d'un voyage spécifique depuis l'API
// Appelé quand on ouvre la page détail d'un voyage
const chargerAvis = async (voyageId) => {
  loadingAvis.value = true
  try {
    // GET /api/avis?voyageId=X
    const response = await axios.get(`${API_URL}/avis`, { params: { voyageId } })
    avisVoyage.value = response.data
  } catch (error) {
    console.error('Erreur chargement avis:', error)
    avisVoyage.value = []
  } finally {
    // "finally" s'exécute toujours, que ça ait réussi ou échoué
    loadingAvis.value = false
  }
}

// Envoie un nouvel avis pour le voyage actuellement affiché
const envoyerAvis = async () => {
  // Vérifie que les champs obligatoires sont remplis avant d'envoyer
  if (!formAvis.value.auteur || !formAvis.value.texte) return
  envoyerAvisLoading.value = true
  messageAvisEnvoye.value = ''
  try {
    // POST /api/avis avec les données du formulaire + l'id du voyage
    const response = await axios.post(`${API_URL}/avis`, {
      voyageId: voyageSelectionne.value.id,
      ...formAvis.value   // Spread : copie auteur, note et texte
    })
    // Ajoute l'avis au début de la liste (unshift = ajouter en premier)
    avisVoyage.value.unshift(response.data)
    // Rafraîchit le compteur d'avis et la noteGlobale du voyage affiché
    await chargerStatsAvis()
    const voyageMaj = await axios.get(`${API_URL}/voyages/${voyageSelectionne.value.id}`)
    voyageSelectionne.value.noteGlobale = voyageMaj.data.noteGlobale
    // Réinitialise le formulaire
    formAvis.value = { auteur: '', note: 5, texte: '' }
    messageAvisEnvoye.value = '✅ Votre avis a été publié, merci !'
  } catch (error) {
    messageAvisEnvoye.value = '❌ Erreur lors de la publication'
  } finally {
    envoyerAvisLoading.value = false
  }
}

// ================================================
// FONCTIONS UTILITAIRES (helpers)
// Petites fonctions réutilisables dans le template
// ================================================

// Retourne une chaîne d'étoiles selon la note (ex: note=3 → "⭐⭐⭐")
const etoilesNote = (note) => '⭐'.repeat(note)

// Convertit une date ISO en texte relatif lisible
// Exemples : "Aujourd'hui", "Il y a 3 jours", "Il y a 2 semaines", "Il y a 1 mois"
const formatDateAvis = (isoString) => {
  // Différence en millisecondes entre maintenant et la date de l'avis
  const diff = Date.now() - new Date(isoString).getTime()
  const jours = Math.floor(diff / 86400000)  // 86400000 ms = 1 jour
  if (jours === 0) return "Aujourd'hui"
  if (jours === 1) return 'Il y a 1 jour'
  if (jours < 7)  return `Il y a ${jours} jours`
  if (jours < 30) return `Il y a ${Math.floor(jours / 7)} semaine(s)`
  return `Il y a ${Math.floor(jours / 30)} mois`
}

// Transfère les dates de la page détail vers le formulaire de réservation,
// puis navigue vers la page de réservation
const allerReserver = () => {
  form.value.dateDepart = detailDateDepart.value
  form.value.dateRetour = detailDateRetour.value
  pageActive.value = 'reservation'
  // Scroll vers le haut de la page (behavior: 'smooth' = animation fluide)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Ouvre la page de détail pour un voyage donné
// Réinitialise les avis et le formulaire d'avis, puis charge les avis du voyage
const ouvrirDetail = (voyage) => {
  voyageSelectionne.value = voyage
  // Pré-remplit les dates avec celles du voyage (l'utilisateur peut les modifier)
  detailDateDepart.value = voyage.dateDepart
  detailDateRetour.value = voyage.dateRetour
  // Réinitialise le formulaire d'avis pour ce nouveau voyage
  formAvis.value = { auteur: '', note: 5, texte: '' }
  messageAvisEnvoye.value = ''
  // Charge les avis pour ce voyage
  chargerAvis(voyage.id)
  pageActive.value = 'detail'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Navigue vers le catalogue et scroll en haut
const allerAuCatalogue = () => {
  pageActive.value = 'catalogue'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Formate une date ISO ("2024-07-01") en date française lisible ("1 juillet 2024")
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Convertit une URL YouTube normale en URL d'intégration (embed)
// Exemple : "https://www.youtube.com/watch?v=ABC123" → "https://www.youtube.com/embed/ABC123"
const getYoutubeEmbed = (url) => {
  // Essaie d'extraire l'ID après "v=" ou prend la dernière partie de l'URL
  const videoId = url.split('v=')[1] || url.split('/').pop()
  return `https://www.youtube.com/embed/${videoId}`
}

// Envoie le formulaire de réservation au backend
// Puis navigue vers la page de paiement avec la réservation créée
const envoyerReservation = async () => {
  loading.value = true
  messageConfirmation.value = ''

  try {
    // POST /api/reservations avec les données du formulaire + infos du voyage
    const response = await axios.post(`${API_URL}/reservations`, {
      ...form.value,                                    // Toutes les données du formulaire
      voyageId: voyageSelectionne.value.id,
      titre: voyageSelectionne.value.titre,
      destination: voyageSelectionne.value.destination,
      prix: voyageSelectionne.value.prix
    })

    // Stocke la réservation retournée par le serveur (utilisée sur la page de confirmation)
    const data = response.data
    reservationEnCours.value = data.reservation

    // Réinitialise le formulaire de paiement avant d'afficher la page paiement
    formPaiement.value = { nomCarte: '', numeroCarte: '', expiration: '', cvv: '' }
    messagePaiement.value = ''

    // Navigue vers la page de paiement
    pageActive.value = 'paiement'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    messageConfirmation.value = '❌ Erreur lors de la réservation'
    console.error('Erreur réservation:', error)
  } finally {
    loading.value = false
  }
}

// Envoie la confirmation de paiement au backend
// Le backend met simplement le statut de la réservation à "confirmée"
// (pas de vrai traitement de carte bancaire — c'est une simulation)
const effectuerPaiement = async () => {
  paiementLoading.value = true
  messagePaiement.value = ''
  try {
    // POST /api/paiement avec l'ID de la réservation en cours
    await axios.post(`${API_URL}/paiement`, {
      reservationId: reservationEnCours.value.id
    })
    // Paiement accepté : navigue vers la page de confirmation
    pageActive.value = 'confirmation'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    messagePaiement.value = '❌ Erreur lors du paiement. Vérifiez vos informations.'
    console.error('Erreur paiement:', error)
  } finally {
    paiementLoading.value = false
  }
}

// Envoie le message du formulaire de contact au backend
// Réinitialise ensuite le formulaire et affiche un message de succès
const envoyerMessage = async () => {
  messageContactErreur.value = ''
  try {
    // POST Formspree — envoi direct par email sans passer par le backend
    await axios.post('https://formspree.io/f/mnjgonrk', formContact.value, { headers: { Accept: 'application/json' } })
    messageContactEnvoye.value = true
    // Vide le formulaire après l'envoi
    formContact.value = { nom: '', prenom: '', email: '', telephone: '', sujet: '', message: '' }
    // Cache le message de succès automatiquement après 5 secondes
    setTimeout(() => { messageContactEnvoye.value = false }, 5000)
  } catch (error) {
    messageContactErreur.value = '❌ Erreur lors de l\'envoi. Réessayez.'
  }
}

// Charge les 6 avis les plus récents pour la page d'accueil
// Appelé au chargement de l'application (onMounted)
const chargerAvisAccueil = async () => {
  try {
    // GET /api/avis (sans paramètre) → retourne les 6 derniers avis
    const response = await axios.get(`${API_URL}/avis`)
    avisAccueil.value = response.data
  } catch (error) {
    console.error('Erreur chargement avis accueil:', error)
  }
}

// Charge les statistiques d'avis (nombre par voyage) pour afficher "X avis" sur les cartes
const chargerStatsAvis = async () => {
  try {
    const response = await axios.get(`${API_URL}/avis/stats`)
    statsAvis.value = response.data
  } catch (error) {
    console.error('Erreur chargement stats avis:', error)
  }
}

// Retourne le nombre d'avis pour un voyage donné (depuis les stats chargées)
// Retourne 0 si aucun avis trouvé
const getNombreAvis = (voyageId) => {
  return statsAvis.value[voyageId] || 0
}

// Retourne le nom/destination d'un voyage à partir de son ID
// Utilisé sur les avis de la page d'accueil pour afficher "✈️ Bali"
const getNomVoyage = (voyageId) => {
  const v = voyages.value.find(v => v.id === voyageId)
  return v ? `✈️ ${v.destination}` : ''
}

// ================================================
// LIFECYCLE HOOK : onMounted
// Code exécuté UNE SEULE FOIS quand le composant est chargé.
// C'est ici qu'on initialise les données au démarrage de l'application.
// ================================================
onMounted(async () => {
  await chargerVoyages()    // Charge les voyages en premier (await = attend la fin)
  chargerAvisAccueil()      // Charge les avis de l'accueil (pas besoin d'attendre)
  chargerStatsAvis()        // Charge le nombre d'avis par voyage
})

// ================================================
// WATCHERS — Surveille des variables et réagit aux changements
// watch([var1, var2], callback) : exécute callback quand var1 OU var2 change
// ================================================

// Recharge les voyages quand la catégorie ou la recherche change
// (les deux variables sont dans un tableau car on surveille les deux en même temps)
watch([categorieActive, recherche], () => {
  chargerVoyages()
})

// Si la date de retour est antérieure à la nouvelle date de départ, la corrige automatiquement
watch(detailDateDepart, (newDepart) => {
  if (detailDateRetour.value && detailDateRetour.value < newDepart) {
    detailDateRetour.value = newDepart
  }
})

// Formate le numéro de carte automatiquement en groupes de 4 chiffres
// Exemple : l'utilisateur tape "4242424242424242" → affiché "4242 4242 4242 4242"
watch(() => formPaiement.value.numeroCarte, (val) => {
  // Supprime tout ce qui n'est pas un chiffre, limite à 16 chiffres
  const digits = val.replace(/\D/g, '').slice(0, 16)
  // Insère un espace tous les 4 chiffres avec une regex, supprime l'espace final
  formPaiement.value.numeroCarte = digits.replace(/(.{4})/g, '$1 ').trim()
})

// Formate la date d'expiration automatiquement en "MM/AA"
// Exemple : l'utilisateur tape "1224" → affiché "12/24"
watch(() => formPaiement.value.expiration, (val) => {
  const digits = val.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) {
    // Insère le "/" entre le mois (2 premiers chiffres) et l'année (2 derniers)
    formPaiement.value.expiration = digits.slice(0, 2) + '/' + digits.slice(2)
  } else {
    formPaiement.value.expiration = digits
  }
})
</script>

<!-- ================================================
     STYLES CSS — Scoped (appliqués uniquement à ce composant)
     "scoped" signifie que ces styles n'affectent pas d'autres composants Vue.
     Les styles globaux (fond, police) sont dans src/style.css.
     ================================================ -->
<style scoped>
/* ===================== HEADER ===================== */
/* Barre de navigation en haut, collée au bord supérieur lors du défilement */
.header {
  background: rgba(255, 255, 255, 0.95); /* Fond blanc légèrement transparent */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* Ombre portée subtile */
  position: sticky; /* Reste visible même quand on défile */
  top: 0;
  z-index: 100; /* Au-dessus de tous les autres éléments */
}

/* Conteneur centré avec largeur max pour éviter un affichage trop large sur grand écran */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Mise en page du header : logo à gauche, nav à droite */
.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
}

/* Logo "✈️ Voyage Express" en violet */
.logo {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
  margin: 0;
}

/* Boutons de navigation en ligne */
.nav {
  display: flex;
  gap: 15px;
}

/* Style de base des boutons de navigation */
.nav button {
  background: none;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s; /* Animation fluide sur les changements de style */
}

/* Survol d'un bouton nav */
.nav button:hover {
  background: #f0f0f0;
  color: #667eea;
}

/* Bouton actif (page courante) = fond violet dégradé */
.nav button.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

/* Bouton "Projet" avec une bordure visible pour le distinguer */
.btn-projet {
  border: 2px solid #667eea !important;
  font-weight: 600 !important;
}

/* ===================== HERO (page accueil) ===================== */
/* Grande section d'accueil avec titre et bouton d'appel à l'action */
.hero {
  text-align: center;
  padding: 100px 20px;
  color: white; /* Texte blanc sur le fond violet du body */
}

.hero-title {
  font-size: 56px;
  font-weight: 700;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); /* Ombre pour la lisibilité */
}

.hero-subtitle {
  font-size: 24px;
  margin-bottom: 40px;
  opacity: 0.9;
}

/* Bouton principal blanc avec texte violet */
.btn-primary {
  background: white;
  color: #667eea;
  border: none;
  padding: 15px 40px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 50px; /* Bouton arrondi (pill shape) */
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* Le bouton remonte légèrement au survol (effet "flottant") */
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

/* ===================== STRUCTURE DES PAGES ===================== */
/* Chaque "page" (accueil, catalogue, etc.) occupe au minimum toute la hauteur d'écran */
.page {
  min-height: calc(100vh - 200px);
  padding: 40px 0;
}

/* Titre de page centré en blanc */
.page-title {
  text-align: center;
  font-size: 42px;
  color: white;
  margin-bottom: 30px;
}

/* ===================== COMPTEUR DE VOYAGES ===================== */
/* Badge centré qui affiche le nombre de destinations trouvées */
.compteur-voyages {
  text-align: center;
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.2); /* Fond blanc semi-transparent */
  padding: 10px 20px;
  border-radius: 25px;
  display: inline-block;
  /* Centrage horizontal avec margin-left + transform */
  margin-left: 50%;
  transform: translateX(-50%);
}

/* ===================== FILTRES DU CATALOGUE ===================== */
/* Barre de filtres par catégorie, centrée et avec retour à la ligne si nécessaire */
.filtres {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap; /* Les boutons passent à la ligne sur petit écran */
}

/* Style des boutons de catégorie */
.btn-filtre {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid transparent;
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-filtre:hover {
  background: white;
  transform: translateY(-2px);
}

/* Bouton de catégorie active : bordure violette */
.btn-filtre.active {
  background: white;
  border-color: #667eea;
  color: #667eea;
}

/* ===================== BARRE DE RECHERCHE ===================== */
/* Champ de recherche centré, fond blanc, largeur max limitée */
.input-recherche {
  display: block;
  width: 100%;
  max-width: 600px;
  margin: 0 auto 20px;
  padding: 15px 20px;
  font-size: 16px;
  border: none;
  border-radius: 50px;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* ===================== GRILLE DES CARTES VOYAGES ===================== */
/* Grille responsive : colonnes de 300px minimum, remplit automatiquement l'espace */
.voyages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

/* Carte voyage : fond blanc avec coins arrondis et ombre */
.voyage-card {
  background: white;
  border-radius: 15px;
  overflow: hidden; /* Cache les coins de l'image qui dépassent */
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* La carte monte légèrement au survol */
.voyage-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

/* Image de la carte : toujours la même hauteur, recadrée si nécessaire */
.voyage-img {
  width: 100%;
  height: 200px;
  object-fit: cover; /* Recadre sans déformer l'image */
}

.voyage-content {
  padding: 20px;
}

.voyage-titre {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.voyage-destination {
  color: #667eea;
  font-weight: 500;
  margin-bottom: 10px;
}

.voyage-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
  line-height: 1.5;
}

/* Pied de la carte : prix à gauche, durée à droite */
.voyage-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.voyage-prix {
  font-size: 22px;
  font-weight: 700;
  color: #667eea;
}

.voyage-duree {
  color: #999;
  font-size: 14px;
}

.voyage-note {
  margin-top: 10px;
  color: #ffa500; /* Orange pour les étoiles */
  font-weight: 600;
}

/* ===================== PAGE DÉTAIL ===================== */
/* Bouton "← Retour" simple */
.btn-retour {
  background: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 20px;
  transition: all 0.3s;
}

.btn-retour:hover {
  background: #f0f0f0;
}

/* Conteneur principal du détail : fond blanc, coins arrondis */
.detail-header {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* Grande image en haut du détail */
.detail-img {
  width: 100%;
  height: 400px;
  object-fit: cover;
}

.detail-info {
  padding: 40px;
}

.detail-titre {
  font-size: 36px;
  color: #333;
  margin-bottom: 15px;
}

.detail-destination {
  font-size: 20px;
  color: #667eea;
  font-weight: 600;
  margin-bottom: 20px;
}

.detail-description {
  font-size: 18px;
  color: #666;
  line-height: 1.8;
  margin-bottom: 30px;
}

/* Grille des caractéristiques : s'adapte automatiquement en colonnes */
.detail-specs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

/* Chaque spécification dans un bloc gris clair */
.spec {
  background: #f8f8f8;
  padding: 15px;
  border-radius: 8px;
  font-size: 16px;
}

.spec strong {
  color: #667eea;
}

/* Bloc "Inclus dans le voyage" en bleu très clair */
.inclus {
  background: #f0f4ff;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
}

.inclus h3 {
  color: #667eea;
  margin-bottom: 15px;
}

.inclus ul {
  list-style: none;
  padding-left: 0;
}

.inclus li {
  padding: 8px 0;
  border-bottom: 1px solid #ddd;
}

.inclus li:last-child {
  border-bottom: none;
}

/* Conteneur de la vidéo YouTube */
.video-container {
  margin: 30px 0;
}

.video-container h3 {
  color: #667eea;
  margin-bottom: 15px;
}

/* Iframe vidéo en pleine largeur */
.video-player {
  width: 100%;
  height: 400px;
  border-radius: 10px;
}

/* Bouton "Réserver" : fond violet, pleine largeur */
.btn-reserver {
  width: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 18px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-reserver:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* ===================== PAGE RÉSERVATION ===================== */
/* Carte blanche centrée pour le formulaire */
.reservation-card {
  background: white;
  border-radius: 15px;
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.reservation-card h2 {
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

/* Formulaire en colonne avec espacement entre les champs */
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Ligne du formulaire : 2 champs côte à côte */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* Groupe label + input */
.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

/* Style des inputs et textareas */
.form-group input,
.form-group textarea {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Poppins', sans-serif;
  transition: all 0.3s;
}

/* Bordure violette quand un champ est actif */
.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

/* Bloc du prix total : fond bleu clair, texte violet */
.prix-total {
  background: #f0f4ff;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  font-size: 24px;
  color: #667eea;
}

/* Bouton de soumission : fond violet dégradé */
.btn-submit {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 15px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

/* Effet flottant au survol (sauf si désactivé) */
.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Bouton désactivé : grisé, pas de curseur pointer */
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Message de succès : fond vert clair, texte vert foncé */
.message-succes {
  background: #d4edda;
  color: #155724;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  margin-top: 20px;
  font-weight: 500;
}

/* ===================== PAGE CONTACT (ancienne grille) ===================== */
/* Grille 2 colonnes pour l'ancienne version de la page contact */
.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-top: 40px;
}

.contact-info,
.contact-form {
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.contact-info h3 {
  color: #667eea;
  margin-bottom: 10px;
  margin-top: 20px;
}

.contact-info h3:first-child {
  margin-top: 0;
}

.contact-info p {
  color: #666;
  line-height: 1.8;
}

.contact-form h3 {
  color: #333;
  margin-bottom: 20px;
}

/* ===================== AVIS CLIENTS ===================== */
/* Section des avis sur la page détail d'un voyage */
.avis-section {
  background: #f8f9ff;
  padding: 30px;
  border-radius: 15px;
  margin-bottom: 30px;
}

.avis-section h3 {
  color: #667eea;
  font-size: 24px;
  margin-bottom: 25px;
}

/* Grille des avis : 1 colonne (avis les uns sous les autres) */
.avis-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

/* Carte d'avis individuelle */
.avis-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.avis-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* En-tête d'avis : auteur à gauche, note à droite */
.avis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

/* Auteur : avatar + nom + date, côte à côte */
.avis-auteur {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Avatar circulaire violet avec emoji */
.avis-avatar {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.avis-auteur strong {
  color: #333;
  font-size: 16px;
  display: block;
}

.avis-date {
  color: #999;
  font-size: 13px;
  margin-top: 3px;
}

/* Note en étoiles orange */
.avis-note {
  color: #ffa500;
  font-size: 18px;
  font-weight: 600;
}

/* Texte de l'avis */
.avis-texte {
  color: #555;
  line-height: 1.7;
  font-size: 15px;
  margin: 0;
}

/* ===================== PAGE PROJET ===================== */
.projet-card {
  background: white;
  border-radius: 15px;
  padding: 50px;
  margin: 0 auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.projet-content {
  color: #333;
}

/* Chaque section du projet séparée par une ligne horizontale */
.projet-section {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 2px solid #f0f0f0;
}

.projet-section:last-child {
  border-bottom: none;
}

.projet-section h3 {
  color: #667eea;
  font-size: 28px;
  margin-bottom: 20px;
}

.projet-section p {
  line-height: 1.8;
  font-size: 16px;
  margin-bottom: 15px;
}

.projet-section ul {
  list-style: none;
  padding-left: 0;
}

/* Chaque élément de liste avec une coche "✓" colorée en violet */
.projet-section li {
  padding: 10px 0;
  padding-left: 30px;
  position: relative;
}

.projet-section li:before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: bold;
  font-size: 18px;
}

/* ===================== GRILLES TECH ET FEATURES ===================== */
/* Grille 2 colonnes pour Frontend / Backend */
.tech-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

/* Carte avec bordure gauche violette */
.tech-card {
  background: #f8f9ff;
  padding: 25px;
  border-radius: 10px;
  border-left: 4px solid #667eea;
}

.tech-card h4 {
  color: #667eea;
  margin-bottom: 15px;
  font-size: 20px;
}

/* Grille des fonctionnalités : colonnes de 250px minimum */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

/* Chaque fonctionnalité dans un bloc centré */
.feature-item {
  background: #f8f9ff;
  padding: 25px;
  border-radius: 10px;
  text-align: center;
  transition: all 0.3s;
}

.feature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

/* Grande icône emoji au-dessus du texte */
.feature-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 15px;
}

.feature-item h4 {
  color: #667eea;
  margin-bottom: 10px;
  font-size: 18px;
}

.feature-item p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

/* ===================== ARCHITECTURE ===================== */
/* Bloc avec bordure gauche mauve (couleur secondaire) */
.architecture-box {
  background: #f8f9ff;
  padding: 25px;
  border-radius: 10px;
  border-left: 4px solid #764ba2;
}

.architecture-box p {
  margin-bottom: 15px;
}

/* ===================== STATISTIQUES ===================== */
/* Grille de 4 cases côte à côte */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 20px;
}

/* Carte stat : fond violet dégradé, chiffre grand et blanc */
.stat-card {
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* Grand chiffre en gras */
.stat-number {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 16px;
  opacity: 0.9;
}

/* ===================== INFOS DÉVELOPPEUR ===================== */
.developer-info {
  background: #f8f9ff;
  padding: 25px;
  border-radius: 10px;
  border-left: 4px solid #667eea;
}

.developer-info p {
  margin: 10px 0;
}

/* ===================== PIED DE PAGE DU PROJET ===================== */
.projet-footer {
  text-align: center;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid #f0f0f0;
}

.projet-footer p {
  color: #667eea;
  font-weight: 600;
  margin: 10px 0;
}

/* ===================== FOOTER GLOBAL ===================== */
/* Pied de page du site : fond blanc semi-transparent */
.footer {
  background: rgba(255, 255, 255, 0.95);
  padding: 30px 0;
  margin-top: 60px;
  text-align: center;
  color: #666;
}

.footer p {
  margin: 5px 0;
}

/* ===================== AUCUN RÉSULTAT ===================== */
/* Message centré en blanc quand aucun voyage ne correspond aux filtres */
.no-results {
  text-align: center;
  padding: 60px 20px;
  color: white;
  font-size: 20px;
}

/* ===================== RESPONSIVE MOBILE ===================== */
/* À partir de 768px de large (tablette/mobile), on passe en 1 colonne */
@media (max-width: 768px) {
  /* Titre hero plus petit sur mobile */
  .hero-title {
    font-size: 36px;
  }

  .hero-subtitle {
    font-size: 18px;
  }

  /* Catalogue en 1 colonne sur mobile */
  .voyages-grid {
    grid-template-columns: 1fr;
  }

  /* Formulaires en 1 colonne sur mobile */
  .form-row {
    grid-template-columns: 1fr;
  }

  /* Contact en 1 colonne sur mobile */
  .contact-grid {
    grid-template-columns: 1fr;
  }

  /* Specs détail en 1 colonne sur mobile */
  .detail-specs {
    grid-template-columns: 1fr;
  }

  /* Header en colonne sur mobile : logo au-dessus, nav en dessous */
  .header .container {
    flex-direction: column;
    gap: 15px;
  }

  .nav {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  /* Tech grid en 1 colonne sur mobile */
  .tech-grid {
    grid-template-columns: 1fr;
  }

  /* Features en 1 colonne sur mobile */
  .features-grid {
    grid-template-columns: 1fr;
  }

  /* Stats : 2 colonnes sur mobile (au lieu de 4) */
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  /* Moins de padding sur mobile */
  .projet-card {
    padding: 30px 20px;
  }

  /* Sélecteur de dates en 1 colonne sur mobile */
  .dates-grid {
    grid-template-columns: 1fr;
  }
}

/* ===================== AVIS — ÉTATS CHARGEMENT / VIDE ===================== */
/* Texte en italique gris pendant le chargement ou si aucun avis */
.avis-loading,
.avis-vide {
  color: #999;
  font-style: italic;
  text-align: center;
  padding: 20px;
}

/* ===================== FORMULAIRE D'AVIS ===================== */
/* Section du formulaire pour poster un avis, séparée par une ligne */
.avis-form-section {
  margin-top: 30px;
  padding-top: 25px;
  border-top: 2px solid #e8ecff;
}

.avis-form-section h4 {
  color: #667eea;
  font-size: 20px;
  margin-bottom: 20px;
}

.avis-form {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* ===================== SÉLECTEUR D'ÉTOILES ===================== */
/* Rangée de 5 étoiles cliquables pour noter de 1 à 5 */
.note-selector {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
}

/* Étoile inactive : transparente (opacity 0.25) */
.btn-etoile {
  background: none;
  border: none;
  font-size: 26px;
  cursor: pointer;
  padding: 0;
  opacity: 0.25;
  transition: opacity 0.15s;
  line-height: 1;
}

/* Étoile active (note sélectionnée) : opaque */
.btn-etoile.active {
  opacity: 1;
}

.btn-etoile:hover {
  opacity: 0.7;
}

/* Texte "X/5" à droite des étoiles */
.note-texte {
  margin-left: 10px;
  color: #667eea;
  font-weight: 600;
  font-size: 16px;
}

/* Message après envoi d'un avis */
.message-avis {
  margin-top: 15px;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 500;
  text-align: center;
  background: #d4edda;
  color: #155724;
}

/* ===================== SECTION CHOIX DES DATES (page détail) ===================== */
/* Encadré bleu clair pour le sélecteur de dates avant réservation */
.dates-section {
  background: #f0f4ff;
  border: 2px solid #c7d2fe;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 20px;
}

.dates-section h3 {
  color: #667eea;
  font-size: 22px;
  margin-bottom: 8px;
}

.dates-hint {
  color: #888;
  font-size: 14px;
  margin-bottom: 20px;
}

/* 2 champs de date côte à côte */
.dates-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 15px;
}

/* Champ date personnalisé */
.date-input {
  padding: 12px;
  border: 2px solid #c7d2fe;
  border-radius: 8px;
  font-size: 15px;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.3s;
  background: white;
  font-family: inherit;
}

.date-input:focus {
  outline: none;
  border-color: #667eea;
}

/* Petit texte informatif sous le champ de date */
.date-label-info {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

/* Résumé des dates sélectionnées (fond vert si valides) */
.dates-resume {
  padding: 12px 16px;
  border-radius: 8px;
  background: #d4edda;
  color: #155724;
  font-weight: 500;
  font-size: 15px;
}

/* Bouton réserver grisé si les dates ne sont pas choisies */
.btn-reserver:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* ===================== SECTION AVIS ACCUEIL ===================== */
/* Section sur la page d'accueil avec effet de flou (glassmorphism) */
.home-avis-section {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px); /* Effet de verre dépoli */
  padding: 60px 20px;
  text-align: center;
}

.home-avis-section h2 {
  color: white;
  font-size: 32px;
  margin-bottom: 10px;
  font-weight: 700;
}

.home-avis-subtitle {
  color: rgba(255, 255, 255, 0.85);
  font-size: 18px;
  margin-bottom: 40px;
}

/* Grille des avis d'accueil : colonnes de 300px minimum */
.home-avis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  text-align: left;
}

/* Tag violet indiquant à quel voyage correspond l'avis */
.avis-voyage-tag {
  margin-top: 12px;
  font-size: 13px;
  color: #667eea;
  font-weight: 600;
}

/* Nombre d'avis sur les cartes du catalogue */
.avis-count {
  display: block;
  font-size: 12px;
  color: #888;
  margin-top: 4px;
  font-weight: 400;
}

/* Grille des avis d'accueil en 1 colonne sur mobile */
@media (max-width: 768px) {
  .home-avis-grid {
    grid-template-columns: 1fr;
  }
}

/* ===================== PAGE PAIEMENT ===================== */
/* Carte de paiement centrée, plus étroite que la réservation */
.paiement-card {
  background: white;
  border-radius: 15px;
  padding: 40px;
  max-width: 600px;
  margin: 40px auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.paiement-card h2 {
  color: #333;
  font-size: 28px;
  margin-bottom: 25px;
  text-align: center;
}

/* Récapitulatif de la commande : fond bleu clair avec bordure gauche violette */
.paiement-resume {
  background: #f0f4ff;
  border-left: 4px solid #667eea;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

/* Chaque ligne du récapitulatif */
.paiement-resume-ligne {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #e0e7ff;
  font-size: 15px;
  color: #555;
}

.paiement-resume-ligne:last-child {
  border-bottom: none;
}

/* Ligne du total : séparée par une ligne violette plus épaisse */
.paiement-total-ligne {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 2px solid #667eea !important;
  border-bottom: none !important;
}

/* Montant total en grand violet */
.paiement-total {
  font-size: 24px;
  color: #667eea;
  font-weight: 700;
}

/* Groupe du numéro de carte avec icône positionnée à droite */
.carte-numero-group { position: relative; }

.carte-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

/* Champ numéro de carte : espacement entre les chiffres */
.carte-input { flex: 1; letter-spacing: 2px; font-size: 16px; }

/* Icône 💳 positionnée à l'intérieur du champ à droite */
.carte-icones {
  position: absolute;
  right: 12px;
  font-size: 20px;
}

/* Badge vert SSL pour rassurer l'utilisateur */
.securite-badge {
  text-align: center;
  color: #28a745;
  font-size: 13px;
  font-weight: 500;
  padding: 10px;
  background: #f0fff4;
  border-radius: 8px;
  border: 1px solid #c3e6cb;
  margin: 10px 0;
}

/* Bouton de paiement vert (différent du bouton violet de réservation) */
.btn-payer {
  background: linear-gradient(135deg, #28a745, #20c997) !important;
  font-size: 18px !important;
}

.btn-payer:hover:not(:disabled) {
  background: linear-gradient(135deg, #218838, #1aa179) !important;
}

/* Message d'erreur : fond rouge clair, texte rouge foncé */
.message-erreur {
  background: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  margin-top: 15px;
  font-weight: 500;
}

/* ===================== PAGE CONFIRMATION ===================== */
/* Carte de confirmation centrée avec grand ✅ */
.confirmation-card {
  background: white;
  border-radius: 15px;
  padding: 60px 40px;
  max-width: 600px;
  margin: 60px auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}

/* Icône ✅ en très grand */
.confirmation-icone {
  font-size: 70px;
  margin-bottom: 20px;
}

/* Titre "Réservation Confirmée !" en vert */
.confirmation-card h2 {
  color: #28a745;
  font-size: 32px;
  margin-bottom: 15px;
}

.confirmation-texte {
  color: #666;
  font-size: 18px;
  margin-bottom: 30px;
}

/* Détails de la réservation : fond bleu clair, aligné à gauche */
.confirmation-details {
  background: #f0f4ff;
  border-radius: 10px;
  padding: 20px;
  text-align: left;
  line-height: 2;
  color: #444;
}

/* ===================== CONTACT REFAIT ===================== */
/* Grille 3 colonnes pour les blocs infos (email, tél, adresse) */
.contact-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0; /* Pas d'espace entre les blocs — les séparations sont des bordures */
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 40px;
}

/* Chaque bloc info : texte blanc centré sur fond violet */
.contact-info-item {
  padding: 40px 30px;
  text-align: center;
  color: white;
  border-right: 1px solid rgba(255,255,255,0.2); /* Séparateur entre les blocs */
}

.contact-info-item:last-child { border-right: none; }

/* Grande icône au-dessus du titre */
.contact-info-icone {
  font-size: 40px;
  margin-bottom: 12px;
}

.contact-info-item h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 10px;
  color: white;
}

.contact-info-item p {
  font-size: 14px;
  color: rgba(255,255,255,0.9);
  line-height: 1.7;
  margin: 0;
}

/* Horaires en plus petit et plus transparent */
.contact-horaires {
  font-size: 12px !important;
  color: rgba(255,255,255,0.7) !important;
  margin-top: 6px !important;
}

/* Formulaire de contact : fond blanc avec ombre */
.contact-form-section {
  background: white;
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  margin-bottom: 40px;
}

.contact-form-section h3 {
  color: #333;
  font-size: 24px;
  margin-bottom: 25px;
}

/* Menu déroulant (select) avec le même style que les inputs */
.contact-select {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  width: 100%;
  font-family: inherit;
  background: white;
  transition: border-color 0.3s;
  cursor: pointer;
}

.contact-select:focus {
  outline: none;
  border-color: #667eea;
}

/* Section réseaux sociaux en bas de la page contact */
.contact-social {
  text-align: center;
  padding: 40px 0;
}

.contact-social h3 {
  color: white;
  font-size: 22px;
  margin-bottom: 20px;
}

/* Boutons sociaux en ligne */
.social-btns {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

/* Style commun des boutons réseaux sociaux (pill shape colorés) */
.social-btn {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  color: white;
  transition: transform 0.2s, opacity 0.2s;
}

.social-btn:hover { transform: translateY(-3px); opacity: 0.9; }

/* Couleurs officielles de chaque réseau social */
.social-fb { background: #1877f2; }                                                        /* Facebook bleu */
.social-ig { background: linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); } /* Instagram dégradé */
.social-tw { background: #1da1f2; }                                                        /* Twitter bleu clair */
.social-wa { background: #25d366; }                                                        /* WhatsApp vert */

/* Responsive contact : 1 colonne sur mobile */
@media (max-width: 768px) {
  .contact-info-grid { grid-template-columns: 1fr; }
  .contact-info-item { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.2); }
  .contact-info-item:last-child { border-bottom: none; }
  .paiement-card { padding: 25px 20px; }
  .confirmation-card { padding: 40px 20px; }
}
</style>

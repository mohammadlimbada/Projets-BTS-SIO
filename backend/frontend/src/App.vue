<template>
  <div class="app">
    <!-- HEADER -->
    <header class="header">
      <div class="container">
        <h1 class="logo">✈️ Voyage Express</h1>
        <nav class="nav">
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

    <!-- PAGE ACCUEIL -->
    <div v-if="pageActive === 'home'" class="page">
      <div class="hero">
        <h1 class="hero-title">Découvrez le Monde</h1>
        <p class="hero-subtitle">80 Destinations Exceptionnelles vous attendent</p>
        <button @click="pageActive = 'catalogue'" class="btn-primary">
          Voir les Voyages
        </button>
      </div>
    </div>

    <!-- PAGE CATALOGUE -->
    <div v-if="pageActive === 'catalogue'" class="page">
      <div class="container">
        <h2 class="page-title">Nos Destinations</h2>
        
        <!-- FILTRES -->
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

        <!-- RECHERCHE -->
        <input 
          v-model="recherche" 
          type="text" 
          placeholder="🔍 Rechercher une destination..."
          class="input-recherche"
        >

        <!-- COMPTEUR -->
        <div class="compteur-voyages">
          {{ voyagesFiltres.length }} destination(s) trouvée(s)
        </div>

        <!-- LISTE DES VOYAGES -->
        <div v-if="voyagesFiltres.length === 0" class="no-results">
          Aucun voyage trouvé 😢
        </div>
        
        <div v-else class="voyages-grid">
          <div 
            v-for="voyage in voyagesFiltres" 
            :key="voyage.id"
            @click="ouvrirDetail(voyage)"
            class="voyage-card"
          >
            <img :src="voyage.image" :alt="voyage.titre" class="voyage-img">
            <div class="voyage-content">
              <h3 class="voyage-titre">{{ voyage.titre }}</h3>
              <p class="voyage-destination">📍 {{ voyage.destination }}</p>
              <p class="voyage-description">{{ voyage.description.substring(0, 80) }}...</p>
              <div class="voyage-footer">
                <span class="voyage-prix">{{ voyage.prix }}€</span>
                <span class="voyage-duree">⏱ {{ voyage.duree }} jours</span>
              </div>
              <div class="voyage-note">
                ⭐ {{ voyage.noteGlobale }} / 5
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PAGE DÉTAIL VOYAGE -->
    <div v-if="pageActive === 'detail' && voyageSelectionne" class="page">
      <div class="container">
        <button @click="pageActive = 'catalogue'" class="btn-retour">
          ← Retour
        </button>

        <div class="detail-header">
          <img :src="voyageSelectionne.image" :alt="voyageSelectionne.titre" class="detail-img">
          <div class="detail-info">
            <h2 class="detail-titre">{{ voyageSelectionne.titre }}</h2>
            <p class="detail-destination">📍 {{ voyageSelectionne.destination }}</p>
            <p class="detail-description">{{ voyageSelectionne.description }}</p>
            
            <div class="detail-specs">
              <div class="spec">
                <strong>💰 Prix:</strong> {{ voyageSelectionne.prix }}€ / personne
              </div>
              <div class="spec">
                <strong>⏱ Durée:</strong> {{ voyageSelectionne.duree }} jours
              </div>
              <div class="spec">
                <strong>📅 Départ:</strong> {{ formatDate(voyageSelectionne.dateDepart) }}
              </div>
              <div class="spec">
                <strong>📅 Retour:</strong> {{ formatDate(voyageSelectionne.dateRetour) }}
              </div>
              <div class="spec">
                <strong>🎫 Places:</strong> {{ voyageSelectionne.placesDisponibles }} disponibles
              </div>
              <div class="spec">
                <strong>⭐ Note:</strong> {{ voyageSelectionne.noteGlobale }} / 5
              </div>
            </div>

            <div class="inclus">
              <h3>✅ Inclus dans le voyage:</h3>
              <ul>
                <li v-for="item in voyageSelectionne.inclus" :key="item">
                  {{ item }}
                </li>
              </ul>
            </div>

            <!-- VIDÉO SI DISPONIBLE -->
            <div v-if="voyageSelectionne.video" class="video-container">
              <h3>🎥 Vidéo de présentation</h3>
              <iframe 
                :src="getYoutubeEmbed(voyageSelectionne.video)"
                frameborder="0"
                allowfullscreen
                class="video-player"
              ></iframe>
            </div>

            <button @click="pageActive = 'reservation'" class="btn-reserver">
              Réserver Maintenant
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- PAGE RÉSERVATION -->
    <div v-if="pageActive === 'reservation' && voyageSelectionne" class="page">
      <div class="container">
        <button @click="pageActive = 'detail'" class="btn-retour">
          ← Retour
        </button>

        <div class="reservation-card">
          <h2>Réserver : {{ voyageSelectionne.titre }}</h2>
          
          <form @submit.prevent="envoyerReservation" class="form">
            <div class="form-row">
              <div class="form-group">
                <label>Prénom *</label>
                <input v-model="form.prenom" type="text" required>
              </div>
              <div class="form-group">
                <label>Nom *</label>
                <input v-model="form.nom" type="text" required>
              </div>
            </div>

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

            <div class="form-group">
              <label>Nombre de personnes *</label>
              <input v-model.number="form.nombrePersonnes" type="number" min="1" max="10" required>
            </div>

            <div class="form-group">
              <label>Commentaires / Demandes spéciales</label>
              <textarea v-model="form.commentaires" rows="4"></textarea>
            </div>

            <div class="prix-total">
              <strong>Prix Total:</strong> 
              {{ voyageSelectionne.prix * form.nombrePersonnes }}€
            </div>

            <button type="submit" class="btn-submit" :disabled="loading">
              {{ loading ? 'Envoi en cours...' : 'Confirmer la Réservation' }}
            </button>
          </form>

          <div v-if="messageConfirmation" class="message-succes">
            {{ messageConfirmation }}
          </div>
        </div>
      </div>
    </div>

    <!-- PAGE CONTACT -->
    <div v-if="pageActive === 'contact'" class="page">
      <div class="container">
        <h2 class="page-title">Contactez-nous</h2>
        
        <div class="contact-grid">
          <div class="contact-info">
            <h3>📧 Email</h3>
            <p>mohammad.limbada97494@gmail.com</p>
            
            <h3>📞 Téléphone</h3>
            <p>+33 6 12 34 56 78</p>
            
            <h3>📍 Adresse</h3>
            <p>123 Rue du Voyage<br>75001 Paris, France</p>
            
            <h3>🕒 Horaires</h3>
            <p>Lundi - Vendredi: 9h - 18h<br>Samedi: 10h - 16h</p>
          </div>

          <div class="contact-form">
            <h3>Envoyez-nous un message</h3>
            <form @submit.prevent="envoyerMessage" class="form">
              <div class="form-group">
                <label>Nom *</label>
                <input v-model="formContact.nom" type="text" required>
              </div>
              
              <div class="form-group">
                <label>Email *</label>
                <input v-model="formContact.email" type="email" required>
              </div>
              
              <div class="form-group">
                <label>Message *</label>
                <textarea v-model="formContact.message" rows="5" required></textarea>
              </div>
              
              <button type="submit" class="btn-submit">
                Envoyer
              </button>
            </form>
            
            <div v-if="messageContactEnvoye" class="message-succes">
              Message envoyé ! Nous vous répondrons rapidement.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PAGE PROJET -->
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

    <!-- FOOTER -->
    <footer class="footer">
      <div class="container">
        <p>© 2024 Voyage Express - Projet BTS SIO SLAM</p>
        <p>✨ Développé avec Vue.js + Node.js + Express</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

// État
const pageActive = ref('home')
const voyages = ref([])
const voyageSelectionne = ref(null)
const categorieActive = ref('tous')
const recherche = ref('')
const loading = ref(false)
const messageConfirmation = ref('')
const messageContactEnvoye = ref(false)

// Catégories
const categories = [
  { value: 'tous', nom: 'Tous', icon: '🌍' },
  { value: 'plage', nom: 'Plage', icon: '🏖️' },
  { value: 'ville', nom: 'Ville', icon: '🏙️' },
  { value: 'montagne', nom: 'Montagne', icon: '⛰️' },
  { value: 'aventure', nom: 'Aventure', icon: '🎒' },
  { value: 'culturel', nom: 'Culturel', icon: '🎭' }
]

// Formulaire réservation
const form = ref({
  prenom: '',
  nom: '',
  email: '',
  telephone: '',
  nombrePersonnes: 1,
  commentaires: ''
})

// Formulaire contact
const formContact = ref({
  nom: '',
  email: '',
  message: ''
})

// Charger les voyages
const chargerVoyages = async () => {
  try {
    const response = await axios.get(`${API_URL}/voyages`, {
      params: {
        categorie: categorieActive.value,
        recherche: recherche.value
      }
    })
    voyages.value = response.data
  } catch (error) {
    console.error('Erreur chargement voyages:', error)
  }
}

// Voyages filtrés
const voyagesFiltres = computed(() => {
  let resultats = voyages.value

  // Filtre catégorie
  if (categorieActive.value !== 'tous') {
    resultats = resultats.filter(v => v.categorie === categorieActive.value)
  }

  // Filtre recherche
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

// Ouvrir détail
const ouvrirDetail = (voyage) => {
  voyageSelectionne.value = voyage
  pageActive.value = 'detail'
}

// Formater date
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Convertir URL YouTube en embed
const getYoutubeEmbed = (url) => {
  const videoId = url.split('v=')[1] || url.split('/').pop()
  return `https://www.youtube.com/embed/${videoId}`
}

// Envoyer réservation
const envoyerReservation = async () => {
  loading.value = true
  messageConfirmation.value = ''

  try {
    await axios.post(`${API_URL}/reservations`, {
      ...form.value,
      voyageId: voyageSelectionne.value.id,
      titre: voyageSelectionne.value.titre,
      destination: voyageSelectionne.value.destination,
      prix: voyageSelectionne.value.prix
    })

    messageConfirmation.value = '✅ Réservation confirmée ! Vérifiez votre email.'
    
    // Réinitialiser le formulaire
    form.value = {
      prenom: '',
      nom: '',
      email: '',
      telephone: '',
      nombrePersonnes: 1,
      commentaires: ''
    }
  } catch (error) {
    messageConfirmation.value = '❌ Erreur lors de la réservation'
    console.error('Erreur réservation:', error)
  } finally {
    loading.value = false
  }
}

// Envoyer message contact
const envoyerMessage = () => {
  console.log('Message contact:', formContact.value)
  messageContactEnvoye.value = true
  formContact.value = { nom: '', email: '', message: '' }
  
  setTimeout(() => {
    messageContactEnvoye.value = false
  }, 3000)
}

// Au montage
onMounted(() => {
  chargerVoyages()
})

// Watcher pour recharger quand catégorie/recherche change
watch([categorieActive, recherche], () => {
  chargerVoyages()
})
</script>

<style scoped>
/* HEADER */
.header {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
  margin: 0;
}

.nav {
  display: flex;
  gap: 15px;
}

.nav button {
  background: none;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s;
}

.nav button:hover {
  background: #f0f0f0;
  color: #667eea;
}

.nav button.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-projet {
  border: 2px solid #667eea !important;
  font-weight: 600 !important;
}

/* HERO */
.hero {
  text-align: center;
  padding: 100px 20px;
  color: white;
}

.hero-title {
  font-size: 56px;
  font-weight: 700;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 24px;
  margin-bottom: 40px;
  opacity: 0.9;
}

.btn-primary {
  background: white;
  color: #667eea;
  border: none;
  padding: 15px 40px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

/* PAGE */
.page {
  min-height: calc(100vh - 200px);
  padding: 40px 0;
}

.page-title {
  text-align: center;
  font-size: 42px;
  color: white;
  margin-bottom: 30px;
}

/* COMPTEUR */
.compteur-voyages {
  text-align: center;
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.2);
  padding: 10px 20px;
  border-radius: 25px;
  display: inline-block;
  margin-left: 50%;
  transform: translateX(-50%);
}

/* FILTRES */
.filtres {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

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

.btn-filtre.active {
  background: white;
  border-color: #667eea;
  color: #667eea;
}

/* RECHERCHE */
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

/* GRILLE VOYAGES */
.voyages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.voyage-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.voyage-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.voyage-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
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
  color: #ffa500;
  font-weight: 600;
}

/* DÉTAIL */
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

.detail-header {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

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

.detail-specs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.spec {
  background: #f8f8f8;
  padding: 15px;
  border-radius: 8px;
  font-size: 16px;
}

.spec strong {
  color: #667eea;
}

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

.video-container {
  margin: 30px 0;
}

.video-container h3 {
  color: #667eea;
  margin-bottom: 15px;
}

.video-player {
  width: 100%;
  height: 400px;
  border-radius: 10px;
}

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

/* RÉSERVATION */
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

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Poppins', sans-serif;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.prix-total {
  background: #f0f4ff;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  font-size: 24px;
  color: #667eea;
}

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

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message-succes {
  background: #d4edda;
  color: #155724;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  margin-top: 20px;
  font-weight: 500;
}

/* CONTACT */
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

/* PAGE PROJET */
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

/* GRILLES TECH ET FEATURES */
.tech-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

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

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

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

/* ARCHITECTURE */
.architecture-box {
  background: #f8f9ff;
  padding: 25px;
  border-radius: 10px;
  border-left: 4px solid #764ba2;
}

.architecture-box p {
  margin-bottom: 15px;
}

/* STATS */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.stat-number {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 16px;
  opacity: 0.9;
}

/* DEVELOPER INFO */
.developer-info {
  background: #f8f9ff;
  padding: 25px;
  border-radius: 10px;
  border-left: 4px solid #667eea;
}

.developer-info p {
  margin: 10px 0;
}

/* FOOTER PROJET */
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

/* FOOTER */
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

/* NO RESULTS */
.no-results {
  text-align: center;
  padding: 60px 20px;
  color: white;
  font-size: 20px;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .hero-title {
    font-size: 36px;
  }

  .hero-subtitle {
    font-size: 18px;
  }

  .voyages-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .contact-grid {
    grid-template-columns: 1fr;
  }

  .detail-specs {
    grid-template-columns: 1fr;
  }

  .header .container {
    flex-direction: column;
    gap: 15px;
  }

  .nav {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .tech-grid {
    grid-template-columns: 1fr;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .projet-card {
    padding: 30px 20px;
  }
}
</style>
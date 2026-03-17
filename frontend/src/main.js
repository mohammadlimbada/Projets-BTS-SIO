// ================================================
// FICHIER : main.js
// RÔLE    : Point d'entrée de l'application Vue.js
//           C'est le premier fichier exécuté par Vite
//           au démarrage. Il initialise l'appli Vue et
//           l'attache au HTML (dans le <div id="app">).
// ================================================

// Importe la fonction createApp depuis la librairie Vue.js
// createApp sert à créer une instance de l'application
import { createApp } from 'vue'

// Importe le composant racine App.vue
// C'est lui qui contient toute l'interface : header, pages, formulaires, etc.
import App from './App.vue'

// Importe les styles globaux (reset CSS, police Poppins, fond violet)
import './style.css'

// Crée l'application Vue avec App.vue comme composant racine,
// puis la "monte" dans le <div id="app"> de index.html.
// À partir de ce moment, Vue prend le contrôle du DOM.
createApp(App).mount('#app')

// Importe le framework Express, qui facilite la création d'applications web en Node.js
const express = require('express');
// Importe le module Mongoose pour la communication avec la base de données MongoDB
const mongoose = require('mongoose');
// Import de helmet pour sécuriser les en-têtes HTTP.
const helmet = require('helmet');
//Import mongoSanitize pour sécuriser les données entrantes dans une application Express.js
const mongoSanitize = require('express-mongo-sanitize');

// Charge les variables d'environnement depuis un fichier .env
require('dotenv').config()

// Importe les routes pour les feedback et les utilisateurs
const feedbackRoutes = require('./routes/feedback')
const userRoutes = require('./routes/user')

// Établit la connexion à la base de données MongoDB en utilisant l'URI stockée dans la variable d'environnement
mongoose.connect(process.env.MONGO_URI,
  { useNewUrlParser: true,
    useUnifiedTopology: true 
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

  // Crée une instance d'Express
const app = express();

// Utilise le middleware pour analyser les requêtes au format JSON
app.use(express.json());
// Utilise Helmet pour configurer les en-têtes de sécurité
app.use(helmet({
  crossOriginResourcePolicy: {policy: "same-site"},
  crossOriginEmbedderPolicy: {policy: "require-corp"}
}));

// Configure les en-têtes de réponse pour permettre les requêtes cross-origin (CORS)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Utilise mongoSantize pour sécuriser les données entrantes
app.use(mongoSanitize());

app.use('/api/feedback', feedbackRoutes);
app.use('/api/auth', userRoutes);

// Route de gestion des erreurs pour les URL non définies
app.use((req, res, next) => {
  res.status(404).json({ message: "Page not found" });
});

// Exporte l'application Express configurée pour être utilisée ailleurs dans votre code
module.exports = app;
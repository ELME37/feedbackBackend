// Importe le module Mongoose pour interagir avec MongoDB
const mongoose = require('mongoose');

// Définit le schéma de données pour les livres
const feedbackSchema = mongoose.Schema({
    userId: { type: String, required: true }, // Champ pour l'ID de l'utilisateur qui reçoit la recommandation
    firstName: { type: String, required: true }, // Prénom de la personne donnant le feedback
    lastName: { type: String, required: true }, // Nom de la personne donnant le feedback
    position: { type: String, required: true }, // Poste occupé par la personne donnant le feedback
    company: { type: String, required: true }, // Nom de l'entreprise de la personne donnant le feedback
    relationship: { type: String, required: true }, // Relation avec le membre recommandé
    recommendation: { type: String, required: true } // Recommandation donnée
});

// Exporte le modèle Feedback basé sur le schéma feedbackSchema pour une utilisation ultérieure
module.exports = mongoose.model('Feedback', feedbackSchema);
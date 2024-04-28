// Importe le module Mongoose pour interagir avec MongoDB
const mongoose = require('mongoose');
// Importe le plugin mongoose-unique-validator
const uniqueValidator = require('mongoose-unique-validator')

// Définit le schéma de données pour les utilisateurs
const userSchema = mongoose.Schema({
    firstName: { type: String, required: true }, // Champ pour le prénom, requis
    lastName: { type: String, required: true }, // Champ pour le nom, requis
    email : { type: String, required: true, unique : true }, // Champ pour l'adresse e-mail, requis et unique
    password : { type: String, required: true }, // Champ pour le mot de passe, requis
});

// Applique le plugin uniqueValidator pour gérer la contrainte d'unicité sur le champ 'email'
userSchema.plugin(uniqueValidator);

// Exporte le modèle User basé sur le schéma userSchema pour une utilisation ultérieure
module.exports = mongoose.model('User', userSchema);
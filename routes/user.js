// Importe le module Express.js
const express = require('express');
// Crée un routeur Express
const router = express.Router();
// Importe le contrôleur utilisateur
const userCtrl = require('../controllers/user');

// Définit les routes pour l'inscription et la connexion des utilisateurs
// Route GET pour rechercher un utilisateur
router.get('/:userId', userCtrl.checkUserId);

// Route GET pour vérifier le token
router.get('/');

// Route POST pour l'inscription des utilisateurs
router.post('/signup', userCtrl.signup);
// Route POST pour la connexion des utilisateurs
router.post('/login', userCtrl.login);  
// Route POST pour la déconnexion des utilisateurs
router.post('/logout', userCtrl.logout);
// Route POST pour demander la réinitialisation du mot de passe
router.post('/forgotPassword', userCtrl.forgotPassword);
// Route POST pour réinitialiser le mot de passe
router.post('/resetPassword/:userId/:token', userCtrl.resetPassword);

module.exports = router;
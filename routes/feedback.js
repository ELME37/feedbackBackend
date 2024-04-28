// Importe le module Express.js
const express = require('express');
// Crée un routeur Express
const router = express.Router();
// Importe le middleware d'authentification
const auth = require('../middleware/auth');
// Importe le contrôleur pour les opérations liées aux feedback
const feedbackCtrl = require('../controllers/feedback');

// Définit les routes pour les opérations sur les feedback
// Route GET pour obtenir la liste de tous les feedback d'un utilisateur
router.get('/:userId', auth, feedbackCtrl.getAllFeedback);

// Route POST pour créer un nouveau feedback
router.post('/:userId', feedbackCtrl.createFeedback);

 // Route DELETE pour supprimer un feedback par son ID
router.delete('/:id', auth, feedbackCtrl.deleteFeedback);

// Exporte le routeur pour une utilisation ultérieure
module.exports = router;
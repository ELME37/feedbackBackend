// Importe le modèle de données des feedback
const Feedback = require('../models/Feedback');
// Création d'un nouveau feedback
exports.createFeedback = (req, res, next) => {
    // Parse les données du feedback depuis le corps de la requête
    const feedbackObject = req.body;
    // Supprime l'ID du feedback s'il existe
    delete feedbackObject._id;
  
    // Récupère l'ID de l'utilisateur à partir des paramètres de la requête
    const userId = req.params.userId;
  
    // Crée une nouvelle instance de feedback avec les données du feedback et l'ID de l'utilisateur
    const feedback = new Feedback({
      ...feedbackObject,
      userId: userId,
    });
  
    // Enregistre le feedback dans la base de données
    feedback.save()
      .then(() => { res.status(201).json({ message: "Feedback enregistré !" }) })
      .catch(error => { res.status(400).json({ error }) });
};

// Suppression d'un feedback existant
exports.deleteFeedback = (req, res, next) => {
  Feedback.findOne({ _id: req.params.id })
    .then(feedback => {
      if (feedback.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' }); // Vérifie si l'utilisateur est autorisé à supprimer ce feedback
      } else {
          // Supprime le feedback de la base de données
          Feedback.deleteOne({ _id: req.params.id })
            .then(() => { res.status(204).json({ message: 'Feedback supprimé !' }) })
            .catch(error => res.status(401).json({ error }));
      }
    })
    .catch(error => { res.status(500).json({ error }) });
}

// Récupération de tous les feedback
exports.getAllFeedback = (req, res, next) => {
  const userId = req.params.userId; // Récupère l'ID de l'utilisateur depuis les paramètres de la requête

  // Recherche tous les feedbacks associés à l'ID de l'utilisateur
  Feedback.find({ userId: userId })
      .then(feedbacks => {
          res.status(200).json(feedbacks);
      })
      .catch(error => res.status(500).json({ error }));
}

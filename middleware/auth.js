// Importe le module JSON Web Tokens (JWT)
const jwt = require('jsonwebtoken');
// Charge les variables d'environnement depuis un fichier .env
require('dotenv').config();

// Middleware d'authentification
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // Récupère le token JWT depuis les en-têtes de la requête
        const decodedToken = jwt.verify(token, process.env.PRIVATE_KEY); // Décodage et vérification du token en utilisant la clé privée définie dans les variables d'environnement
        const userId = decodedToken.userId; // Extraction de l'ID de l'utilisateur à partir du token décodé
        req.auth = {
            userId: userId
        };
        next(); // Passe au middleware suivant ou à la route suivante
    }
    catch (error) {
        res.status(401).json({ error }); // En cas d'erreur de décodage ou d'absence de token valide, renvoie une réponse d'erreur avec un code HTTP 401 (Non autorisé)
    }
};
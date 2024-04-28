// Importe le module bcrypt pour hacher les mots de passe
const bcrypt = require('bcrypt');
// Importe le module jsonwebtoken pour gérer les tokens JWT
const jwt = require('jsonwebtoken');
// Importe le modèle User qui représente les utilisateurs
const User = require('../models/User');

const nodemailer = require('nodemailer');

// Charge les variables d'environnement depuis un fichier .env
require('dotenv').config();

// Fonction de validation d'une adresse e-mail
const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/; // Expression régulière pour valider l'e-mail
    return emailRegex.test(email); // Vérifie si l'e-mail correspond au format attendu
};

// Fonction de validation d'un mot de passe
const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/; // Expression régulière pour valider le mot de passe
    return passwordRegex.test(password); // Vérifie si le mot de passe respecte les critères de complexité
};

// Fonction qui gère l'inscription d'un nouvel utilisateur.
exports.signup = (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;

     // Validation du prénom et du nom
    if (firstName.length < 2 || lastName.length < 2) {
        return res.status(400).json({ message: 'Le prénom et le nom doivent contenir au moins 2 caractères' });
    }

    // Valide l'adresse e-mail en utilisant une expression régulière
    if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Adresse e-mail invalide' });
    }

    // Valide le mot de passe en utilisant une expression régulière
    if (!validatePassword(password)) {
        return res.status(400).json({ message: 'Mot de passe invalide' });
    }

    // Hache le mot de passe pour le stocker de manière sécurisée
    bcrypt.hash(password, 10)
        .then(hash => {
            // Crée un nouvel utilisateur avec l'e-mail et le mot de passe haché
            const user = new User({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: hash,
            });
            // Enregistre l'utilisateur dans la base de données
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

// Fonction qui gère la connexion d'un utilisateur.
exports.login = (req, res, next) => {
    const { email, password } = req.body;

    // Valide l'adresse e-mail en utilisant une expression régulière
    if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Adresse e-mail invalide' });
    }

    // Recherche l'utilisateur par son adresse e-mail
    User.findOne({ email: email })
        .then(user => {
            if (user === null) {
                res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' });
            } else {
                // Compare le mot de passe fourni avec le mot de passe haché stocké dans la base de données
                bcrypt.compare(password, user.password)
                    .then(valid => {
                        if (!valid) {
                            res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' });
                        } else {
                            // Si les identifiants sont valides, génère un token JWT
                            res.status(200).json({
                                userId: user._id,
                                token: jwt.sign(
                                    { userId: user._id },
                                    process.env.PRIVATE_KEY,
                                    { expiresIn: '4h' }
                                ),
                                firstName: user.firstName,
                                lastName: user.lastName,
                                email: user.email
                            });
                        }
                    })
                    .catch(error => res.status(500).json({ error }));
            }
        })
        .catch(error => res.status(500).json({ error }));
};

//Recherche d'un utilisateur
exports.checkUserId = (req, res, next) => {
    User.findOne({ _id: req.params.userId }, 'firstName lastName')
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({ firstName: user.firstName, lastName: user.lastName });
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
};

//Déconnection d'un utilisateur
exports.logout = (req, res) => {
    res.clearCookie("token").status(200).json({ message: "Logout Successful" });
};

exports.verifyToken = (req, res) => {
    try {
      const token = req.headers.authorization.split(' ')[1]; // Récupère le token JWT depuis les en-têtes de la requête
      jwt.verify(token, process.env.PRIVATE_KEY); // Vérifie le token
      res.status(200).json({ message: 'Token valide' }); // Si le token est valide, renvoie une réponse avec un code HTTP 200
    } catch (error) {
      res.status(401).json({ error: 'Token invalide ou expiré' }); // Si le token est invalide, renvoie une réponse avec un code HTTP 401
    }
  };

// Fonction pour la demande de réinitialisation de mot de passe
exports.forgotPassword = (req, res) => {
    const { email } = req.body;

    // Recherche de l'utilisateur par son adresse e-mail
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                // Si aucun utilisateur n'est trouvé, renvoyer un message générique
                return res.status(404).json({ message: 'Si cet e-mail est associé à un compte, un e-mail de réinitialisation du mot de passe a été envoyé.' });
            }
            
            // Génération d'un token JWT pour la réinitialisation de mot de passe
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            // Configuration du service de messagerie
            const transporter = nodemailer.createTransport({
                host: process.env.MAIL_HOST,
                port: process.env.MAIL_PORT,
                secure: false,
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASSWORD,
                }
            });

            // Options du couéqrriel
            const mailOptions = {
                from: 'no-reply@feedback.fr',
                to: email,
                subject: 'Lien de réinitialisation du mot de passe',
                html: `
                    <div style="font-family: Arial, sans-serif; background-color: #282828; padding: 20px;">
                        <div style="background-color: #fff; border-radius: 10px; padding: 20px;">
                            <img src="http://localhost:3000/logoFeedback.png" alt="Votre Logo" style="float: left; max-width: 200px;">
                            <h2 style="color: #333; text-align: center; margin-top: 100px; margin-bottom: 30px;">Réinitialisation du mot de passe,</h2>
                            <p style="color: #555; text-align: center;">Cliquez sur le bouton ci-dessous pour procéder à la réinitialisation :</p>
                            <div style="text-align: center; margin-top: 20px;">
                                <a href="${process.env.BASE_URL}/forgotPassword/reset/${user._id}/${token}" style="background-color: #c09e5a; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">Réinitialiser le mot de passe</a>
                            </div>
                            <p style="color: #555; text-align: center; margin-top: 20px;">Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet e-mail en toute sécurité.</p>
                        </div>
                    </div>
                `
            };

            // Envoi de l'e-mail avec le lien de réinitialisation du mot de passe
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    return res.status(500).json({ message: 'Une erreur s\'est produite lors de l\'envoi de l\'e-mail' });
                } else {
                    return res.status(200).json({ message: 'Un e-mail de réinitialisation du mot de passe a été envoyé à votre adresse' });
                }
            });
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Erreur interne du serveur' });
        });
};

    // Fonction pour la réinitialisation du mot de passe
    exports.resetPassword = (req, res) => {
        const { userId, token } = req.params;
        const { password } = req.body;

        if (!validatePassword(password)) {
            return res.status(400).json({ message: 'Mot de passe invalide' });
        }
    
        // Vérification du token JWT
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(400).json({ message: 'Token invalide' });
            } else {
                // Recherche de l'utilisateur par son ID
                User.findById(userId)
                    .then(user => {
                        if (!user) {
                            // Si aucun utilisateur correspondant à l'ID n'est trouvé, renvoyer un message générique
                            return res.status(404).json({ message: 'Réinitialisation du mot de passe échouée. Veuillez réessayer.' });
                        }
                        
                        // Hachage du nouveau mot de passe
                        bcrypt.hash(password, 10)
                            .then(hash => {
                                // Mise à jour du mot de passe dans la base de données
                                User.findByIdAndUpdate({ _id: userId }, { password: hash })
                                    .then(() => res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' }))
                                    .catch(err => res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe' }));
                            })
                            .catch(err => res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe' }));
                    })
                    .catch(err => res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe' }));
            }
        });
    };
    


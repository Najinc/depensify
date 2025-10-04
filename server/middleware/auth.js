const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware d'authentification JWT
 * Vérifie la validité du token et ajoute l'utilisateur à req.user
 * 
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express  
 * @param {Function} next - Fonction suivante
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
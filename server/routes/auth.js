const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Family } = require('../models');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Inscription d'un nouvel utilisateur
 * Le premier utilisateur devient automatiquement admin
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Nom d\'utilisateur déjà pris' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const adminExists = await User.findOne({ isAdmin: true, status: 'approved' });

    const newUser = new User({
      username,
      password: hashedPassword,
      email: email || undefined,
      role: 'admin',
      status: adminExists ? 'pending' : 'approved',
      isAdmin: !adminExists
    });

    await newUser.save();

    // Si c'est le premier utilisateur, créer sa famille
    if (!adminExists) {
      const family = new Family({
        name: `Famille de ${username}`,
        ownerId: newUser._id,
        members: [{
          userId: newUser._id,
          role: 'admin'
        }]
      });

      await family.save();

      newUser.familyId = family._id;
      await newUser.save();

      const token = jwt.sign(
        { id: newUser._id, username: newUser.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        token,
        user: { id: newUser._id, username: newUser.username },
        message: 'Compte administrateur créé avec succès !'
      });
    }

    res.status(201).json({
      message: 'Demande de compte créée ! En attente d\'approbation par un administrateur.',
      status: 'pending'
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error.code === 11000) {
      return res.status(400).json({ error: 'Nom d\'utilisateur déjà pris' });
    }

    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

/**
 * Connexion utilisateur
 * Vérifie les credentials et retourne un JWT
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis' });
    }

    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return res.status(400).json({ error: 'Utilisateur non trouvé' });
    }

    if (user.status === 'pending') {
      return res.status(403).json({
        error: 'Votre compte est en attente d\'approbation par un administrateur.',
        status: 'pending'
      });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({
        error: 'Votre demande de compte a été rejetée.',
        status: 'rejected'
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

module.exports = router;
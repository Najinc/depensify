require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://depensify_user:depensify_password_2024@localhost:27017/depensify?authSource=depensify';

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Schémas Mongoose
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  email: {
    type: String,
    sparse: true,
    trim: true,
    lowercase: true
  },
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    default: null
  },
  role: {
    type: String,
    enum: ['admin', 'member', 'viewer'],
    default: 'admin'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const familySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
    default: 'Ma Famille'
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  },
  settings: {
    allowMemberInvites: {
      type: Boolean,
      default: false
    },
    requireApprovalForJoin: {
      type: Boolean,
      default: true
    },
    defaultMemberRole: {
      type: String,
      enum: ['member', 'viewer'],
      default: 'member'
    }
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'viewer'],
      default: 'member'
    },
    permissions: {
      canAddExpenses: { type: Boolean, default: true },
      canEditOwnExpenses: { type: Boolean, default: true },
      canEditAllExpenses: { type: Boolean, default: false },
      canDeleteOwnExpenses: { type: Boolean, default: true },
      canDeleteAllExpenses: { type: Boolean, default: false },
      canViewAllExpenses: { type: Boolean, default: true },
      canInviteMembers: { type: Boolean, default: false },
      canManageMembers: { type: Boolean, default: false }
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  invitations: [{
    email: {
      type: String,
      required: true
    },
    username: {
      type: String
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'viewer'],
      default: 'member'
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    invitedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending'
    },
    token: {
      type: String,
      unique: true,
      sparse: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    default: null,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Alimentation', 'Transport', 'Restauration', 'Divertissement', 'Santé', 'Shopping', 'Éducation', 'Divers']
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index composés pour optimiser les requêtes
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ familyId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });

// Middleware pour mettre à jour updatedAt
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

familySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

expenseSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Modèles
const User = mongoose.model('User', userSchema);
const Family = mongoose.model('Family', familySchema);
const Expense = mongoose.model('Expense', expenseSchema);

// Connexion à MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion à MongoDB réussie');
  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB:', error);

    // Fallback: essayer de se connecter sans authentification
    try {
      const fallbackURI = 'mongodb://localhost:27017/depensify';
      await mongoose.connect(fallbackURI);
      console.log('✅ Connexion MongoDB réussie (mode fallback)');
    } catch (fallbackError) {
      console.error('❌ Impossible de se connecter à MongoDB:', fallbackError);
      process.exit(1);
    }
  }
}

// Middleware d'authentification
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

// Routes d'authentification
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Nom d\'utilisateur déjà pris' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Vérifier s'il y a déjà un administrateur
    const adminExists = await User.findOne({ isAdmin: true, status: 'approved' });

    // Créer le nouvel utilisateur
    const newUser = new User({
      username,
      password: hashedPassword,
      email: email || undefined,
      role: 'admin',
      status: adminExists ? 'pending' : 'approved', // Premier utilisateur = auto-approuvé et admin
      isAdmin: !adminExists // Premier utilisateur devient admin système
    });

    await newUser.save();

    // Si c'est le premier utilisateur (admin), créer sa famille
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

      // Générer le token JWT pour l'admin
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

    // Pour les autres utilisateurs, compte en attente
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

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis' });
    }

    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return res.status(400).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier le statut du compte
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

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Mot de passe incorrect' });
    }

    // Générer le token JWT
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

// Middleware pour vérifier les droits admin
function requireAdmin(req, res, next) {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  next();
}

// Middleware pour vérifier les permissions familiales
async function checkFamilyPermission(permission) {
  return async (req, res, next) => {
    try {
      if (!req.user.familyId) {
        return res.status(403).json({ error: 'Vous devez appartenir à une famille pour effectuer cette action' });
      }

      const family = await Family.findById(req.user.familyId);
      if (!family) {
        return res.status(404).json({ error: 'Famille non trouvée' });
      }

      const member = family.members.find(m => m.userId.toString() === req.user.id);
      if (!member) {
        return res.status(403).json({ error: 'Vous n\'êtes pas membre de cette famille' });
      }

      if (!member.permissions[permission]) {
        return res.status(403).json({ error: `Permission requise: ${permission}` });
      }

      req.familyMember = member;
      req.family = family;
      next();
    } catch (error) {
      console.error('Error checking family permission:', error);
      res.status(500).json({ error: 'Erreur lors de la vérification des permissions' });
    }
  };
}

// Routes d'administration
app.get('/api/admin/pending-users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(pendingUsers);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des demandes' });
  }
});

app.post('/api/admin/approve-user/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'ID utilisateur invalide' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({ error: 'Cet utilisateur n\'est pas en attente' });
    }

    // Approuver l'utilisateur
    user.status = 'approved';
    await user.save();

    // Créer une famille pour l'utilisateur approuvé
    const family = new Family({
      name: `Famille de ${user.username}`,
      ownerId: user._id,
      members: [{
        userId: user._id,
        role: 'admin'
      }]
    });

    await family.save();

    user.familyId = family._id;
    await user.save();

    console.log(`✅ Utilisateur ${user.username} approuvé par l'administrateur`);

    res.json({
      message: `Utilisateur ${user.username} approuvé avec succès`,
      user: {
        id: user._id,
        username: user.username,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ error: 'Erreur lors de l\'approbation' });
  }
});

app.post('/api/admin/reject-user/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'ID utilisateur invalide' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({ error: 'Cet utilisateur n\'est pas en attente' });
    }

    // Rejeter l'utilisateur
    user.status = 'rejected';
    if (reason) {
      user.rejectionReason = reason;
    }
    await user.save();

    console.log(`❌ Utilisateur ${user.username} rejeté par l'administrateur`);

    res.json({
      message: `Utilisateur ${user.username} rejeté`,
      user: {
        id: user._id,
        username: user.username,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({ error: 'Erreur lors du rejet' });
  }
});

// Route pour vérifier le token
app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      id: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
      role: user.role,
      status: user.status,
      familyId: user.familyId
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
  }
});

// Routes pour les dépenses personnelles
app.get('/api/expenses', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 100, category, startDate, endDate } = req.query;

    const filter = { userId: req.user.id };

    if (category) {
      filter.category = category;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Convertir les ObjectId en strings pour le frontend
    const formattedExpenses = expenses.map(expense => ({
      ...expense,
      id: expense._id.toString(),
      userId: expense.userId.toString()
    }));

    res.json(formattedExpenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des dépenses' });
  }
});

app.post('/api/expenses', authenticateToken, async (req, res) => {
  try {
    // Vérifier les permissions familiales si l'utilisateur appartient à une famille
    if (req.user.familyId) {
      const family = await Family.findById(req.user.familyId);
      if (family) {
        const member = family.members.find(m => m.userId.toString() === req.user.id);
        if (!member || !member.permissions.canAddExpenses) {
          return res.status(403).json({ error: 'Vous n\'avez pas la permission d\'ajouter des dépenses' });
        }
      }
    }

    const { description, amount, category, date } = req.body;

    if (!description || !amount || !category || !date) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Le montant doit être positif' });
    }

    // Récupérer les informations de l'utilisateur
    const user = await User.findById(req.user.id);

    const newExpense = new Expense({
      userId: req.user.id,
      familyId: user.familyId, // Associer automatiquement à la famille
      description: description.trim(),
      amount: parseFloat(amount),
      category,
      date: new Date(date)
    });

    await newExpense.save();

    // Convertir pour le frontend
    const responseExpense = {
      ...newExpense.toObject(),
      id: newExpense._id.toString(),
      userId: newExpense.userId.toString()
    };

    res.status(201).json(responseExpense);
  } catch (error) {
    console.error('Error creating expense:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }

    res.status(500).json({ error: 'Erreur lors de la création de la dépense' });
  }
});

app.put('/api/expenses/:id', authenticateToken, async (req, res) => {
  try {
    const { description, amount, category, date } = req.body;
    const expenseId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return res.status(400).json({ error: 'ID de dépense invalide' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Le montant doit être positif' });
    }

    // Vérifier si l'utilisateur appartient à une famille et a les permissions
    let filter = { _id: expenseId };

    if (req.user.familyId) {
      const family = await Family.findById(req.user.familyId);
      if (family) {
        const member = family.members.find(m => m.userId.toString() === req.user.id);
        if (member) {
          if (member.permissions.canEditAllExpenses) {
            // Peut modifier toutes les dépenses de la famille
            filter = { _id: expenseId, familyId: req.user.familyId };
          } else if (member.permissions.canEditOwnExpenses) {
            // Peut modifier seulement ses propres dépenses
            filter = { _id: expenseId, userId: req.user.id };
          } else {
            return res.status(403).json({ error: 'Vous n\'avez pas la permission de modifier des dépenses' });
          }
        }
      }
    } else {
      // Utilisateur sans famille, peut modifier seulement ses propres dépenses
      filter = { _id: expenseId, userId: req.user.id };
    }

    const expense = await Expense.findOneAndUpdate(
      filter,
      {
        description: description.trim(),
        amount: parseFloat(amount),
        category,
        date: new Date(date),
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ error: 'Dépense non trouvée ou non autorisée' });
    }

    // Convertir pour le frontend
    const responseExpense = {
      ...expense.toObject(),
      id: expense._id.toString(),
      userId: expense.userId.toString()
    };

    res.json(responseExpense);
  } catch (error) {
    console.error('Error updating expense:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }

    res.status(500).json({ error: 'Erreur lors de la mise à jour de la dépense' });
  }
});

app.delete('/api/expenses/:id', authenticateToken, async (req, res) => {
  try {
    const expenseId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return res.status(400).json({ error: 'ID de dépense invalide' });
    }

    // Vérifier si l'utilisateur appartient à une famille et a les permissions
    let filter = { _id: expenseId };

    if (req.user.familyId) {
      const family = await Family.findById(req.user.familyId);
      if (family) {
        const member = family.members.find(m => m.userId.toString() === req.user.id);
        if (member) {
          if (member.permissions.canDeleteAllExpenses) {
            // Peut supprimer toutes les dépenses de la famille
            filter = { _id: expenseId, familyId: req.user.familyId };
          } else if (member.permissions.canDeleteOwnExpenses) {
            // Peut supprimer seulement ses propres dépenses
            filter = { _id: expenseId, userId: req.user.id };
          } else {
            return res.status(403).json({ error: 'Vous n\'avez pas la permission de supprimer des dépenses' });
          }
        }
      }
    } else {
      // Utilisateur sans famille, peut supprimer seulement ses propres dépenses
      filter = { _id: expenseId, userId: req.user.id };
    }

    const expense = await Expense.findOneAndDelete(filter);

    if (!expense) {
      return res.status(404).json({ error: 'Dépense non trouvée ou non autorisée' });
    }

    res.json({ message: 'Dépense supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la dépense' });
  }
});

// Routes familiales
app.get('/api/family/expenses', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.familyId) {
      return res.json([]);
    }

    const expenses = await Expense.find({ familyId: user.familyId })
      .populate('userId', 'username')
      .sort({ date: -1, createdAt: -1 })
      .lean();

    // Formatage pour le frontend
    const formattedExpenses = expenses.map(expense => ({
      ...expense,
      id: expense._id.toString(),
      userId: expense.userId._id.toString(),
      username: expense.userId.username
    }));

    res.json(formattedExpenses);
  } catch (error) {
    console.error('Error fetching family expenses:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des dépenses familiales' });
  }
});

app.get('/api/family/members', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.familyId) {
      return res.json([]);
    }

    const family = await Family.findById(user.familyId)
      .populate('members.userId', 'username email')
      .lean();

    if (!family) {
      return res.json([]);
    }

    const members = family.members.map(member => ({
      id: member.userId._id.toString(),
      username: member.userId.username,
      email: member.userId.email,
      role: member.role,
      joinedAt: member.joinedAt
    }));

    res.json(members);
  } catch (error) {
    console.error('Error fetching family members:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des membres' });
  }
});

app.post('/api/family/invite', authenticateToken, async (req, res) => {
  try {
    const { email, role = 'member' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    const user = await User.findById(req.user.id);
    if (!user.familyId) {
      return res.status(400).json({ error: 'Aucune famille trouvée' });
    }

    // Vérifier les permissions (seulement admin peut inviter)
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Seuls les administrateurs peuvent inviter' });
    }

    const family = await Family.findById(user.familyId);

    // Vérifier si l'invitation existe déjà
    const existingInvitation = family.invitations.find(inv =>
      inv.email === email && inv.status === 'pending'
    );

    if (existingInvitation) {
      return res.status(400).json({ error: 'Invitation déjà envoyée' });
    }

    // Ajouter l'invitation
    family.invitations.push({
      email,
      role,
      invitedBy: req.user.id,
      status: 'pending'
    });

    await family.save();

    // En production, vous enverriez un email ici
    console.log(`📧 Invitation envoyée à ${email} pour rejoindre la famille`);

    res.json({ message: 'Invitation envoyée avec succès' });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'invitation' });
  }
});

// === NOUVELLES ROUTES DE GESTION DES FAMILLES ===

// Créer une nouvelle famille
app.post('/api/family/create', authenticateToken, async (req, res) => {
  try {
    const { name, description, settings } = req.body;

    // Vérifier si l'utilisateur a déjà une famille
    if (req.user.familyId) {
      return res.status(400).json({ error: 'Vous appartenez déjà à une famille' });
    }

    // Générer un code d'invitation unique
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newFamily = new Family({
      name: name || 'Ma Famille',
      description,
      ownerId: req.user.id,
      inviteCode,
      settings: {
        allowMemberInvites: settings?.allowMemberInvites || false,
        requireApprovalForJoin: settings?.requireApprovalForJoin || true,
        defaultMemberRole: settings?.defaultMemberRole || 'member'
      },
      members: [{
        userId: req.user.id,
        role: 'admin',
        permissions: {
          canAddExpenses: true,
          canEditOwnExpenses: true,
          canEditAllExpenses: true,
          canDeleteOwnExpenses: true,
          canDeleteAllExpenses: true,
          canViewAllExpenses: true,
          canInviteMembers: true,
          canManageMembers: true
        }
      }]
    });

    await newFamily.save();

    // Mettre à jour l'utilisateur
    await User.findByIdAndUpdate(req.user.id, {
      familyId: newFamily._id,
      role: 'admin'
    });

    res.status(201).json({
      message: 'Famille créée avec succès',
      family: {
        id: newFamily._id,
        name: newFamily.name,
        description: newFamily.description,
        inviteCode: newFamily.inviteCode,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Error creating family:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la famille' });
  }
});

// Rejoindre une famille avec un code d'invitation
app.post('/api/family/join', authenticateToken, async (req, res) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return res.status(400).json({ error: 'Code d\'invitation requis' });
    }

    // Vérifier si l'utilisateur a déjà une famille
    if (req.user.familyId) {
      return res.status(400).json({ error: 'Vous appartenez déjà à une famille' });
    }

    const family = await Family.findOne({ inviteCode });
    if (!family) {
      return res.status(404).json({ error: 'Code d\'invitation invalide' });
    }

    // Vérifier si l'utilisateur est déjà membre
    const existingMember = family.members.find(member =>
      member.userId.toString() === req.user.id
    );

    if (existingMember) {
      return res.status(400).json({ error: 'Vous êtes déjà membre de cette famille' });
    }

    // Ajouter le membre
    const defaultRole = family.settings.defaultMemberRole;
    const defaultPermissions = {
      canAddExpenses: defaultRole === 'member',
      canEditOwnExpenses: true,
      canDeleteOwnExpenses: defaultRole === 'member',
      canViewAllExpenses: true,
      canEditAllExpenses: false,
      canDeleteAllExpenses: false,
      canInviteMembers: false,
      canManageMembers: false
    };

    family.members.push({
      userId: req.user.id,
      role: defaultRole,
      permissions: defaultPermissions
    });

    await family.save();

    // Mettre à jour l'utilisateur
    await User.findByIdAndUpdate(req.user.id, {
      familyId: family._id,
      role: defaultRole
    });

    res.json({
      message: `Vous avez rejoint la famille "${family.name}" avec succès`,
      family: {
        id: family._id,
        name: family.name,
        description: family.description,
        role: defaultRole
      }
    });
  } catch (error) {
    console.error('Error joining family:', error);
    res.status(500).json({ error: 'Erreur lors de l\'adhésion à la famille' });
  }
});

// Quitter une famille
app.post('/api/family/leave', authenticateToken, async (req, res) => {
  try {
    if (!req.user.familyId) {
      return res.status(400).json({ error: 'Vous n\'appartenez à aucune famille' });
    }

    const family = await Family.findById(req.user.familyId);
    if (!family) {
      return res.status(404).json({ error: 'Famille non trouvée' });
    }

    // Vérifier si l'utilisateur est le propriétaire
    if (family.ownerId.toString() === req.user.id) {
      return res.status(400).json({
        error: 'En tant que propriétaire, vous devez transférer la propriété avant de quitter la famille'
      });
    }

    // Retirer l'utilisateur de la famille
    family.members = family.members.filter(member =>
      member.userId.toString() !== req.user.id
    );

    await family.save();

    // Mettre à jour l'utilisateur
    await User.findByIdAndUpdate(req.user.id, {
      familyId: null,
      role: 'admin'
    });

    res.json({ message: 'Vous avez quitté la famille avec succès' });
  } catch (error) {
    console.error('Error leaving family:', error);
    res.status(500).json({ error: 'Erreur lors de la sortie de la famille' });
  }
});

// Obtenir les détails de sa famille
app.get('/api/family/details', authenticateToken, async (req, res) => {
  try {
    // Récupérer les données utilisateur fraîches depuis la BD
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (!user.familyId) {
      return res.json({ family: null });
    }

    const family = await Family.findById(user.familyId)
      .populate('members.userId', 'username createdAt')
      .populate('ownerId', 'username');

    if (!family) {
      return res.status(404).json({ error: 'Famille non trouvée' });
    }

    // Trouver les permissions de l'utilisateur actuel
    const currentMember = family.members.find(member =>
      member.userId._id.toString() === req.user.id
    );

    res.json({
      family: {
        id: family._id,
        name: family.name,
        description: family.description,
        inviteCode: family.inviteCode,
        owner: family.ownerId,
        settings: family.settings,
        members: family.members.map(member => ({
          id: member.userId._id,
          username: member.userId.username,
          role: member.role,
          joinedAt: member.joinedAt,
          permissions: member.permissions
        })),
        invitations: family.invitations.filter(inv => inv.status === 'pending'),
        myRole: currentMember?.role,
        myPermissions: currentMember?.permissions,
        isOwner: family.ownerId._id.toString() === req.user.id,
        createdAt: family.createdAt,
        updatedAt: family.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching family details:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des détails de la famille' });
  }
});

// Mettre à jour les paramètres de la famille (propriétaire seulement)
app.put('/api/family/settings', authenticateToken, async (req, res) => {
  try {
    const { name, description, settings } = req.body;

    if (!req.user.familyId) {
      return res.status(400).json({ error: 'Vous n\'appartenez à aucune famille' });
    }

    const family = await Family.findById(req.user.familyId);
    if (!family) {
      return res.status(404).json({ error: 'Famille non trouvée' });
    }

    // Vérifier si l'utilisateur est le propriétaire
    if (family.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Seul le propriétaire peut modifier les paramètres' });
    }

    // Mettre à jour les champs
    if (name) family.name = name;
    if (description !== undefined) family.description = description;
    if (settings) {
      family.settings = { ...family.settings, ...settings };
    }

    await family.save();

    res.json({ message: 'Paramètres de la famille mis à jour avec succès' });
  } catch (error) {
    console.error('Error updating family settings:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres' });
  }
});

// Gérer les rôles et permissions des membres (admin seulement)
app.put('/api/family/member/:memberId/role', authenticateToken, async (req, res) => {
  try {
    const { memberId } = req.params;
    const { role, permissions } = req.body;

    if (!req.user.familyId) {
      return res.status(400).json({ error: 'Vous n\'appartenez à aucune famille' });
    }

    const family = await Family.findById(req.user.familyId);
    if (!family) {
      return res.status(404).json({ error: 'Famille non trouvée' });
    }

    // Vérifier les permissions de l'utilisateur actuel
    const currentMember = family.members.find(member =>
      member.userId.toString() === req.user.id
    );

    if (!currentMember || !currentMember.permissions.canManageMembers) {
      return res.status(403).json({ error: 'Vous n\'avez pas la permission de gérer les membres' });
    }

    // Trouver le membre à modifier
    const memberToUpdate = family.members.find(member =>
      member.userId.toString() === memberId
    );

    if (!memberToUpdate) {
      return res.status(404).json({ error: 'Membre non trouvé' });
    }

    // Ne pas permettre de modifier le propriétaire
    if (family.ownerId.toString() === memberId) {
      return res.status(400).json({ error: 'Impossible de modifier le rôle du propriétaire' });
    }

    // Mettre à jour le rôle et les permissions
    if (role) memberToUpdate.role = role;
    if (permissions) memberToUpdate.permissions = { ...memberToUpdate.permissions, ...permissions };

    await family.save();

    // Mettre à jour aussi dans la collection User
    await User.findByIdAndUpdate(memberId, { role: role || memberToUpdate.role });

    res.json({ message: 'Rôle du membre mis à jour avec succès' });
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du rôle' });
  }
});

// Retirer un membre de la famille (admin seulement)
app.delete('/api/family/member/:memberId', authenticateToken, async (req, res) => {
  try {
    const { memberId } = req.params;

    if (!req.user.familyId) {
      return res.status(400).json({ error: 'Vous n\'appartenez à aucune famille' });
    }

    const family = await Family.findById(req.user.familyId);
    if (!family) {
      return res.status(404).json({ error: 'Famille non trouvée' });
    }

    // Vérifier les permissions
    const currentMember = family.members.find(member =>
      member.userId.toString() === req.user.id
    );

    if (!currentMember || !currentMember.permissions.canManageMembers) {
      return res.status(403).json({ error: 'Vous n\'avez pas la permission de retirer des membres' });
    }

    // Ne pas permettre de retirer le propriétaire
    if (family.ownerId.toString() === memberId) {
      return res.status(400).json({ error: 'Impossible de retirer le propriétaire' });
    }

    // Retirer le membre
    family.members = family.members.filter(member =>
      member.userId.toString() !== memberId
    );

    await family.save();

    // Mettre à jour l'utilisateur retiré
    await User.findByIdAndUpdate(memberId, {
      familyId: null,
      role: 'admin'
    });

    res.json({ message: 'Membre retiré de la famille avec succès' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Erreur lors du retrait du membre' });
  }
});

// Transférer la propriété de la famille
app.post('/api/family/transfer-ownership', authenticateToken, async (req, res) => {
  try {
    const { newOwnerId } = req.body;

    if (!req.user.familyId) {
      return res.status(400).json({ error: 'Vous n\'appartenez à aucune famille' });
    }

    const family = await Family.findById(req.user.familyId);
    if (!family) {
      return res.status(404).json({ error: 'Famille non trouvée' });
    }

    // Vérifier si l'utilisateur est le propriétaire actuel
    if (family.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Seul le propriétaire peut transférer la propriété' });
    }

    // Vérifier que le nouveau propriétaire est membre de la famille
    const newOwnerMember = family.members.find(member =>
      member.userId.toString() === newOwnerId
    );

    if (!newOwnerMember) {
      return res.status(400).json({ error: 'Le nouveau propriétaire doit être membre de la famille' });
    }

    // Transférer la propriété
    family.ownerId = newOwnerId;

    // Mettre à jour les rôles et permissions
    family.members.forEach(member => {
      if (member.userId.toString() === newOwnerId) {
        member.role = 'admin';
        member.permissions = {
          canAddExpenses: true,
          canEditOwnExpenses: true,
          canEditAllExpenses: true,
          canDeleteOwnExpenses: true,
          canDeleteAllExpenses: true,
          canViewAllExpenses: true,
          canInviteMembers: true,
          canManageMembers: true
        };
      } else if (member.userId.toString() === req.user.id) {
        member.role = 'member';
        member.permissions = {
          canAddExpenses: true,
          canEditOwnExpenses: true,
          canEditAllExpenses: false,
          canDeleteOwnExpenses: true,
          canDeleteAllExpenses: false,
          canViewAllExpenses: true,
          canInviteMembers: false,
          canManageMembers: false
        };
      }
    });

    await family.save();

    // Mettre à jour les utilisateurs
    await User.findByIdAndUpdate(newOwnerId, { role: 'admin' });
    await User.findByIdAndUpdate(req.user.id, { role: 'member' });

    res.json({ message: 'Propriété de la famille transférée avec succès' });
  } catch (error) {
    console.error('Error transferring ownership:', error);
    res.status(500).json({ error: 'Erreur lors du transfert de propriété' });
  }
});

// Route pour servir l'application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gestion des erreurs MongoDB
mongoose.connection.on('error', (err) => {
  console.error('Erreur MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB déconnecté');
});

// Fermeture propre
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  await mongoose.connection.close();
  console.log('✅ Connexion MongoDB fermée');
  process.exit(0);
});

// Démarrer le serveur
async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Serveur en cours d'exécution sur http://localhost:${PORT}`);
      console.log('👨‍👩‍👧‍👦 Application Depensify Familiale prête avec MongoDB !');
      console.log('🐳 Interface MongoDB Express: http://localhost:8081');
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

startServer();
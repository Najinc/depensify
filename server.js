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

// Index composé pour optimiser les requêtes
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });

// Middleware pour mettre à jour updatedAt
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

expenseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Modèles
const User = mongoose.model('User', userSchema);
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
    
    // Créer le nouvel utilisateur
    const newUser = new User({
      username,
      password: hashedPassword,
      email: email || undefined
    });

    await newUser.save();

    // Générer le token JWT
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: newUser._id, username: newUser.username }
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

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Mot de passe incorrect' });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, username: user.username }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Route pour vérifier le token
app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json({ id: user._id, username: user.username });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
  }
});

// Routes pour les dépenses
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
    const { description, amount, category, date } = req.body;

    if (!description || !amount || !category || !date) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Le montant doit être positif' });
    }

    const newExpense = new Expense({
      userId: req.user.id,
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

    const expense = await Expense.findOneAndUpdate(
      { _id: expenseId, userId: req.user.id },
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
      return res.status(404).json({ error: 'Dépense non trouvée' });
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

    const expense = await Expense.findOneAndDelete({
      _id: expenseId,
      userId: req.user.id
    });

    if (!expense) {
      return res.status(404).json({ error: 'Dépense non trouvée' });
    }

    res.json({ message: 'Dépense supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la dépense' });
  }
});

// Route pour les statistiques
app.get('/api/expenses/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Statistiques globales
    const totalStats = await Expense.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          average: { $avg: '$amount' }
        }
      }
    ]);

    // Statistiques par catégorie
    const categoryStats = await Expense.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Statistiques par mois
    const monthlyStats = await Expense.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      total: totalStats[0] || { total: 0, count: 0, average: 0 },
      categories: categoryStats,
      monthly: monthlyStats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
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
      console.log('📊 Application Depensify prête avec MongoDB !');
      console.log('🐳 Interface MongoDB Express: http://localhost:8081');
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

startServer();
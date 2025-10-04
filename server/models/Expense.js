const mongoose = require('mongoose');

/**
 * Schéma dépense avec support familial
 * Gère les dépenses individuelles et familiales avec catégorisation
 */
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

// Middleware pour mettre à jour automatiquement updatedAt
expenseSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Expense', expenseSchema);
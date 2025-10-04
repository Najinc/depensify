/**
 * Index des modèles MongoDB
 * Exporte tous les modèles avec middleware de mise à jour
 */
const User = require('./User');
const Family = require('./Family');
const Expense = require('./Expense');

// Middleware pour mettre à jour automatiquement updatedAt sur User et Family
const mongoose = require('mongoose');

const userSchema = mongoose.model('User').schema;
const familySchema = mongoose.model('Family').schema;

userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

familySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = {
  User,
  Family,
  Expense
};
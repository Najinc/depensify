const mongoose = require('mongoose');

/**
 * Schéma famille avec gestion des membres et permissions
 * Supporte les invitations et la gestion des rôles
 */
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
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
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

/**
 * Génère un code d'invitation unique à 6 caractères
 */
familySchema.methods.generateInviteCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

module.exports = mongoose.model('Family', familySchema);
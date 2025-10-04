const { Family } = require('../models');

/**
 * Middleware pour vérifier les droits administrateur
 */
function requireAdmin(req, res, next) {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  next();
}

/**
 * Middleware pour vérifier les permissions familiales
 * @param {string} permission - Permission à vérifier
 */
function checkFamilyPermission(permission) {
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
        return res.status(403).json({ error: 'Vous n\'avez pas la permission d\'effectuer cette action' });
      }

      req.familyMember = member;
      req.family = family;
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Erreur lors de la vérification des permissions' });
    }
  };
}

/**
 * Génère un code d'invitation aléatoire à 6 caractères
 */
function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Définit les permissions par défaut selon le rôle
 * @param {string} role - Role de l'utilisateur ('admin', 'member', 'viewer')
 */
function getDefaultPermissions(role) {
  const permissions = {
    canAddExpenses: false,
    canEditOwnExpenses: false,
    canEditAllExpenses: false,
    canDeleteOwnExpenses: false,
    canDeleteAllExpenses: false,
    canViewAllExpenses: true,
    canInviteMembers: false,
    canManageMembers: false
  };

  switch (role) {
    case 'admin':
      return {
        canAddExpenses: true,
        canEditOwnExpenses: true,
        canEditAllExpenses: true,
        canDeleteOwnExpenses: true,
        canDeleteAllExpenses: true,
        canViewAllExpenses: true,
        canInviteMembers: true,
        canManageMembers: true
      };
    case 'member':
      return {
        ...permissions,
        canAddExpenses: true,
        canEditOwnExpenses: true,
        canDeleteOwnExpenses: true
      };
    case 'viewer':
      return permissions;
    default:
      return permissions;
  }
}

module.exports = {
  requireAdmin,
  checkFamilyPermission,
  generateInviteCode,
  getDefaultPermissions
};
// Script d'initialisation MongoDB pour Depensify
db = db.getSiblingDB('depensify');

// Créer un utilisateur pour l'application
db.createUser({
  user: 'depensify_user',
  pwd: 'depensify_password_2024',
  roles: [
    {
      role: 'readWrite',
      db: 'depensify'
    }
  ]
});

// Créer les collections avec des indexes
db.createCollection('users');
db.createCollection('expenses');

// Index pour les utilisateurs
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true, sparse: true });

// Index pour les dépenses
db.expenses.createIndex({ userId: 1 });
db.expenses.createIndex({ date: -1 });
db.expenses.createIndex({ category: 1 });
db.expenses.createIndex({ userId: 1, date: -1 });

print('Base de données Depensify initialisée avec succès !');
print('Collections créées : users, expenses');
print('Utilisateur créé : depensify_user');
print('Index créés pour optimiser les performances');
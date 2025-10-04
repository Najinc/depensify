# Depensify Familiale 👨‍👩‍👧‍👦

Une application moderne de gestion des dépenses avec fonctionnalités familiales, utilisant MongoDB et une interface colorée.

## 🌟 Nouvelles Fonctionnalités

### ✅ Corrections Apportées
- **Graphiques réparés** : Les graphiques de répartition par catégorie fonctionnent maintenant correctement
- **Interface familiale** : Nouveau système de supervision familiale
- **Base de données** : Migration complète vers MongoDB avec Docker

### 👨‍👩‍👧‍👦 Fonctionnalités Familiales

#### Gestion de Famille
- **Création automatique** : Chaque utilisateur a sa propre famille lors de l'inscription
- **Rôles et permissions** :
  - `Admin` : Peut inviter des membres et gérer la famille
  - `Membre` : Peut ajouter et modifier ses propres dépenses
  - `Observateur` : Peut seulement consulter les dépenses

#### Visualisation des Dépenses
- **Vue personnelle** : Vos dépenses uniquement
- **Vue familiale** : Toutes les dépenses de la famille
- **Graphiques en temps réel** : Répartition par catégorie avec Chart.js
- **Statistiques** : Totaux par membre et par catégorie

#### Supervision Familiale
- **Liste des membres** : Voir tous les membres de la famille avec leurs rôles
- **Invitations** : Système d'invitation par email (simulé en console)
- **Dépenses partagées** : Visualiser qui dépense quoi et combien

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (v14+)
- Docker Desktop
- Git

### Démarrage Rapide
```bash
# 1. Démarrer les conteneurs MongoDB
docker-compose up -d

# 2. Installer les dépendances
npm install

# 3. Démarrer l'application familiale
node server_family.js
```

### Ou utiliser le script automatique
```bash
# Windows
start_family.bat

# Ou démarrage complet
start.bat
```

## 🎨 Interface Utilisateur

### Design Moderne
- **Glassmorphisme** : Interface moderne avec effets de verre
- **Gradients colorés** : Design attrayant et moderne
- **Responsive** : S'adapte à tous les écrans
- **Animations** : Transitions fluides et modernes

### Navigation
- **Onglets dynamiques** : Basculer entre vue personnelle et familiale
- **Filtres avancés** : Par catégorie, date, membre
- **Graphiques interactifs** : Visualisation en temps réel

## 🐳 Architecture Technique

### Base de Données MongoDB
```
📦 MongoDB Container
├── 📊 Database: depensify
├── 👤 Users Collection
├── 👨‍👩‍👧‍👦 Families Collection
└── 💰 Expenses Collection
```

### Schémas de Données

#### Utilisateur
```javascript
{
  username: String,
  password: String (hash),
  email: String,
  familyId: ObjectId,
  role: 'admin' | 'member' | 'viewer'
}
```

#### Famille
```javascript
{
  name: String,
  ownerId: ObjectId,
  members: [{ userId, role, joinedAt }],
  invitations: [{ email, role, status }]
}
```

#### Dépense
```javascript
{
  userId: ObjectId,
  familyId: ObjectId,
  description: String,
  amount: Number,
  category: String,
  date: Date
}
```

## 🔧 APIs Disponibles

### Authentification
- `POST /api/register` - Inscription avec création de famille
- `POST /api/login` - Connexion
- `GET /api/me` - Profil utilisateur

### Dépenses Personnelles
- `GET /api/expenses` - Liste des dépenses personnelles
- `POST /api/expenses` - Créer une dépense
- `PUT /api/expenses/:id` - Modifier une dépense
- `DELETE /api/expenses/:id` - Supprimer une dépense

### Fonctionnalités Familiales
- `GET /api/family/expenses` - Toutes les dépenses de la famille
- `GET /api/family/members` - Liste des membres de la famille
- `POST /api/family/invite` - Inviter un nouveau membre

## 🌐 Accès aux Services

- **Application** : http://localhost:3000
- **MongoDB Express** : http://localhost:8081
  - Utilisateur : `admin`
  - Mot de passe : `pass`

## 📊 Fonctionnalités des Graphiques

### Graphique de Répartition
- **Données en temps réel** : Mise à jour automatique
- **Couleurs distinctes** : Chaque catégorie a sa couleur
- **Responsive** : S'adapte à la taille de l'écran
- **Interactif** : Survol pour voir les détails

### Catégories Supportées
- 🍔 Alimentation
- 🚗 Transport  
- 🍽️ Restauration
- 🎮 Divertissement
- 🏥 Santé
- 🛍️ Shopping
- 📚 Éducation
- 📦 Divers

## 🔒 Sécurité

- **Mots de passe** : Hashage avec bcrypt (12 rounds)
- **Authentification** : JWT avec expiration 7 jours
- **Validation** : Contrôles côté serveur et client
- **Permissions** : Système de rôles pour la famille

## 🐛 Résolution des Problèmes

### MongoDB
```bash
# Vérifier les conteneurs
docker-compose ps

# Redémarrer MongoDB
docker-compose restart

# Voir les logs
docker-compose logs mongodb
```

### Application
```bash
# Vérifier les logs du serveur
# Vérifier que le port 3000 est libre
netstat -an | findstr :3000
```

## 🤝 Utilisation en Famille

1. **Créer un compte** : Le premier utilisateur devient admin
2. **Inviter la famille** : Utiliser le système d'invitation
3. **Gérer les rôles** : Attribuer les permissions appropriées
4. **Suivre les dépenses** : Utiliser les vues personnelles et familiales
5. **Analyser** : Utiliser les graphiques pour comprendre les habitudes

---

**Version** : 2.0 - Édition Familiale  
**Dernière mise à jour** : Octobre 2025  
**Développé avec** : Node.js, Express, MongoDB, React (CDN), Chart.js
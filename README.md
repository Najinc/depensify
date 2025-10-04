# 💰 Depensify - Gestionnaire de Dépenses Familiales

Une application moderne de gestion des dépenses avec fonctionnalités familiales, utilisant React, Express.js et MongoDB.

## ✨ Fonctionnalités

### 🔐 Authentification
- Système d'authentification sécurisé avec JWT
- Gestion des utilisateurs avec approbation administrateur
- Support multi-utilisateurs avec permissions

### 👨‍👩‍👧‍👦 Gestion Familiale
- **Création/Rejoindre une famille** avec codes d'invitation
- **Rôles et permissions** configurables (Admin, Membre, Observateur)
- **Gestion des membres** avec invitation et droits personnalisés
- **Vue partagée** des dépenses familiales

### 💳 Gestion des Dépenses
- Ajout, modification et suppression de dépenses
- Catégorisation automatique avec couleurs
- Vue personnelle et vue familiale
- Permissions granulaires pour l'édition

### 📊 Statistiques et Visualisation
- **Graphiques interactifs** avec Chart.js
- **Tableaux de bord** temps réel
- **Métriques avancées** (totaux, moyennes, tendances)
- **Répartition par catégorie** et par membre

### 🎨 Interface Moderne
- Design responsive avec Tailwind CSS + DaisyUI
- Thème sombre avec effets glassmorphisme
- Animations fluides et interactions intuitives
- Navigation adaptative selon les permissions

## 🚀 Installation

### Prérequis
- **Node.js** (version 16+)
- **Docker** et **Docker Compose**
- **Git**

### Démarrage Rapide

#### Avec Docker (Recommandé)
```bash
# Cloner le projet
git clone <votre-repo>
cd depensify

# Démarrage avec Docker
docker-compose up -d --build

# Accéder à l'application
http://localhost:3000
```

#### Développement Local
```bash
# Installation des dépendances
npm install

# Démarrage du serveur
npm start

# L'application sera disponible sur http://localhost:3000
```

### Configuration

#### Variables d'environnement (.env)
```env
# Base de données
MONGODB_URI=mongodb://localhost:27017/depensify

# Sécurité
JWT_SECRET=votre-clé-secrète-très-sécurisée

# Serveur
PORT=3000
NODE_ENV=production
```

## 🏗️ Architecture

### Backend (Node.js + Express)
```
server/
├── models/           # Modèles MongoDB (User, Family, Expense)
├── routes/           # Routes API modulaires
├── middleware/       # Authentification et permissions
└── utils/           # Utilitaires et helpers
```

### Frontend (React sans build)
```
public/
├── components/       # Composants réutilisables
├── views/           # Vues principales (Expenses, Family, Admin)
├── style.css        # Styles personnalisés
└── index.html       # Point d'entrée
```

## 🔑 Utilisation

### Premier Démarrage
1. **Inscription** : Le premier utilisateur devient automatiquement administrateur
2. **Création de famille** : Une famille est créée automatiquement
3. **Gestion des membres** : Inviter d'autres utilisateurs avec des codes

### Gestion des Permissions
- **Admin** : Toutes les permissions (édition, suppression, gestion membres)
- **Membre** : Gestion de ses propres dépenses + vue familiale
- **Observateur** : Consultation uniquement

### Flux de Travail
1. **Connexion** → Vue tableau de bord
2. **Ajout de dépenses** → Catégorisation automatique
3. **Vue familiale** → Consultation des dépenses partagées
4. **Gestion famille** → Invitation et gestion des membres

## 🐳 Docker

### Services Inclus
- **App** : Serveur Node.js (port 3000)
- **MongoDB** : Base de données (port 27017)
- **Mongo Express** : Interface d'administration DB (port 8081)

### Commandes Utiles
```bash
# Démarrage
docker-compose up -d

# Logs
docker-compose logs -f

# Redémarrage
docker-compose restart

# Arrêt et nettoyage
docker-compose down -v
```

## 🔧 API Endpoints

### Authentification
- `POST /api/register` - Inscription
- `POST /api/login` - Connexion
- `GET /api/me` - Informations utilisateur

### Dépenses
- `GET /api/expenses` - Liste des dépenses personnelles
- `POST /api/expenses` - Créer une dépense
- `PUT /api/expenses/:id` - Modifier une dépense
- `DELETE /api/expenses/:id` - Supprimer une dépense

### Famille
- `GET /api/family/details` - Détails de la famille
- `POST /api/family/create` - Créer une famille
- `POST /api/family/join` - Rejoindre avec code
- `GET /api/family/expenses` - Dépenses familiales
- `PUT /api/family/member/:id/role` - Modifier rôle membre

## 🛠️ Technologies

### Backend
- **Node.js** + **Express.js** - Serveur web
- **MongoDB** + **Mongoose** - Base de données
- **JWT** + **bcrypt** - Authentification sécurisée
- **Docker** - Containerisation

### Frontend
- **React** (CDN) - Interface utilisateur
- **Tailwind CSS** + **DaisyUI** - Design system
- **Chart.js** - Graphiques interactifs
- **Vanilla JS** - Logique métier

## 📝 Développement

### Structure du Code
- **Modularité** : Composants et routes séparés
- **Permissions** : Middleware de vérification des droits
- **Validation** : Contrôles côté client et serveur
- **Optimisation** : Index MongoDB et mise en cache

### Bonnes Pratiques
- Code documenté avec JSDoc
- Gestion d'erreurs centralisée
- Logs structurés pour le debugging
- Validation des entrées utilisateur

## 🚨 Sécurité

- **Authentification JWT** avec expiration
- **Hashage bcrypt** des mots de passe
- **Validation des permissions** à chaque requête
- **Sanitisation** des entrées utilisateur
- **CORS** configuré pour la production

## 🆘 Dépannage

### Problèmes Courants

#### MongoDB non accessible
```bash
# Vérifier le service
docker-compose ps
docker-compose logs mongodb
```

#### Erreur de permissions
- Vérifier que l'utilisateur appartient à une famille
- Contrôler les rôles et permissions dans l'interface admin

#### Performance lente
- Vérifier les index MongoDB
- Optimiser les requêtes avec des filtres

## 📞 Support

Pour toute question ou problème :
1. Consulter les logs : `docker-compose logs`
2. Vérifier la configuration des variables d'environnement
3. Redémarrer les services : `docker-compose restart`

## 📄 Licence

MIT - Libre d'utilisation et de modification
# Depensify 2.0 - Édition Dockerisée avec Approbation 🐳👨‍👩‍👧‍👦

Application moderne de gestion des dépenses familiales avec système d'approbation des comptes et architecture complètement dockerisée.

## 🆕 Nouvelles Fonctionnalités v2.0

### 🐳 **Architecture Dockerisée**
- **Serveur Node.js** : Conteneurisé avec Dockerfile optimisé
- **Base de données MongoDB** : Persistance des données avec volumes Docker
- **Interface d'administration** : Mongo Express pour la gestion BDD
- **Orchestration complète** : Docker Compose pour tous les services

### 🔐 **Système d'Approbation des Comptes**
- **Premier utilisateur** : Devient automatiquement administrateur système
- **Comptes en attente** : Nouveaux utilisateurs créent des demandes
- **Validation manuelle** : Admin approuve ou rejette les demandes
- **Interface dédiée** : Panel d'administration pour gérer les utilisateurs

## 🚀 Démarrage Rapide

### Prérequis
- Docker Desktop
- Git (optionnel)

### Installation
```bash
# 1. Cloner ou télécharger le projet
git clone <repository>
cd depensify

# 2. Démarrage complet avec Docker
start_docker.bat
```

### Ou démarrage manuel
```bash
# Construction des images
docker-compose build

# Démarrage des services
docker-compose up -d

# Vérification
docker-compose ps
```

## 🏗️ Architecture

### Services Docker
```yaml
📦 mongodb:      # Base de données MongoDB 7.0
├── Port: 27017
├── Volume: mongodb_data (persistant)
└── Init: script d'initialisation

📦 mongo-express: # Interface d'admin BDD
├── Port: 8081
├── Auth: admin/pass
└── Accès: http://localhost:8081

📦 app:          # Application Node.js
├── Port: 3000
├── Build: Dockerfile
└── Accès: http://localhost:3000
```

### Flux d'Approbation
```
1. Nouvel utilisateur s'inscrit
   ↓
2. Compte créé avec statut "pending"
   ↓
3. Admin reçoit notification
   ↓
4. Admin approuve/rejette via interface
   ↓
5. Utilisateur peut se connecter (si approuvé)
```

## 👤 Gestion des Utilisateurs

### Premier Utilisateur (Admin)
1. S'inscrire normalement
2. Devient automatiquement admin système
3. Compte approuvé automatiquement
4. Accès à l'interface d'administration

### Utilisateurs Suivants
1. S'inscrire → Compte en attente
2. Message : "En attente d'approbation"
3. Admin reçoit la demande
4. Approbation → Famille créée automatiquement

### Interface d'Administration
- **Onglet "Admin"** : Visible seulement pour les admins
- **Demandes en attente** : Liste des comptes à valider
- **Actions** : Approuver/Rejeter avec raison optionnelle
- **Statistiques** : Nombre de demandes en cours

## 🎨 Interface Utilisateur

### Navigation
- **💰 Dépenses** : Interface principale de gestion
- **🔐 Admin** : Panel d'administration (admins seulement)

### Fonctionnalités
- **👤 Mes Dépenses** : Vue personnelle
- **👨‍👩‍👧‍👦 Vue Famille** : Dépenses familiales
- **📊 Graphiques** : Répartition par catégorie
- **👥 Gestion famille** : Invitations et membres

## 🐳 Commandes Docker

### Gestion des Services
```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Redémarrer
docker-compose restart

# Voir les logs
docker-compose logs app
docker-compose logs mongodb

# Reconstruire
docker-compose build --no-cache
```

### Maintenance
```bash
# Nettoyer les images
docker system prune

# Sauvegarder les données
docker run --rm -v depensify_mongodb_data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb_backup.tar.gz -C /data .

# Restaurer les données
docker run --rm -v depensify_mongodb_data:/data -v $(pwd):/backup alpine tar xzf /backup/mongodb_backup.tar.gz -C /data
```

## 📡 APIs Disponibles

### Authentification
- `POST /api/register` - Inscription (crée compte en attente)
- `POST /api/login` - Connexion (vérifie statut)
- `GET /api/me` - Profil utilisateur

### Administration
- `GET /api/admin/pending-users` - Utilisateurs en attente
- `POST /api/admin/approve-user/:id` - Approuver utilisateur
- `POST /api/admin/reject-user/:id` - Rejeter utilisateur

### Dépenses & Famille
- Toutes les APIs existantes conservées
- Dépenses personnelles et familiales
- Gestion des membres et invitations

## 🔒 Sécurité

### Contrôles d'Accès
- **JWT Authentication** : Tokens sécurisés avec expiration
- **Validation des rôles** : Middleware requireAdmin
- **Statuts des comptes** : pending/approved/rejected
- **Isolation familiale** : Données séparées par famille

### Variables d'Environnement
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://depensify_user:password@mongodb:27017/depensify
JWT_SECRET=secure_random_key
```

## 🔧 Dépannage

### Problèmes Courants

**Port 3000 occupé**
```bash
# Trouver le processus
netstat -ano | findstr :3000
# Tuer le processus
taskkill /PID <PID> /F
```

**MongoDB connection failed**
```bash
# Vérifier les conteneurs
docker-compose ps
# Redémarrer MongoDB
docker-compose restart mongodb
```

**Image build failed**
```bash
# Build sans cache
docker-compose build --no-cache
# Nettoyer Docker
docker system prune -a
```

## 📊 Monitoring

### Logs Application
```bash
docker-compose logs -f app
```

### Métriques MongoDB
- Interface Mongo Express : http://localhost:8081
- Collections : users, families, expenses
- Indices optimisés pour les requêtes

### Performance
- Images Alpine : Réduction de 70% de la taille
- Multi-stage builds : Optimisation des builds
- Volumes persistants : Données conservées

## 🚦 Production

Pour déployer en production :

1. **Variables d'environnement sécurisées**
2. **Reverse proxy** (nginx)
3. **SSL/TLS** (Let's Encrypt)
4. **Monitoring** (Prometheus/Grafana)
5. **Sauvegardes automatiques**

---

**Version** : 2.0 - Dockerized Edition  
**Date** : Octobre 2025  
**Stack** : Node.js, Express, MongoDB, React, Docker  
**Auteur** : Système d'approbation et dockerisation complète
# 💰 Depensify - Gestionnaire de Dépenses

Une application moderne de gestion des dépenses avec une interface colorée et attrayante, utilisant React, Express.js et MongoDB.

## ✨ Fonctionnalités

- 🔐 **Authentification sécurisée** avec JWT et bcrypt
- 💳 **Gestion des dépenses** (ajout, modification, suppression)
- 📊 **Statistiques avancées** avec graphiques interactifs
- 🎨 **Interface moderne** avec design coloré et animations
- 📱 **Responsive design** pour mobile et desktop
- 🐳 **MongoDB avec Docker** pour la persistance des données
- 🔍 **Recherche et filtrage** des dépenses
- 📈 **Tableaux de bord** avec métriques en temps réel

## 🚀 Installation et Démarrage

### Prérequis

- **Node.js** (version 14 ou supérieure)
- **Docker** et **Docker Compose**
- **Git**

### Installation Automatique

#### Windows
```bash
# Cloner le projet
git clone <votre-repo>
cd depensify

# Lancer le script de démarrage
start.bat
```

#### Linux/macOS
```bash
# Cloner le projet
git clone <votre-repo>
cd depensify

# Rendre le script exécutable
chmod +x start.sh

# Lancer le script de démarrage
./start.sh
```

### Installation Manuelle

1. **Démarrer MongoDB avec Docker**
   ```bash
   docker-compose up -d
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   # Modifier le fichier .env selon vos besoins
   ```

4. **Utiliser le serveur MongoDB**
   ```bash
   cp server_mongodb.js server.js
   ```

5. **Démarrer l'application**
   ```bash
   npm start
   ```

## 🌐 Accès aux Services

- **Application principale** : http://localhost:3000
- **MongoDB Express** (interface web) : http://localhost:8081
- **MongoDB** (base de données) : localhost:27017

## 🎨 Nouvelles Fonctionnalités de Design

### Interface Colorée
- Gradient de fond dynamique (bleu → violet)
- Cartes avec effet de verre (glassmorphism)
- Animations fluides et transitions
- Ombres et effets 3D

### Statistiques Visuelles
- Cartes statistiques colorées avec icônes
- Graphiques en donut interactifs
- Couleurs par catégorie de dépenses
- Métriques en temps réel

### Expérience Utilisateur
- Formulaires avec validation visuelle
- Boutons avec effets hover
- Design responsive pour mobile
- Chargement optimisé

## 📊 Architecture Technique

### Frontend
- **React 18** avec hooks modernes
- **Chart.js** pour les graphiques
- **CSS moderne** avec animations et gradients
- **Responsive design** avec CSS Grid et Flexbox

### Backend
- **Express.js** pour l'API REST
- **Mongoose** pour MongoDB ODM
- **JWT** pour l'authentification
- **bcrypt** pour le hashage des mots de passe

### Base de Données
- **MongoDB** avec index optimisés
- **Docker** pour l'environnement de développement
- **Mongo Express** pour l'administration

## 🔧 Configuration

### Variables d'Environnement (.env)
```env
# Application
NODE_ENV=development
PORT=3000
JWT_SECRET=votre_secret_jwt

# MongoDB
MONGODB_URI=mongodb://depensify_user:depensify_password_2024@localhost:27017/depensify?authSource=depensify
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_DATABASE=depensify
```

### Docker Compose
Le fichier `docker-compose.yml` configure :
- **MongoDB 7.0** avec authentification
- **Mongo Express** pour l'interface web
- **Volumes persistants** pour les données
- **Réseau isolé** pour la sécurité

## 📱 Catégories de Dépenses

- 🍽️ Alimentation
- 🚗 Transport  
- 🍕 Restauration
- 🎮 Divertissement
- 🏥 Santé
- 🛍️ Shopping
- 📚 Éducation
- 📦 Divers

## 🛠️ Commandes Utiles

```bash
# Démarrage en mode développement
npm run dev

# Gestion Docker
npm run docker:up      # Démarrer MongoDB
npm run docker:down    # Arrêter MongoDB
npm run docker:logs    # Voir les logs

# Base de données
docker exec -it depensify_mongodb mongosh
```

## 🎯 Améliorations Récentes

### Suppression du Système de Chat
- ❌ Suppression complète des fonctionnalités de chat
- ❌ Retrait des WebSockets et Socket.IO
- ❌ Suppression des systèmes d'amis et famille
- ✅ Code plus léger et focalisé sur les dépenses

### Design Modernisé
- ✅ Interface colorée avec dégradés
- ✅ Effet glassmorphism sur les cartes
- ✅ Animations CSS fluides
- ✅ Responsive design amélioré

### Migration MongoDB
- ✅ Remplacement du stockage JSON
- ✅ Base de données MongoDB avec Docker
- ✅ Modèles Mongoose optimisés
- ✅ Index pour les performances

## 🐛 Dépannage

### MongoDB ne démarre pas
```bash
# Vérifier l'état des conteneurs
docker-compose ps

# Redémarrer MongoDB
docker-compose restart mongodb

# Voir les logs
docker-compose logs mongodb
```

### Erreur de connexion
1. Vérifier que MongoDB est en cours d'exécution
2. Vérifier les ports (3000, 27017, 8081)
3. Vérifier les variables d'environnement
4. Redémarrer l'application

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les modifications (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

🎉 **Profitez de votre nouvelle application Depensify avec MongoDB !**
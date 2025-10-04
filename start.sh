#!/bin/bash

# Script de démarrage pour Depensify avec MongoDB

echo "🚀 Démarrage de Depensify avec MongoDB..."

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker pour continuer."
    exit 1
fi

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez installer Docker Compose pour continuer."
    exit 1
fi

# Démarrer MongoDB avec Docker
echo "📦 Démarrage de MongoDB..."
docker-compose up -d

# Attendre que MongoDB soit prêt
echo "⏳ Attente de la disponibilité de MongoDB..."
sleep 10

# Installer les dépendances Node.js
echo "📥 Installation des dépendances..."
npm install

# Démarrer l'application
echo "🎯 Démarrage de l'application..."
npm start
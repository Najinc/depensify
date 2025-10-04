#!/bin/bash

echo "💰 Depensify - Gestionnaire de Dépenses Familiales"
echo "================================================"
echo

# Vérifier si Docker est disponible
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    echo "💡 Options disponibles:"
    echo "   1. Installer Docker"
    echo "   2. Utiliser le mode développement local"
    echo
    read -p "Votre choix (1 ou 2): " choice
    if [ "$choice" = "2" ]; then
        goto_local_dev=true
    else
        echo "🚀 Veuillez installer Docker et relancer ce script."
        exit 1
    fi
fi

if [ "$goto_local_dev" != "true" ] && ! docker info &> /dev/null; then
    echo "❌ Docker n'est pas en cours d'exécution"
    echo "💡 Options disponibles:"
    echo "   1. Démarrer Docker"
    echo "   2. Utiliser le mode développement local"
    echo
    read -p "Votre choix (1 ou 2): " choice
    if [ "$choice" = "2" ]; then
        goto_local_dev=true
    else
        echo "🚀 Veuillez démarrer Docker et relancer ce script."
        exit 1
    fi
fi

if [ "$goto_local_dev" != "true" ]; then
    echo "🐳 Démarrage avec Docker (Recommandé)"
    echo

    echo "🏗️ Construction et démarrage des conteneurs..."
    docker-compose down
    docker-compose up -d --build

    if [ $? -ne 0 ]; then
        echo "❌ Erreur lors du démarrage Docker"
        exit 1
    fi

    echo "✅ Containers démarrés avec succès!"
    echo
    echo "🌐 Accès à l'application:"
    echo "   • Application:      http://localhost:3000"
    echo "   • Mongo Express:    http://localhost:8081"
    echo
    echo "📊 Statut des services:"
    docker-compose ps
    echo
    echo "💡 Commandes utiles:"
    echo "   • Logs:     docker-compose logs -f"
    echo "   • Arrêt:    docker-compose down"
    echo "   • Restart:  docker-compose restart"
else
    echo "🔧 Mode développement local"
    echo

    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js n'est pas installé"
        echo "💡 Téléchargez Node.js depuis: https://nodejs.org"
        exit 1
    fi

    echo "📦 Installation des dépendances..."
    npm install

    if [ $? -ne 0 ]; then
        echo "❌ Erreur lors de l'installation des dépendances"
        exit 1
    fi

    echo "🚀 Démarrage du serveur de développement..."
    echo "🌐 Application disponible sur: http://localhost:3000"
    npm start
fi
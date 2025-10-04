@echo off
echo 💰 Depensify - Gestionnaire de Dépenses Familiales
echo ================================================
echo.

REM Vérifier si Docker est disponible
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker n'est pas en cours d'exécution.
    echo 💡 Options disponibles:
    echo    1. Démarrer Docker Desktop
    echo    2. Utiliser le mode développement local
    echo.
    set /p choice="Votre choix (1 ou 2): "
    if "%choice%"=="2" goto :local_dev
    echo 🚀 Veuillez démarrer Docker Desktop et relancer ce script.
    pause
    exit /b 1
)

echo 🐳 Démarrage avec Docker (Recommandé)
echo.

echo 🏗️ Construction et démarrage des conteneurs...
docker-compose down
docker-compose up -d --build

if errorlevel 1 (
    echo ❌ Erreur lors du démarrage Docker
    pause
    exit /b 1
)

echo ✅ Containers démarrés avec succès!
echo.
echo 🌐 Accès à l'application:
echo    • Application:      http://localhost:3000
echo    • Mongo Express:    http://localhost:8081
echo.
echo 📊 Statut des services:
docker-compose ps
echo.
echo 💡 Commandes utiles:
echo    • Logs:     docker-compose logs -f
echo    • Arrêt:    docker-compose down
echo    • Restart:  docker-compose restart
goto :end

:local_dev
echo 🔧 Mode développement local
echo.

REM Vérifier Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js n'est pas installé
    echo 💡 Téléchargez Node.js depuis: https://nodejs.org
    pause
    exit /b 1
)

echo 📦 Installation des dépendances...
npm install

if errorlevel 1 (
    echo ❌ Erreur lors de l'installation des dépendances
    pause
    exit /b 1
)

echo 🚀 Démarrage du serveur de développement...
echo 🌐 Application disponible sur: http://localhost:3000
npm start

:end
pause
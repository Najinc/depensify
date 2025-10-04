@echo off
echo 🚀 Démarrage de Depensify Familiale avec MongoDB...

REM Vérifier si Docker est installé
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker n'est pas installé. Veuillez installer Docker pour continuer.
    pause
    exit /b 1
)

REM Démarrer MongoDB avec Docker
echo 📦 Démarrage de MongoDB...
docker-compose up -d

REM Attendre que MongoDB soit prêt
echo ⏳ Attente de la disponibilité de MongoDB...
timeout /t 10 /nobreak

REM Installer les dépendances Node.js
echo 📥 Installation des dépendances...
npm install

REM Copier le serveur familial
copy server_family.js server.js

REM Démarrer l'application
echo 🎯 Démarrage de l'application familiale...
npm start

pause
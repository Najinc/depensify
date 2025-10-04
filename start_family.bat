@echo off
echo 🚀 Démarrage rapide de Depensify Familiale...
echo.

REM Vérifier si Docker est en cours d'exécution
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker n'est pas en cours d'exécution. Veuillez démarrer Docker Desktop.
    pause
    exit /b 1
)

echo 📦 Vérification des conteneurs MongoDB...
docker-compose ps

echo 🚀 Démarrage du serveur familial...
node server_family.js

pause
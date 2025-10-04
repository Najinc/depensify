@echo off
echo 🐳 Démarrage de Depensify avec Docker complet...
echo.

REM Vérifier si Docker est en cours d'exécution
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker n'est pas en cours d'exécution. Veuillez démarrer Docker Desktop.
    pause
    exit /b 1
)

echo 🏗️ Construction et démarrage des conteneurs...
docker-compose down
docker-compose build
docker-compose up -d

echo ⏳ Attente du démarrage complet...
timeout /t 15 /nobreak >nul

echo ✅ Application démarrée !
echo.
echo 🌐 Accès:
echo   - Application: http://localhost:3000
echo   - MongoDB Express: http://localhost:8081
echo.
echo 📊 Monitoring des conteneurs:
docker-compose ps

pause
# Utiliser Node.js 18 Alpine pour une image légère
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production && npm cache clean --force

# Copier les fichiers source
COPY . .

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S depensify -u 1001

# Changer le propriétaire des fichiers
RUN chown -R depensify:nodejs /app
USER depensify

# Exposer le port 3000
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Commande de démarrage
CMD ["node", "server_family.js"]
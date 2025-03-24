# Utilise une image de Node.js
FROM node:18-alpine

# Répertoire de travail dans le conteneur
WORKDIR /app

# Copie les fichiers package.json et package-lock.json
COPY package*.json ./

# Installe les dépendances en mode développement
RUN npm install

# Copie tous les fichiers du projet
COPY . .

# Expose le port sur lequel Nuxt.js écoute
EXPOSE 3000

# Démarre l'application en mode développement (avec hot-reloading)
CMD ["npm", "run", "dev"]

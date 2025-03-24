# Utilise une image de Node.js
FROM node:18-alpine

# Installe les dépendances nécessaires à la compilation
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    bash

# Répertoire de travail dans le conteneur
WORKDIR /app

# Copie le fichier package.json et package-lock.json
COPY package*.json ./

# Installe les dépendances (en mode développement)
RUN npm install

# Copie tous les fichiers du projet
COPY . .

# Réinstalle bcrypt pour résoudre les problèmes de binaire (si nécessaire)
RUN npm rebuild bcrypt --build-from-source

# Expose le port sur lequel le serveur NestJS écoute
EXPOSE 3001

# Démarre l'application en mode développement (avec watch)
CMD ["npm", "run", "start:dev"]

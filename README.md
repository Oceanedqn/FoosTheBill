# FoosTheBill
Application pour gérer des tournois

# Guide d'Installation

Ce guide vous expliquera comment configurer le projet en local, y compris l'installation des dépendances pour le backend et le frontend, ainsi que la configuration des variables d'environnement.

## Cloner le Dépôt

1. Clonez le dépôt sur votre machine locale en utilisant la commande suivante :


   git clone (https://github.com/Oceanedqn/FoosTheBill.git)

## Configuration de la base de données
Sur postgreSQL, créer une base de données avec les informations souhaitées. (elles seront utiles par la suite)

## Configuration du Backend
1. Allez dans le Répertoire Backend
Allez dans le répertoire du backend :

`cd .\foosthebill-api\`

2. Installer les Dépendances du Backend
Exécutez la commande suivante pour installer les dépendances nécessaires au backend :

`npm install`

3. Ajouter le fichier .env pour le Backend
Voici le contenu du fichier .env :
- JWT_SECRET=f0df89dbf02a87842ac513a79583467c0a4ad4c26023fa666ce6f11d1740045bce82d8e1b9b5a5cee72119e5411bb73dbe7c73d98fcc1d75aaabaa77c30b463d75f3cdb947f12749b166c7d5978423718707dd63da18901118563e8cedd5b522811f7f865af0c9bf5a98408dbfa4c6a98e7329f328cff0170d5ba8deb8c0307bfb104337f52abb03ccddda3e69dd27fbd0bdc16239f753cf895fa703ac095a31439f1be36b314fa9e9bf8237dc0557ae30de6fb2398d8e98db6d5da9e25e17af92bbb3ef71f6c8619c19eb6b9f0d68ca633f47a5e1bea9c392c4096a871a8503b57768e2e9575010502ec0ec384c7be04108c0992a3418b41813d27b72b2bc9c
- DB_HOST=localhost
- DB_PORT=5432
- DB_USERNAME=postgres
- DB_PASSWORD=admin
- DB_NAME=foosthebill



(ne pas oublier de créer la base de données et d'adapter le .env en fonction)

4. Démarrer le Serveur Backend
Une fois les dépendances installées et le fichier .env configuré, lancez le serveur backend avec :

`npm run start:dev`
  
Cela démarrera le backend en mode développement, et il devrait être disponible à http://localhost:3001.
Si la base de données a été crée avant le lancement du backend, les tables seront créées à son lancement.

## Configuration du Frontend
1. Allez dans le Répertoire Frontend
Allez dans le répertoire du frontend :

`cd .\foosthebill-app\`
  
2. Installer les Dépendances du Frontend
Exécutez la commande suivante pour installer les dépendances nécessaires au frontend :

`npm install`
  
3. Ajouter le fichier .env pour le Frontend
Copiez le code d'exemple ci-dessous dans un fichier et nommez-le en .env :

- API_URL=http://localhost:3001


4. Démarrer le Serveur Frontend
Une fois les dépendances installées et le fichier .env configuré, lancez le serveur frontend avec :

`npm run dev`
Cela démarrera le frontend en mode développement, et il devrait être disponible à http://localhost:3080.

Vous devriez maintenant pouvoir accéder à votre application en allant à l'URL du frontend (http://localhost:3080), et le frontend devrait communiquer avec le backend (http://localhost:3001).

-> Les fichiers `.env` fournis sont des exemples, veuillez les adapter avec vos informations.

# Utiliser les fonctionnalités admin
Une fois le compte crée, allez dans la base de données pour changer le role à "admin" dans la table user. 

![image](https://github.com/user-attachments/assets/b51c18cb-1d6f-4c12-bae3-d1543ae35552)



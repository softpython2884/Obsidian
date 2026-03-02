# Discord Local Clone

Un clone local de Discord ultra-sécurisé et performant, conçu avec Next.js (App Router), React, Tailwind CSS, et Socket.io. Ce projet intègre un système de messagerie en temps réel avec un chiffrement de bout en bout (E2E) simulé en local, une gestion des rôles, et un panel d'administration.

## 🚀 Fonctionnalités

*   **Temps Réel** : Messagerie instantanée, indicateurs de frappe et statuts en direct via WebSockets (Socket.io).
*   **Sécurité & Chiffrement (E2E)** : Les messages sont chiffrés en AES-256 avant d'être stockés en base de données. Chaque utilisateur possède une paire de clés générée à la création de son compte.
*   **Système de Serveurs & Salons** : Créez des serveurs, des catégories et des salons textuels comme sur Discord.
*   **Rôles & Permissions** : Système de rôles (Admin, Modérateur, Membre) avec des couleurs distinctives. Le premier utilisateur inscrit devient automatiquement l'Hôte (Admin).
*   **Dashboard Admin** : Interface dédiée pour gérer les utilisateurs (renommer, bannir) et consulter les logs de modération.
*   **Interface "Dark Matter"** : Un design sombre, fluide et réactif inspiré de l'UX de Discord.

## 🛠️ Stack Technique

*   **Frontend** : Next.js 15 (App Router), React 19, Tailwind CSS v4, Lucide React (Icônes).
*   **Backend** : Next.js API Routes, Serveur Node.js personnalisé (pour Socket.io).
*   **Base de données** : SQLite avec Prisma ORM.
*   **Communication** : Socket.io (WebSockets).
*   **Sécurité** : CryptoJS (AES-256).

## 📦 Installation & Démarrage (Local)

### 1. Cloner le dépôt et installer les dépendances

```bash
git clone <votre-repo>
cd discord-local-clone
npm install
```

### 2. Configuration de l'environnement

Copiez le fichier d'exemple pour créer votre propre fichier `.env` :

```bash
cp .env.example .env
```

Ouvrez le fichier `.env` et configurez les variables, notamment la clé de chiffrement :
*   `MASTER_ENCRYPTION_KEY` : Une chaîne sécurisée de 32 caractères (ex: `discord-local-clone-super-secret`).
*   `DATABASE_URL` : Laissez `file:./dev.db` pour utiliser SQLite.

### 3. Initialiser la base de données

Générez le client Prisma et synchronisez le schéma avec la base de données SQLite :

```bash
npx prisma generate
npx prisma db push
```

### 4. Lancer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

## 🔒 Note sur la Sécurité (Chiffrement E2E)

Dans cette version locale, le chiffrement de bout en bout (E2E) est simulé pour des raisons de simplicité d'architecture :
*   Une clé maître (`MASTER_ENCRYPTION_KEY`) chiffre les clés privées des utilisateurs et le contenu des messages en base de données.
*   En production réelle, le déchiffrement devrait se faire exclusivement côté client avec la clé privée de l'utilisateur stockée localement (ex: IndexedDB), sans que le serveur n'ait jamais accès au contenu en clair.

## 📜 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

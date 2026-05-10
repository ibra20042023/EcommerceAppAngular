# EcommerceAppAngular 🛍️

Application e-commerce fullstack moderne développée avec Angular 21 et TailwindCSS.

## ✨ Fonctionnalités

### Interface client
- Page d'accueil avec produits en vedette et catégories
- Catalogue avec filtres (recherche, catégorie, prix)
- Fiche produit avec zoom image
- Panier d'achat persistant
- Tunnel de commande complet
- Liste de souhaits
- Historique des commandes
- Profil utilisateur avec gestion des adresses
- Mode sombre / clair

### Authentification
- Inscription et connexion (JWT)
- Rafraîchissement automatique du token
- Récupération de mot de passe
- Gestion des rôles : Client / Administrateur

### Panel administrateur
- Dashboard avec statistiques
- Gestion des produits (CRUD + images)
- Gestion des catégories
- Gestion des utilisateurs
- Suivi des commandes

## 🛠️ Stack technique

| Technologie | Version |
|---|---|
| Angular | 21.0.0 |
| TypeScript | 5.9.2 |
| TailwindCSS | 4.1.17 |
| RxJS | 7.8.0 |
| Node.js (backend démo) | 18+ |
| json-server | 0.17.4 |

## 🚀 Lancement du projet

### Prérequis
- Node.js 18+
- Angular CLI 21+

### Installation

```bash
# Cloner le projet
git clone https://github.com/TON_USERNAME/EcommerceAppAngular.git
cd EcommerceAppAngular

# Installer les dépendances
npm install
```

### Démarrage

```bash
# Terminal 1 — Backend (port 5180)
node server.js

# Terminal 2 — Frontend (port 4200)
ng serve
```

Accéder à l'application : [http://localhost:4200](http://localhost:4200)

## 👤 Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | admin@eshop.com | admin123 |
| Client | client@eshop.com | client123 |

## 📁 Structure du projet

```
src/
├── app/
│   ├── core/           # Guards, interceptors, services, modèles
│   ├── features/
│   │   ├── admin/      # Dashboard, produits, catégories, users
│   │   ├── auth/       # Login, register, mot de passe
│   │   └── client/     # Home, catalogue, panier, commandes
│   └── shared/         # Composants réutilisables
├── environments/       # Config API
└── styles.scss         # Thème global TailwindCSS
```

## 🌐 API

Le backend de démonstration expose les routes suivantes sur `http://localhost:5180` :

```
POST   /api/auth/sign-in
POST   /api/auth/sign-up
GET    /api/products
GET    /api/products/:id
GET    /api/categories
GET    /api/orders
GET    /api/users
GET    /api/users/wishlist/:id
GET    /api/dashboard
```

---

Built with ❤️ using Angular 21

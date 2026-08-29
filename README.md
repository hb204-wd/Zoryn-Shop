# Zoryn Project

> Application e-commerce de produits informatiques — MVP fonctionnel

## Qu'est-ce que c'est ?

**Zoryn** est un site e-commerce qui vend du materiel informatique (processeurs, cartes graphiques, RAM, ecrans, etc.). C'est un projet de demonstration qui montre comment construire un site comme Amazon avec Next.js.

---

## Pour commencer rapidement

```bash
# 1. Installer les dependances
npm install

# 2. Configurer la base de donnees
cp .env.example .env
# Editer .env avec votre mot de passe MySQL

# 3. Creer les tables et remplir les donnees
npx prisma migrate dev --name init
npx prisma db seed

# 4. Lancer le site
npm run dev
```

Le site est sur **http://localhost:3000**

---

## Comprendre le projet de A a Z

### C'est quoi Next.js ?

Next.js est un framework React qui gere automatiquement les pages et les URLs. Contrairement a React classique ou on doit configurer le "routing" (les liens entre pages) soi-meme, Next.js le fait tout seul grace a la **structure des dossiers**.

**Exemple simple :**
- Le fichier `src/app/page.tsx` = la page d'accueil (`/`)
- Le fichier `src/app/products/page.tsx` = la page catalogue (`/products`)
- Le fichier `src/app/cart/page.tsx` = la page panier (`/cart`)

Si tu crees un dossier `src/app/contact/page.tsx`, ca cree automatiquement la page `/contact`.

### C'est quoi React ?

React est une bibliotheque JavaScript pour creer des interfaces graphiques. L'idee de base est de decouper l'interface en **composants** (des petits morceaux reutilisables).

**Exemple :** Le bouton "Ajouter au panier" est un composant. On peut le reutiliser sur la page catalogue ET sur la page detail produit.

Il y a deux types de composants React :
- **Composants serveur** (par defaut dans Next.js) : le code tourne sur le serveur, le navigateur recoit du HTML pret
- **Composants client** (avec `"use client"` au debut du fichier) : le code tourne dans le navigateur, gere les clics et les interactions

### C'est quoi TypeScript ?

TypeScript est JavaScript avec des types. Au lieu d'ecrire :
```javascript
let prix = 10;  // JavaScript : on ne sait pas si c'est un nombre ou du texte
```
On ecrit :
```typescript
let prix: number = 10;  // TypeScript : on sait que c'est un nombre
```
Ca evite beaucoup d'erreurs.

### C'est quoi Tailwind CSS ?

Tailwind CSS est une facon d'ecrire du CSS (le style des pages) directement dans le code HTML. Au lieu de creer des fichiers CSS separes, on ecrit les classes directement :

```tsx
// Sans Tailwind : <button class="btn-primaire">
// Avec Tailwind : <button class="bg-[#ff9900] text-white px-4 py-2 rounded">
```

### C'est quoi Prisma ?

Prisma est un outil qui facilite la communication avec la base de donnees MySQL. Au lieu d'ecrire du SQL a la main, on ecrit du TypeScript et Prisma le transforme en SQL.

**Exemple :**
```typescript
// Prisma (facile)
const produits = await db.product.findMany();

// SQL (complique)
const produits = await db.$queryRaw`SELECT * FROM products`;
```

---

## Structure du projet

```
Zoryn Project/
├── src/
│   ├── app/                    # Toutes les pages du site
│   │   ├── page.tsx           # Page d'accueil
│   │   ├── products/          # Catalogue + detail produit
│   │   ├── cart/              # Panier
│   │   ├── checkout/          # Page de paiement
│   │   ├── order-confirmation/# Confirmation de commande
│   │   ├── auth/              # Connexion et inscription
│   │   ├── account/           # Espace utilisateur
│   │   ├── admin/             # Espace administrateur
│   │   └── api/               # Les "API" (le backend)
│   ├── components/            # Les morceaux reutilisables
│   │   ├── layout/            # Header, Footer, SearchBar
│   │   ├── product/           # Carte produit, etoiles, etc.
│   │   ├── cart/              # Articles du panier
│   │   ├── checkout/          # Formulaire de livraison
│   │   └── auth/              # Formulaire de connexion
│   └── lib/                   # La logique metier
│       ├── db.ts              # Connexion a la base de donnees
│       ├── auth.ts            # Gestion de la connexion utilisateur
│       ├── cart-context.tsx   # Etat global du panier
│       ├── analytics.ts       # Suivi des actions utilisateurs
│       ├── format.ts          # Fonctions utilitaires (formatage prix)
│       └── constants.ts       # Constantes partagees (labels de statuts)
├── prisma/
│   ├── schema.prisma          # Definition de la base de donnees
│   ├── seed.ts                # Donnees de demonstration
│   └── migrations/            # Historique des modifications BDD
├── sql/                       # Requetes SQL pour les statistiques
├── scripts/analytics/         # Scripts Python pour l'analyse
└── .env                       # Variables de configuration
```

---

## Comment fonctionne chaque partie

### 1. Les pages (`src/app/`)

Chaque dossier dans `src/app/` est une page. Chaque page est un fichier `page.tsx`.

**La page d'accueil (`src/app/page.tsx`) :**
- C'est un composant serveur (pas de `"use client"`)
- Elle recupere les produits depuis la base de donnees
- Elle affiche les categories et les produits vedettes

**La page catalogue (`src/app/products/page.tsx`) :**
- Recoit les parametres d'URL (recherche, categorie, prix, tri)
- Filtre les produits dans la base de donnees
- Affiche les produits avec pagination

**La page detail produit (`src/app/products/[slug]/page.tsx`) :**
- Le `[slug]` signifie que la page accepte un parametre dynamique
- Exemple : `/products/intel-core-i9-14900k`
- Affiche toutes les infos d'un produit

### 2. Les API (`src/app/api/`)

Les API sont des "services" que le frontend appelle pour recuperer ou envoyer des donnees. Elles retournent du JSON (pas du HTML).

**Exemple de flow :**
1. L'utilisateur clique "Ajouter au panier"
2. Le navigateur appelle `POST /api/cart` avec l'ID du produit
3. L'API ajoute le produit dans la base de donnees
4. L'API repond "OK, c'est fait"
5. Le panier dans le header se met a jour

**Les principales API :**
| URL | Ce qu'elle fait |
|-----|-----------------|
| `GET /api/products` | Recuperer la liste des produits |
| `POST /api/cart` | Ajouter un produit au panier |
| `GET /api/cart` | Voir le contenu du panier |
| `POST /api/checkout` | Creer une commande |
| `POST /api/auth/login` | Se connecter |
| `POST /api/auth/register` | Creer un compte |

### 3. Les composants (`src/components/`)

Les composants sont des morceaux de page reutilisables.

**Header (`src/components/layout/Header.tsx`) :**
- Barre de recherche
- Menu des categories
- Lien vers le panier avec le nombre d'articles
- Connexion utilisateur

**ProductCard (`src/components/product/ProductCard.tsx`) :**
- Affiche un produit dans le catalogue
- Image, nom, prix, bouton "Ajouter au panier"

### 4. La base de donnees (`prisma/schema.prisma`)

Le fichier `schema.prisma` definit toutes les "tables" (comme des tableaux Excel) de la base de donnees.

**Les principales tables :**
| Table | Contenu |
|-------|---------|
| `users` | Les utilisateurs (nom, email, mot de passe, role) |
| `categories` | Les categories (Processeurs, Cartes Graphiques, etc.) |
| `products` | Les produits (nom, prix, description, stock) |
| `product_images` | Les images des produits |
| `carts` / `cart_items` | Les paniers |
| `orders` / `order_items` | Les commandes |
| `analytics_events` | Les actions des utilisateurs (pour les stats) |

### 5. L'authentification (`src/lib/auth.ts`)

Le systeme de connexion fonctionne avec des **cookies** et des **JWT** (JSON Web Token).

**Comment ca marche :**
1. L'utilisateur se connecte (email + mot de passe)
2. Le serveur verifie le mot de passe
3. Le serveur cree un "token" (un code crypte)
4. Le token est stocke dans un cookie du navigateur
5. A chaque requete, le serveur lit le cookie pour savoir qui est l'utilisateur

### 6. Le panier (`src/lib/cart-context.tsx`)

Le panier utilise un **React Context** pour partager l'etat du panier entre toutes les pages.

**Comment ca marche :**
- `CartProvider` enveloppe tout le site (dans `layout.tsx`)
- Chaque composant peut appeler `useCart()` pour lire ou modifier le panier
- Quand on ajoute un produit, le nombre dans le header se met a jour automatiquement

---

## Les donnees de demonstration

Le site est rempli de fausses donnees pour tester :

- **8 categories** : Processeurs, Cartes Meres, Cartes Graphiques, RAM, Stockage, Ecrans, Peripheriques, Accessoires
- **61 produits** : Intel, AMD, NVIDIA, Corsair, Samsung, LG, etc. avec des prix reels
- **50 utilisateurs** de test + 1 administrateur (`admin@zoryn.fr` / `admin123`)
- **118 avis** sur les produits
- **110 commandes** passees
- **550 evenements** analytics

---

## Commandes utiles

| Commande | A quoi ca sert |
|----------|----------------|
| `npm run dev` | Lancer le site en mode developpement |
| `npm run build` | Preparer le site pour la mise en production |
| `npm run lint` | Verifier qu'il n'y a pas d'erreurs dans le code |
| `npx prisma studio` | Ouvrir une interface graphique pour voir la base de donnees |
| `npx prisma db seed` | Remplir la base avec les donnees de demonstration |
| `npx prisma migrate dev --name <nom>` | Enregistrer les changements de la base de donnees |

---

## Problemes courants

### "Erreur de connexion a la base de donnees"
- Verifie que MySQL tourne : `sudo systemctl status mysql`
- Verifie le mot de passe dans `.env`
- Verifie que la base existe : `mysql -u root -p -e "SHOW DATABASES;"`

### "Port 3000 deja utilise"
```bash
lsof -i :3000        # Trouver le processus
kill -9 <PID>        # Le fermer
```

### "Le build echoue"
```bash
npx prisma generate  # Regenerer le client Prisma
npm run build        # Relancer le build
```

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Style | Tailwind CSS |
| Base de donnees | MySQL 8, Prisma ORM |
| Authentification | Cookies + JWT (jose) |
| Analytics | SQL, Python/Pandas |

---

## Licence

Projet de demonstration — Usage academique et portfolio

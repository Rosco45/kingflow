# 👑 KingFlow — SaaS de Gestion Commerciale, Facturation & Stocks

**KingFlow** est une application web SaaS complète, moderne et responsive conçue spécialement pour les PME, commerçants, boutiques physiques et entrepreneurs indépendants.

---

## 🌟 Fonctionnalités Clés & Modules

### 1. Tableau de Bord & Analytics (Dashboard)
- **KPIs en temps réel** :
  - Chiffre d'affaires mensuel.
  - Créances clients en attente de recouvrement.
  - Dépenses opérationnelles du mois.
  - Marge nette estimée (Bénéfice d'exploitation).
- **Graphique interactif (Recharts)** : Évolution des ventes vs charges sur les 6 derniers mois avec courbe de marge nette.
- **Top 5 des produits les plus vendus** (volume et chiffre d'affaires généré).
- **Alertes de stock direct** : Notification instantanée des articles sous le seuil d'alerte ou en rupture de stock.
- **Sélecteur multi-devises** : Franc CFA (XOF / FCFA par défaut), Euro (€) et Dollar US ($) avec conversion dynamique instantanée.
- **Agenda Commercial & Dates Clés** : Bouton date interactif ouvrant un calendrier mensuel et un planning des livraisons, réunions et échéances clients avec programmation directe.
- **Barre de Recherche Globale (Ctrl + K)** : Recherche unifiée et instantanée à travers les produits, clients et factures avec raccourcis clavier et fermeture intuitive (Échap / clic extérieur).
- **Thèmes d'Affichage** : Bascule fluide entre le mode Fond Blanc bleuté moderne et le mode Bleu Nuit sombre avec persistance.

### 2. Gestion des Tiers (CRM Clients & Fournisseurs)
- **CRUD complet** avec recherche instantanée et filtres (créances actives, localités).
- **Fiche Client 360°** :
  - Coordonnées complètes, téléphone, email, adresse.
  - Actions en 1 clic : **WhatsApp direct** et **Appel direct**.
  - Historique complet des transactions (factures et règlements).
  - Balance du compte : Total facturé, total payé, solde restant dû.
  - Bouton rapide : *Nouvelle facture pour ce client*.
- **Gestion des Fournisseurs** :
  - Catégorisation des partenaires.
  - Historique des achats et réapprovisionnements.
  - Suivi des dettes fournisseurs en attente de paiement.

### 3. Catalogue & Gestion des Stocks
- **Gestion hybride** : Produits physiques avec stock et Prestations de services.
- **Attributs riches** : Référence SKU/Code-barres, désignation, catégorie, prix d'achat, prix de vente, seuil d'alerte personnalisable, unité de mesure.
- **Journal des mouvements de stock** : Traçabilité des Entrées (BL fournisseurs), Sorties (ventes sur facture), Ajustements manuels avec motifs (*Casse, Perte, Inventaire, Retour*).
- **Badges visuels dynamiques** : *En stock (vert)*, *Stock faible (ambre)*, *Rupture (rouge)*.

### 4. Facturation & Ventes (Devis, Factures & Reçus)
- **Créateur de documents dynamique** :
  - Sélection autocomplétée du client.
  - Lignes d'articles intelligentes avec remplissage automatique depuis le catalogue ou saisie libre.
  - Calcul en direct des sous-totaux, remises (% ou montant fixe), taux de TVA configurable (18% par défaut), et total net TTC.
  - Prise en charge des acomptes initiaux à la création.
  - Statuts gérés : *Brouillon, Envoyé, Partiellement payé, Payé, En retard, Annulé*.
- **Sorties & Formats multi-canaux** :
  - 📄 **Facture A4 Professionnelle** : Mise en page haute résolution téléchargeable en PDF (jsPDF + html2canvas) avec montant en toutes lettres, logo, NINEA/RCCM et mentions de règlement.
  - 🧾 **Ticket de Caisse Thermique 80mm** : Format optimisé pour imprimantes thermiques de point de vente (POS) avec politique de retour et code-barres.
  - 💬 **Partage WhatsApp instantané** : Message pré-formaté envoyé au client via WhatsApp Web / Mobile avec le récapitulatif complet de sa facture.
  - ⚡ **Conversion Devis ➔ Facture en 1 clic** : Génération du numéro de facture officiel et décrémentation automatique du stock en temps réel.

### 5. Trésorerie, Dépenses & Dettes
- **Grand livre des charges opérationnelles** : Suivi des postes de dépenses (*Loyer, Électricité/Eau, Transport/Logistique, Salaires, Achats marchandises, Marketing, etc.*).
- **Enregistrement des règlements** : Gestion des paiements partiels et acomptes avec modes adaptés (*Espèces, Wave Mobile, Orange Money, MTN MoMo, Virement bancaire, Chèque*).
- **Vue dédiée "Créances clients & Dettes fournisseurs"** :
  - Balance âgée avec calcul des jours de retard.
  - Bouton direct de relance WhatsApp avec message personnalisé.

### 6. Exports & Rapports Comptables
- **Exports Excel (.xlsx) complets** (via SheetJS) :
  - Grand livre des ventes & factures.
  - Journal complet des dépenses.
  - Inventaire et valorisation des stocks (coût de revient vs vente).
  - Balance détaillée des créances clients.
- **Rapport Mensuel PDF d'activité** : Bilan financier synthétique prêt pour expert-comptable ou direction.

### 7. Paramètres d'Entreprise
- Personnalisation de la raison sociale, logo, identifiant fiscal (NINEA / RCCM / TVA), adresse, devise de base, taux de TVA standard et mentions légales.

---

## 🛠️ Stack Technique

- **Frontend & App Router** : Next.js 14, React 18, TypeScript
- **Styling** : Tailwind CSS, Lucide Icons, styles d'impression thermique @media print
- **Base de Données & ORM** : SQLite avec Prisma ORM
- **Visualisations** : Recharts
- **Exports** : xlsx (SheetJS), jsPDF, html2canvas
- **Formulaires & Validation** : React Hook Form, Zod

---

## 🚀 Installation & Démarrage Rapide

```bash
# 1. Cloner le projet
git clone https://github.com/Rosco45/kingflow.git
cd kingflow

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement & la base de données SQLite
cp .env.example .env
npx prisma generate
npx prisma db push

# 4. Charger les données de démonstration réalistes
npx tsx prisma/seed.ts
npx tsx prisma/seed-events.ts

# 5. Lancer en mode développement
npm run dev

# Ou compiler et lancer en mode production
npm run build
npm run start
```

L'application est disponible sur : **`http://localhost:3000`**

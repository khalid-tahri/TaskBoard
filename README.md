# TaskBoard - Gestionnaire de Tâches Kanban

TaskBoard est une application web moderne de gestion de tâches basée sur la méthodologie Kanban. Conçue avec un design "Glassmorphism" élégant et premium, elle permet de visualiser, d'organiser et de suivre le temps passé sur ses différentes activités de manière intuitive.

L'application est construite de façon légère et performante, sans aucun framework (Vanilla JS, HTML, CSS), et sauvegarde toutes les données localement sur le navigateur.

## 🚀 Fonctionnalités Principales

### 📋 Gestion des Tâches (CRUD)
*   **Création & Édition** : Ajoutez de nouvelles tâches avec un titre, une description, une priorité (Basse, Moyenne, Haute) et un module associé. Double-cliquez sur une tâche existante pour la modifier.
*   **Organisation par statut** : Les tâches sont réparties dans 3 colonnes : *À faire*, *En cours*, et *Terminé*.
*   **Drag & Drop (Glisser-déposer)** : Déplacez facilement vos tâches d'une colonne à une autre de manière fluide grâce à l'API HTML5 Drag and Drop native.
*   **Suppression** : Un bouton de suppression rapide est accessible au survol d'une carte.

### ⏱️ Suivi du Temps (Time Tracking)
*   **Chronomètre automatique** : Lorsqu'une tâche est glissée dans la colonne *En cours*, un chronomètre se déclenche automatiquement.
*   **Mise en pause** : Si la tâche est replacée dans *À faire* ou *Terminé*, le chronomètre s'arrête et le temps passé est mémorisé.
*   **Affichage dynamique** : Le temps cumulé (en heures et minutes) s'affiche sous forme de badge directement sur la carte de la tâche.

### 🏷️ Gestion Dynamique des Modules
*   **Catégorisation visuelle** : Les tâches peuvent être associées à des "Modules" ou catégories.
*   **Gestion complète (CRUD)** : Via une interface dédiée, vous pouvez créer de nouveaux modules en leur attribuant un nom et une couleur personnalisée, les lister et les supprimer.
*   **Code couleur** : Chaque carte de tâche adopte automatiquement la couleur du module auquel elle est associée (bordure colorée).

### 🎨 Design Premium & Personnalisation
*   **Glassmorphism** : Interface moderne utilisant des effets de transparence, de flou (blur) et des ombres douces.
*   **Mode Sombre & Clair** : Un bouton permet de basculer instantanément entre un Dark Mode profond et un Light Mode lumineux. Les couleurs et les contrastes s'adaptent automatiquement pour garantir une lisibilité parfaite.
*   **100% Responsive** : L'interface est optimisée pour s'afficher aussi bien sur ordinateur que sur smartphone (mise en page en colonne, modales adaptées, boutons tactiles).

### 💾 Sauvegarde Locale (Persistence)
*   Aucun compte ni base de données requis. Toutes vos tâches, vos modules personnalisés et vos préférences de thème sont sauvegardés en temps réel dans le `localStorage` de votre navigateur.

## 🛠️ Technologies Utilisées
*   **HTML5** : Structure sémantique.
*   **CSS3 (Vanilla)** : Variables CSS (`:root`), Flexbox, Grid, Media Queries, et fonctions de mixage de couleurs.
*   **JavaScript (Vanilla ES6+)** : Logique métier orientée objet (Class `KanbanApp`), manipulation du DOM et de l'API Drag and Drop sans aucune dépendance externe (ni React, ni jQuery).

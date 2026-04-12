# Accessibilité aux services essentiels – Lausanne

## Description

Ce projet vise à analyser et visualiser l’accessibilité aux services essentiels dans la ville de Lausanne (Suisse), en combinant des données spatiales et une visualisation web interactive.

L’analyse repose sur trois types de services :
- 🏥 Hôpitaux et cliniques
- 🏫 Écoles
- 🚌 Arrêts de transport public

Chaque quartier est évalué selon un indicateur synthétique d’accessibilité.


## Objectifs

- Évaluer les inégalités d’accès aux services essentiels
- Produire un indicateur spatial par quartier
- Développer une carte interactive pour explorer les résultats


## Méthodologie

### 1. Préparation des données (QGIS)

- Import des limites de quartiers
- Ajout des données de population
- Calcul des centroïdes des quartiers
- Calcul de la distance au service le plus proche :
  - hôpitaux
  - écoles
  - arrêts de transport

### 2. Construction de l’indicateur

Un score d’accessibilité a été calculé à partir des distances aux services :

- Distance hôpital (pondération 0.5)
- Distance école (pondération 0.3)
- Distance transport (pondération 0.2)

--> Plus le score est élevé, plus l’accessibilité est faible.


## Visualisation web

Une carte interactive a été développée avec **Leaflet.js** :

Fonctionnalités :
- Choroplèthe par quartier
- Popup avec informations (population, score, niveau)
- Affichage optionnel des services :
  - arrêts
  - écoles
  - hôpitaux
- Interaction utilisateur (zoom, sélection)


## Technologies utilisées

- QGIS (analyse spatiale)
- GeoJSON
- HTML / CSS / JavaScript
- Leaflet.js


## Résultats

La carte met en évidence :
- des zones centrales mieux desservies
- des quartiers périphériques avec une accessibilité plus faible


## Améliorations possibles

- Intégration d’un réseau routier (distance réelle au lieu de distance euclidienne)
- Ajout d’autres services (commerces, santé de proximité)
- Amélioration de l’indicateur (normalisation, pondérations dynamiques)


## Données

Les données utilisées proviennent de sources ouvertes (OpenStreetMap et données locales).


Projet réalisé dans le cadre d’un travail personnel de remise à niveau en analyse spatiale et SIG.


![Carte Lausanne](img/carte.png)
console.log("JS chargé");

// ======================================================
// 1) CRÉATION DE LA CARTE
// ======================================================
// On crée la carte Leaflet dans la div HTML qui a l'id "map".
// On limite aussi le zoom pour éviter de trop dézoomer ou trop zoomer.
const map = L.map("map", {
  minZoom: 11,
  maxZoom: 16,
  zoomControl: true
}).setView([46.5197, 6.6323], 12);

// ======================================================
// 2) LIMITER LE DÉPLACEMENT AUTOUR DE LAUSANNE
// ======================================================
// Cette boîte géographique limite le déplacement de la carte.
const bounds = L.latLngBounds(
  [46.45, 6.52], // sud-ouest
  [46.60, 6.78]  // nord-est
);

map.setMaxBounds(bounds);
map.options.maxBoundsViscosity = 1.0;

// ======================================================
// 3) FOND DE CARTE SOMBRE
// ======================================================
// Fond sombre CARTO pour mieux faire ressortir les couleurs.
L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  attribution: "&copy; OpenStreetMap &copy; CARTO",
  subdomains: "abcd",
  maxZoom: 20
}).addTo(map);

// ======================================================
// 4) VARIABLES DES COUCHES
// ======================================================
// geojson = quartiers
// arretsLayer / ecolesLayer / hopitauxLayer = services
let geojson;
let arretLayer;
let ecoleLayer;
let hopitalLayer;
let layerControl;

// ======================================================
// 5) COULEURS DES QUARTIERS SELON L'INDICATEUR
// ======================================================
// Plus la valeur est élevée, plus l'accès est mauvais.
function getColor(value) {
  if (value > 9448637) {
    return "#c2410c"; // très faible accès
  } else if (value > 5066920) {
    return "#ea580c"; // accès faible
  } else if (value > 2595240) {
    return "#f59e0b"; // accès moyen
  } else if (value > 1395780) {
    return "#84cc16"; // accès correct
  } else {
    return "#16a34a"; // bon accès
  }
}

// ======================================================
// 6) INTERPRÉTATION TEXTUELLE DE L'INDICATEUR
// ======================================================
// Cette fonction sert dans le popup.
function getInterpretation(score) {
  if (score > 9448637) {
    return "Très faible accès";
  } else if (score > 5066920) {
    return "Accès faible";
  } else if (score > 2595240) {
    return "Accès moyen";
  } else if (score > 1395780) {
    return "Accès correct";
  } else {
    return "Bon accès";
  }
}

// ======================================================
// 7) FORMATAGE DES NOMBRES
// ======================================================
// Rend les grands nombres plus lisibles dans les popups.
function formatNumber(num) {
  return Number(num).toLocaleString("fr-CH");
}

// ======================================================
// 8) STYLE DES QUARTIERS
// ======================================================
// Apparence des polygones.
function style(feature) {
  return {
    fillColor: getColor(feature.properties.access),
    weight: 1,
    opacity: 1,
    color: "rgba(255,255,255,0.65)",
    fillOpacity: 0.6
  };
}

// ======================================================
// 9) EFFET AU SURVOL D'UN QUARTIER
// ======================================================
function highlightFeature(e) {
  const layer = e.target;

  layer.setStyle({
    weight: 2,
    color: "#ffffff",
    fillOpacity: 0.4
  });
}

// ======================================================
// 10) RETOUR AU STYLE NORMAL
// ======================================================
function resetHighlight(e) {
  geojson.resetStyle(e.target);
}

// ======================================================
// 11) ZOOM SUR LE QUARTIER AU CLIC
// ======================================================
function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

// ======================================================
// 12) POPUP DES QUARTIERS
// ======================================================
// Cette fonction est appliquée à chaque quartier.
function onEachFeature(feature, layer) {
  const p = feature.properties;

  layer.bindPopup(`
    <strong>${p.NAME}</strong><br><br>
    Population : ${formatNumber(p.Population)}<br>
    Score : ${formatNumber(p.access)}<br>
    Niveau : ${getInterpretation(p.access)}
  `);

  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });
}

// ======================================================
// 13) STYLE DES ARRÊTS
// ======================================================
// Petits cercles bleus.
function styleArret(feature, latlng) {
  return L.circleMarker(latlng, {
    radius: 2,
    fillColor: "#38bdf8",
    color: "#ffffff",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.6
  });
}

// ======================================================
// 14) STYLE DES ÉCOLES
// ======================================================
// Cercles jaunes.
function styleEcole(feature, latlng) {
  return L.circleMarker(latlng, {
    radius: 5,
    fillColor: "#facc15",
    color: "#ffffff",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  });
}

// ======================================================
// 15) STYLE DES HÔPITAUX
// ======================================================
// Cercles rouges légèrement plus gros.
function styleHopital(feature, latlng) {
  return L.circleMarker(latlng, {
    radius: 6,
    fillColor: "#f472b6",
    color: "#ffffff",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  });
}

// ======================================================
// 16) POPUP DES ARRÊTS
// ======================================================
function onEachArret(feature, layer) {
  const p = feature.properties;

  layer.bindPopup(`
    <strong>Arrêt de transport</strong><br>
    Nom : ${p.name || p.NAME || "Non renseigné"}
  `);
}

// ======================================================
// 17) POPUP DES ÉCOLES
// ======================================================
function onEachEcole(feature, layer) {
  const p = feature.properties;

  layer.bindPopup(`
    <strong>École</strong><br>
    Nom : ${p.name || p.NAME || "Non renseigné"}
  `);
}

// ======================================================
// 18) POPUP DES HÔPITAUX
// ======================================================
function onEachHopital(feature, layer) {
  const p = feature.properties;

  layer.bindPopup(`
    <strong>Hôpital / clinique</strong><br>
    Nom : ${p.name || p.NAME || "Non renseigné"}
  `);
}

// ======================================================
// 19) AJOUTER LE CONTRÔLE DE COUCHES
// ======================================================
// Cette fonction crée la boîte avec les cases à cocher.
// Les couches de services n'apparaissent pas tout de suite sur la carte.
// L'utilisateur peut les afficher en cochant.
function addLayerControl() {
  // Si un contrôle existe déjà, on le supprime pour éviter les doublons
  if (layerControl) {
    map.removeControl(layerControl);
  }

  const overlays = {
  "🚌 Arrêts de transport": arretLayer,
  "🏫 Écoles": ecoleLayer,
  "🏥 Hôpitaux / cliniques": hopitalLayer
  };

  layerControl = L.control.layers(null, overlays, {
    collapsed: false,
    position: "bottomright"
  });

  layerControl.addTo(map);
}

// ======================================================
// 20) CHARGEMENT DES QUARTIERS
// ======================================================
// On charge la couche principale de la carte.
fetch("data/quartiers.geojson")
  .then(function (response) {
    if (!response.ok) {
      throw new Error("Erreur HTTP quartiers : " + response.status);
    }
    return response.json();
  })
  .then(function (data) {
    console.log("Quartiers chargés :", data);

    geojson = L.geoJSON(data, {
      style: style,
      onEachFeature: onEachFeature
    }).addTo(map);

    // On ajuste la carte à l'emprise des quartiers
    map.fitBounds(geojson.getBounds());
  })
  .catch(function (error) {
    console.error("Erreur de chargement des quartiers :", error);
  });

// ======================================================
// 21) CHARGEMENT DES ARRÊTS
// ======================================================
// On charge la couche mais on ne l'ajoute PAS directement à la carte.
fetch("data/arret.geojson")
  .then(function (response) {
    if (!response.ok) {
      throw new Error("Erreur HTTP arrêts : " + response.status);
    }
    return response.json();
  })
  .then(function (data) {
    console.log("Arrêts chargés :", data);

    arretLayer = L.geoJSON(data, {
      pointToLayer: styleArret,
      onEachFeature: onEachArret
    });

    // Si les trois couches de services sont prêtes,
    // on peut créer le contrôle de couches.
    if (arretLayer && ecoleLayer && hopitalLayer) {
      addLayerControl();
    }
  })
  .catch(function (error) {
    console.error("Erreur de chargement des arrêts :", error);
  });

// ======================================================
// 22) CHARGEMENT DES ÉCOLES
// ======================================================
fetch("data/ecole.geojson")
  .then(function (response) {
    if (!response.ok) {
      throw new Error("Erreur HTTP écoles : " + response.status);
    }
    return response.json();
  })
  .then(function (data) {
    console.log("Écoles chargées :", data);

    ecoleLayer = L.geoJSON(data, {
      pointToLayer: styleEcole,
      onEachFeature: onEachEcole
    });

    if (arretLayer && ecoleLayer && hopitalLayer) {
      addLayerControl();
    }
  })
  .catch(function (error) {
    console.error("Erreur de chargement des écoles :", error);
  });

// ======================================================
// 23) CHARGEMENT DES HÔPITAUX
// ======================================================
fetch("data/hopital.geojson")
  .then(function (response) {
    if (!response.ok) {
      throw new Error("Erreur HTTP hôpitaux : " + response.status);
    }
    return response.json();
  })
  .then(function (data) {
    console.log("Hôpitaux chargés :", data);

    hopitalLayer = L.geoJSON(data, {
      pointToLayer: styleHopital,
      onEachFeature: onEachHopital
    });

    if (arretLayer && ecoleLayer && hopitalLayer) {
      addLayerControl();
    }
  })
  .catch(function (error) {
    console.error("Erreur de chargement des hôpitaux :", error);
  });

// ======================================================
// 24) LÉGENDE DES QUARTIERS
// ======================================================
// Petite boîte qui explique l'indicateur.
const legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
  const div = L.DomUtil.create("div", "info legend");

  div.innerHTML = `
    <h4>Indicateur d'accessibilité</h4>
    <div class="legend-subtitle">Lecture synthétique par quartier</div>

    <div class="legend-item">
      <span class="legend-color" style="background:#16a34a"></span>
      <span>Bon accès</span>
    </div>

    <div class="legend-item">
      <span class="legend-color" style="background:#84cc16"></span>
      <span>Accès correct</span>
    </div>

    <div class="legend-item">
      <span class="legend-color" style="background:#f59e0b"></span>
      <span>Accès moyen</span>
    </div>

    <div class="legend-item">
      <span class="legend-color" style="background:#ea580c"></span>
      <span>Accès faible</span>
    </div>

    <div class="legend-item">
      <span class="legend-color" style="background:#c2410c"></span>
      <span>Très faible accès</span>
    </div>
  `;

  return div;
};

legend.addTo(map);
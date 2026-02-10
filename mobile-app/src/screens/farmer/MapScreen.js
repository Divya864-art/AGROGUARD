import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

import soilRules from "../../services/soilCropRules.json";
import indianSoil from "../../services/indian_final_soil";
import reservoirsGeo from "../../services/reservoirs";
import { MAPBOX_TOKEN } from "../../config/mapbox";

/* ================= HELPERS ================= */

const toRad = v => (v * Math.PI) / 180;

const distKm = (a, b, c, d) => {
  const R = 6371;
  return (
    R *
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin(toRad(c - a) / 2) ** 2 +
          Math.cos(toRad(a)) *
            Math.cos(toRad(c)) *
            Math.sin(toRad(d - b) / 2) ** 2
      )
    )
  );
};

const normalizeSoil = s =>
  s ? s.toLowerCase().replace(" soil", "").trim() : null;

/* 🔑 CRITICAL: SAFE soil key matcher */
const getSoilRuleKey = soil => {
  if (!soil) return null;
  return Object.keys(soilRules).find(
    k => k.toLowerCase() === soil.toLowerCase()
  );
};

const centroid = feature => {
  try {
    const g = feature.geometry;
    const coords =
      g.type === "Polygon"
        ? g.coordinates[0]
        : g.coordinates[0][0];

    let lat = 0;
    let lon = 0;

    coords.forEach(p => {
      lon += p[0];
      lat += p[1];
    });

    return {
      latitude: lat / coords.length,
      longitude: lon / coords.length,
    };
  } catch {
    return null;
  }
};

/* ================= SCREEN ================= */

export default function MapScreen() {
  const mapRef = useRef(null);

  const [mode, setMode] = useState("REGION");
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("");

  const [marker, setMarker] = useState(null);
  const [cropMarkers, setCropMarkers] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);

  const [regionName, setRegionName] = useState("");
  const [soil, setSoil] = useState(null);
  const [reservoir, setReservoir] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState("");

  /* ---------- RESERVOIRS ---------- */
  const reservoirs = reservoirsGeo.features.map(f => ({
    name: f.properties.Name_of_Da,
    river: f.properties.River,
    lat: f.geometry.coordinates[1],
    lon: f.geometry.coordinates[0],
  }));

  /* ---------- SOIL ---------- */
  const detectSoil = (lat, lon) => {
    let min = Infinity;
    let type = null;

    indianSoil.features.forEach(f => {
      const c = centroid(f);
      if (!c) return;

      const d = distKm(lat, lon, c.latitude, c.longitude);
      if (d < min) {
        min = d;
        type = normalizeSoil(f.properties.soil_type);
      }
    });

    return type;
  };

  /* ---------- RESERVOIR ---------- */
  const detectReservoir = (lat, lon) => {
    let min = Infinity;
    let near = null;

    reservoirs.forEach(r => {
      const d = distKm(lat, lon, r.lat, r.lon);
      if (d < min) {
        min = d;
        near = r;
      }
    });

    return near;
  };

  /* ---------- MAPBOX ---------- */
  const reverseGeocode = async (lat, lon) => {
    try {
      const r = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${MAPBOX_TOKEN}`
      );
      const j = await r.json();
      return j.features?.[0]?.place_name || "Unknown Region";
    } catch {
      return "Unknown Region";
    }
  };

  /* ---------- TAP / MARKER SELECT ---------- */
  const selectLocation = async (lat, lon) => {
    const soilRaw = detectSoil(lat, lon);
    const soilKey = getSoilRuleKey(soilRaw);
    const nearRes = detectReservoir(lat, lon);
    const name = await reverseGeocode(lat, lon);

    setMarker({ latitude: lat, longitude: lon });
    setSelectedPoint({ latitude: lat, longitude: lon });
    setSoil(soilKey);
    setReservoir(nearRes);
    setRegionName(name);
    setSelectedCrop("");
    setArea("");
    setCropMarkers([]);

    mapRef.current?.animateToRegion({
      latitude: lat,
      longitude: lon,
      latitudeDelta: 0.8,
      longitudeDelta: 0.8,
    });
  };

  /* ---------- REGION → CROP ---------- */
  const searchRegion = async () => {
    if (!search) return;

    const r = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${search}.json?access_token=${MAPBOX_TOKEN}`
    );
    const j = await r.json();
    if (!j.features?.length) return;

    const [lon, lat] = j.features[0].center;
    selectLocation(lat, lon);
  };

  /* ---------- CROP → REGION ---------- */
  const searchCrop = () => {
    const crop = search.trim().toLowerCase();
    if (!crop) return;

    const markers = [];
    const used = new Set();

    indianSoil.features.forEach(f => {
      const soilRaw = normalizeSoil(f.properties.soil_type);
      const soilKey = getSoilRuleKey(soilRaw);
      if (!soilKey) return;

      if (
        soilRules[soilKey].crops.some(
          c => c.toLowerCase() === crop
        )
      ) {
        const c = centroid(f);
        if (!c) return;

        const hash = `${Math.round(c.latitude)}-${Math.round(c.longitude)}`;
        if (used.has(hash)) return;

        used.add(hash);
        markers.push(c);
      }
    });

    console.log("Crop → Region markers:", markers.length);

    setCropMarkers(markers);
    setMarker(null);
    setSelectedPoint(null);
    setSoil(null);
    setReservoir(null);
    setRegionName("");
    setSelectedCrop("");
    setArea("");

    if (markers.length && mapRef.current) {
      mapRef.current.fitToCoordinates(markers, {
        edgePadding: { top: 80, bottom: 200, left: 80, right: 80 },
        animated: true,
      });
    }
  };

  /* ---------- YIELD ---------- */
  let yieldVal = 0;
  let revenue = 0;

  if (soil && selectedCrop && area !== "") {
    yieldVal =
      soilRules[soil].yieldPerAcre[selectedCrop] *
      Number(area);

    revenue =
      yieldVal *
      soilRules[soil].pricePerQuintal[selectedCrop];
  }

  /* ================= UI ================= */

  return (
    <View style={{ flex: 1 }}>
      {/* SEARCH */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          value={search}
          onChangeText={setSearch}
          placeholder={
            mode === "REGION"
              ? "Search Region (Salem)"
              : "Search Crop (Paddy)"
          }
        />
        <TouchableOpacity
          style={styles.go}
          onPress={mode === "REGION" ? searchRegion : searchCrop}
        >
          <Text style={{ color: "#fff" }}>GO</Text>
        </TouchableOpacity>
      </View>

      {/* TOGGLE */}
      <View style={styles.toggle}>
        {["REGION", "CROP"].map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.toggleBtn, mode === m && styles.active]}
            onPress={() => {
              setMode(m);
              setSearch("");
              setCropMarkers([]);
            }}
          >
            <Text>
              {m === "REGION"
                ? "📍 Region → Crop"
                : "🌱 Crop → Region"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* MAP */}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 20.5937,
          longitude: 78.9629,
          latitudeDelta: 15,
          longitudeDelta: 15,
        }}
        onPress={e =>
          selectLocation(
            e.nativeEvent.coordinate.latitude,
            e.nativeEvent.coordinate.longitude
          )
        }
      >
        {marker && <Marker coordinate={marker} />}

        {cropMarkers.map((p, i) => (
          <Marker
            key={i}
            coordinate={p}
            pinColor="green"
            onPress={() =>
              selectLocation(p.latitude, p.longitude)
            }
          />
        ))}

        {reservoir && (
          <Marker
            coordinate={{
              latitude: reservoir.lat,
              longitude: reservoir.lon,
            }}
            pinColor="blue"
            title={reservoir.name}
            description={`River: ${reservoir.river || "N/A"}`}
          />
        )}
      </MapView>

      {/* INFO CARD */}
      {soil && selectedPoint && (
        <ScrollView style={styles.card}>
          <Text style={styles.h}>📍 {regionName}</Text>
          <Text>🧱 Soil: {soil}</Text>
          <Text>💧 Reservoir: {reservoir?.name}</Text>
          {reservoir?.river && <Text>🌊 River: {reservoir.river}</Text>}

          <Text style={styles.sub}>🌱 Crops</Text>
          {soilRules[soil].crops.map(c => (
            <Text
              key={c}
              style={[
                styles.crop,
                selectedCrop === c && styles.sel,
              ]}
              onPress={() => setSelectedCrop(c)}
            >
              {c}
            </Text>
          ))}

          <TextInput
            style={styles.input}
            placeholder="Area (acres)"
            keyboardType="numeric"
            value={area}
            onChangeText={setArea}
          />

          {selectedCrop && area !== "" && (
            <>
              <Text>🌾 Yield: {yieldVal} quintals</Text>
              <Text>💰 Revenue: ₹{revenue}</Text>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  searchRow: { flexDirection: "row", padding: 8 },
  input: { flex: 1, backgroundColor: "#fff", padding: 8, borderRadius: 6 },
  go: { backgroundColor: "#2e7d32", padding: 12, marginLeft: 6, borderRadius: 6 },
  toggle: { flexDirection: "row", justifyContent: "space-around", padding: 6 },
  toggleBtn: { padding: 6, backgroundColor: "#ddd", borderRadius: 10 },
  active: { backgroundColor: "#a5d6a7" },
  card: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    padding: 14,
  },
  h: { fontSize: 16, fontWeight: "bold" },
  sub: { marginTop: 8, fontWeight: "bold" },
  crop: { padding: 6, marginTop: 4, backgroundColor: "#e0f2f1" },
  sel: { backgroundColor: "#c8e6c9", fontWeight: "bold" },
});

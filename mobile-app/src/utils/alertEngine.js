export function generateAlerts({
  crop,
  sensor,
  analysis
}) {
  let alerts = [];

  /* 🧬 Disease-based alert */
  if (analysis && analysis.is_healthy === false) {
    alerts.push({
      type: "disease",
      title: "🦠 Disease Detected",
      message: `${analysis.disease} detected in ${crop}. Immediate action required.`,
    });
  }

  /* 🌡 Environmental stress */
  if (sensor) {
    if (sensor.temperature > 20) {
      alerts.push({
        type: "temp",
        title: "🌡 High Temperature",
        message: `Temperature (${sensor.temperature}°C) may stress ${crop}.`,
      });
    }

    if (sensor.soil_moisture < 40) {
      alerts.push({
        type: "water",
        title: "💧 Low Soil Moisture",
        message: "Irrigation is required to prevent yield loss.",
      });
    }

    if (sensor.humidity > 85 && analysis?.is_healthy === false) {
      alerts.push({
        type: "risk",
        title: "⚠ High Disease Risk",
        message: "High humidity can worsen disease spread.",
      });
    }
  }

  return alerts;
}

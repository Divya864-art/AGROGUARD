import json

with open("recommendations_config.json") as f:
    CONFIG = json.load(f)

def get_recommendation(crop, class_id, sensors):
    crop_cfg = CONFIG["crops"].get(crop)
    if not crop_cfg:
        return None

    class_cfg = crop_cfg["class_map"].get(str(class_id))
    if not class_cfg:
        return None

    # Healthy case
    if class_cfg.get("default"):
        return {
            "disease": class_cfg["disease"],
            "healthy": True,
            "recommendations": None
        }

    # Optional: validate sensor conditions
    conditions = class_cfg.get("conditions", {})
    for key, rule in conditions.items():
        value = sensors.get(key)
        if value is None:
            continue
        if "min" in rule and value < rule["min"]:
            return None
        if "max" in rule and value > rule["max"]:
            return None

    return {
        "disease": class_cfg["disease"],
        "healthy": False,
        "recommendations": class_cfg["recommendations"]
    }

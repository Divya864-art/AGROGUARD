import threading
import time
from fastapi import FastAPI
from supabase import create_client
import os, requests, json
from dotenv import load_dotenv
from PIL import Image
from io import BytesIO
import torch
import torchvision.transforms as transforms
from transformers import (
    pipeline,
    AutoProcessor,
    AutoModelForZeroShotImageClassification,
    AutoModelForImageClassification
)

# ================= INIT =================
load_dotenv()
app = FastAPI(title="Smart Crop Intelligence Backend")

# ================= SUPABASE =================
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

LAST_PROCESSED_FILE = None

# ================= LOAD RECOMMENDATIONS =================
with open("recommendations_config.json", "r") as f:
    RECOMMENDATION_CONFIG = json.load(f)

# ================= NORMALIZATION MAP =================
DISEASE_ALIAS = {
    "rice hispa": "Rice Hispa",
    "brown spot": "Brown Spot",
    "bacterial leaf blight": "Bacterial Leaf Blight",
    "leaf blast": "Leaf Blast",
    "sheath blight": "Sheath Blight",
    "healthy rice leaf": "Healthy Rice",

    "early blight": "Early Blight",
    "late blight": "Late Blight",
    "leaf mold": "Leaf Mold",
    "bacterial spot": "Bacterial Spot",
    "healthy tomato": "Healthy Tomato",

    "red rot": "Red Rot",
    "rust disease": "Rust Disease",
    "yellow leaf disease": "Yellow Leaf Disease",
    "pineapple disease": "Pineapple Disease",
    "grassy shoot disease": "Grassy Shoot Disease",
    "healthy sugarcane": "Healthy Sugarcane",

    "potato early blight": "Potato Early Blight",
    "potato late blight": "Potato Late Blight",
    "healthy potato leaf": "Healthy Potato Leaf"
}

def get_recommendation(crop, disease_name):
    crop_cfg = RECOMMENDATION_CONFIG["crops"].get(crop)
    if not crop_cfg:
        return None

    normalized = DISEASE_ALIAS.get(disease_name.lower(), disease_name)

    for rec in crop_cfg["class_map"].values():
        if rec["disease"].lower() == normalized.lower():
            return rec
    return None

# ================= MODELS =================
rice_pipe = pipeline(
    "image-classification",
    model="cvmil/dinov2-base_rice-leaf-disease-augmented_fft"
)

tomato_pipe = pipeline(
    "image-classification",
    model="surprisedPikachu007/tomato-disease-detection"
)

potato_processor = AutoProcessor.from_pretrained(
    "sindukurimeghana/potato-leaf-disease-clip"
)
potato_model = AutoModelForZeroShotImageClassification.from_pretrained(
    "sindukurimeghana/potato-leaf-disease-clip"
)
potato_labels = [
    "Healthy potato leaf",
    "Potato early blight",
    "Potato late blight"
]

sugarcane_model = AutoModelForImageClassification.from_pretrained(
    "rmezapi/sugarcane-diagnosis-swin-tiny",
    trust_remote_code=True
)
sugarcane_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225])
])

SUGARCANE_LABEL_MAP = {
    0: "Healthy",
    1: "Red Rot",
    2: "Rust Disease",
    3: "Yellow Leaf Disease",
    4: "Pineapple Disease",
    5: "Grassy Shoot Disease"
}

# ================= WATCHER =================
def run_watcher():
    global LAST_PROCESSED_FILE
    print("👀 Image watcher started...")

    while True:
        try:
            files = supabase.storage.from_("plant-images").list("")
            if not files:
                time.sleep(5)
                continue

            latest = sorted(files, key=lambda x: x["created_at"], reverse=True)[0]
            file_name = latest["name"]

            if file_name == LAST_PROCESSED_FILE:
                time.sleep(5)
                continue

            image_url = supabase.storage.from_("plant-images").get_public_url(file_name)
            print("🆕 New image:", file_name)

            user = supabase.table("Profiles") \
                .select("selected_crop") \
                .order("created_at", desc=True) \
                .limit(1) \
                .single() \
                .execute()

            crop = user.data["selected_crop"]

            image = Image.open(BytesIO(requests.get(image_url).content)).convert("RGB")

            if crop == "rice":
                r = rice_pipe(image)[0]
                disease = r["label"]
                confidence = float(r["score"])

            elif crop == "tomato":
                r = tomato_pipe(image)[0]
                disease = r["label"]
                confidence = float(r["score"])

            elif crop == "potato":
                inputs = potato_processor(
                    images=image,
                    text=potato_labels,
                    return_tensors="pt",
                    padding=True,
                    truncation=True
                )
                with torch.no_grad():
                    probs = torch.softmax(
                        potato_model(**inputs).logits_per_image[0], 0
                    )
                disease = potato_labels[int(torch.argmax(probs))]
                confidence = float(probs.max())

            elif crop == "sugarcane":
                tensor = sugarcane_transform(image).unsqueeze(0)
                with torch.no_grad():
                    probs = torch.softmax(
                        sugarcane_model(tensor).logits[0], 0
                    )
                idx = int(torch.argmax(probs))
                disease = SUGARCANE_LABEL_MAP[idx]
                confidence = float(probs[idx])

            rec = get_recommendation(crop, disease)

            supabase.table("analysis_results").insert({
                "image_url": image_url,
                "crop": crop,
                "disease": disease,
                "is_healthy": "healthy" in disease.lower(),
                "confidence": confidence,
                "recommendations": rec.get("recommendations") if rec else None
            }).execute()

            print("✅ Saved:", disease)
            LAST_PROCESSED_FILE = file_name

        except Exception as e:
            print("❌ Watcher error:", e)

        time.sleep(5)

@app.on_event("startup")
def start():
    threading.Thread(target=run_watcher, daemon=True).start()

@app.get("/")
def health():
    return {"status": "running"}

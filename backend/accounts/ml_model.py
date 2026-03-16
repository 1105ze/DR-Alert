import os
import tensorflow as tf
from django.conf import settings

MODEL_PATH = os.path.join(
    settings.BASE_DIR,
    "model",
    "multimodal_best_model(32_60_3.0).keras"
)

CLASS_NAMES = [
    "No DR",
    "Mild",
    "Moderate",
    "Severe",
    "Proliferative"
]

DEPLOY_IMG_SIZE = 512

model = tf.keras.models.load_model(
    MODEL_PATH,
    compile=False,
    safe_mode=False
)

print("Model loaded successfully")
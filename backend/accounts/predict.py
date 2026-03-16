import cv2
import numpy as np
import pandas as pd
import tensorflow as tf
import os
import joblib
from .ml_model import model, DEPLOY_IMG_SIZE, CLASS_NAMES
from tensorflow.keras.applications.efficientnet import preprocess_input

# --- 1. Load Scalers ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, 'model')

age_scaler = joblib.load(os.path.join(MODEL_DIR, 'age_scaler.pkl'))
sex_encoder = joblib.load(os.path.join(MODEL_DIR, 'sex_encoder.pkl'))

def safe_crop_retina(img):
    """
    Identifies the retina and centers it in a square canvas.
    This prevents the circular eye from being stretched into an oval.
    """
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    mask = gray > 8
    
    if not mask.any():
        return img
        
    coords = np.argwhere(mask)
    y0, x0 = coords.min(axis=0)
    y1, x1 = coords.max(axis=0)
    
    # Get the raw cropped region
    cropped_img = img[y0:y1, x0:x1]
    
    # Calculate the size needed for a square canvas
    h, w = cropped_img.shape[:2]
    side = max(h, w)
    
    # Create square canvas and center the eye
    square_img = np.zeros((side, side, 3), dtype=np.uint8)
    offset_y = (side - h) // 2
    offset_x = (side - w) // 2
    
    square_img[offset_y:offset_y+h, offset_x:offset_x+w] = cropped_img
    return square_img

def apply_clahe(img, clip=2, grid=(16, 16)):
    """Enhances clinical features like microaneurysms and exudates"""
    lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=clip, tileGridSize=grid)
    cl = clahe.apply(l)
    limg = cv2.merge((cl, a, b))
    return cv2.cvtColor(limg, cv2.COLOR_LAB2RGB)

def preprocess_image(image_bytes):
    # Decode bytes from app upload
    img = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(img, cv2.IMREAD_COLOR)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # --- NEW: Crop and Square before resizing ---
    img_square = safe_crop_retina(img_rgb)
    
    # Resize the square image to 512x512
    img_resized = cv2.resize(img_square, (DEPLOY_IMG_SIZE, DEPLOY_IMG_SIZE))

    # Apply enhancement
    img_enhanced = apply_clahe(img_resized)

    # Model prep
    img_array = np.expand_dims(img_enhanced, axis=0)
    img_array = preprocess_input(img_array.astype('float32'))

    return img_enhanced, img_array

def prepare_clinical(age, sex):
    """Standardizes age and sex using pre-trained scalers"""
    sex_map = {"M": "Male", "F": "Female"}
    sex_full = sex_map.get(sex, sex)

    input_df = pd.DataFrame(
        [[float(age), sex_full]], 
        columns=['Patient Age', 'Patient Sex']
    )

    age_s = age_scaler.transform(input_df[['Patient Age']])[0][0]
    sex_feats = sex_encoder.transform(input_df[['Patient Sex']])
    s_f = sex_feats[0][0]
    s_m = sex_feats[0][1]

    return np.array([[age_s, s_f, s_m]], dtype="float32")

def get_diagnostic_gradcam(img_array, clinical_data, last_conv_layer_name="top_conv"):
    grad_model = tf.keras.models.Model(
        inputs=model.inputs,
        outputs=[model.get_layer(last_conv_layer_name).output, model.output]
    )

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model([img_array, clinical_data])
        if isinstance(predictions, list):
            predictions = predictions[0]
        
        pred_index = tf.argmax(predictions[0])
        loss = predictions[:, pred_index]

    grads = tape.gradient(loss, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs = conv_outputs[0]
    heatmap = tf.reduce_sum(conv_outputs * pooled_grads, axis=-1)
    
    heatmap = heatmap.numpy() if hasattr(heatmap, "numpy") else heatmap

    heatmap = np.maximum(heatmap, 0)
    if np.max(heatmap) != 0:
        heatmap /= np.max(heatmap)
        
    final_pred = pred_index.numpy() if hasattr(pred_index, "numpy") else pred_index
    conf_value = predictions[0][pred_index]
    final_conf = conf_value.numpy() if hasattr(conf_value, "numpy") else conf_value

    return heatmap, int(final_pred), float(final_conf)

def overlay_heatmap(original_img, heatmap, alpha=0.4):
    heatmap_rescaled = cv2.resize(heatmap, (original_img.shape[1], original_img.shape[0]))
    
    heatmap_rescaled[heatmap_rescaled < 0.2] = 0
    
    heatmap_255 = np.uint8(255 * heatmap_rescaled)
    heatmap_color = cv2.applyColorMap(heatmap_255, cv2.COLORMAP_JET)
    heatmap_color = cv2.cvtColor(heatmap_color, cv2.COLOR_BGR2RGB)

    # Blends the heatmap smoothly over the eye
    result = cv2.addWeighted(original_img, 1.0, heatmap_color, alpha, 0)
    return result

def run_prediction(image_bytes, age, sex):
    # Process inputs
    img_input, img_array = preprocess_image(image_bytes)
    clinical_array = prepare_clinical(age, sex)

    # Run AI
    heatmap, pred_index, confidence = get_diagnostic_gradcam(
        img_array,
        clinical_array
    )

    # Create visualization
    result_img = overlay_heatmap(img_input, heatmap)

    return {
        "predicted_stage": CLASS_NAMES[pred_index],
        "confidence": confidence,
        "heatmap_image": result_img
    }
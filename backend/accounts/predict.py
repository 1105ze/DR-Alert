import cv2
import numpy as np
import tensorflow as tf
from .ml_model import model, DEPLOY_IMG_SIZE, CLASS_NAMES
from tensorflow.keras.applications.efficientnet import preprocess_input



def apply_clahe(img, clip=1.2, grid=(16, 16)):
    """Matches the preprocessing used during training"""
    lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB) # Use RGB to LAB
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=clip, tileGridSize=grid)
    cl = clahe.apply(l)
    limg = cv2.merge((cl, a, b))
    return cv2.cvtColor(limg, cv2.COLOR_LAB2RGB)

def preprocess_image(image_bytes):
    # 1. Decode bytes
    img = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(img, cv2.IMREAD_COLOR)
    
    # 2. Basic cleaning
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_resized = cv2.resize(img_rgb, (DEPLOY_IMG_SIZE, DEPLOY_IMG_SIZE))

    # 3. ADDED: CLAHE Processing (Apply before normalization)
    img_enhanced = apply_clahe(img_resized)

    # 4. Final Model Prep
    img_array = np.expand_dims(img_enhanced, axis=0)
    img_array = preprocess_input(img_array.astype('float32'))

    return img_enhanced, img_array


def prepare_clinical(age, sex):

    age_s = age / 100.0

    if sex == "F":
        s_f, s_m = 1.0, 0.0
    else:
        s_f, s_m = 0.0, 1.0

    return np.array([[age_s, s_f, s_m]], dtype="float32")


def get_diagnostic_gradcam(img_array, clinical_data):

    last_conv = model.get_layer("top_conv")

    grad_model = tf.keras.models.Model(
        inputs=model.inputs,
        outputs=[last_conv.output, model.output]
    )

    with tf.GradientTape() as tape:

        conv_outputs, predictions = grad_model(
            [img_array, clinical_data]
        )

        if isinstance(predictions, list):
            predictions = predictions[0]

        pred_index = tf.argmax(predictions[0])
        confidence = predictions[0][pred_index]

        loss = predictions[:, pred_index]


    grads = tape.gradient(loss, conv_outputs)

    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs = conv_outputs[0]

    heatmap = tf.reduce_sum(conv_outputs * pooled_grads, axis=-1)
    heatmap = tf.squeeze(heatmap).numpy()

    heatmap = np.maximum(heatmap, 0)

    vmax = np.percentile(heatmap, 99)
    if vmax > 0:
        heatmap /= vmax

    heatmap = np.power(heatmap, 2.0)
    heatmap = np.clip(heatmap, 0, 1)

    return heatmap, int(pred_index.numpy()), float(confidence.numpy())


def overlay_heatmap(img, heatmap, alpha=0.6):

    heatmap_resized = cv2.resize(
        heatmap,
        (img.shape[1], img.shape[0])
    )

    heatmap_resized[heatmap_resized < 0.2] = 0

    heatmap_255 = np.uint8(255 * heatmap_resized)

    heatmap_color = cv2.applyColorMap(
        heatmap_255,
        cv2.COLORMAP_JET
    )

    heatmap_color = cv2.cvtColor(
        heatmap_color,
        cv2.COLOR_BGR2RGB
    )

    mask = (heatmap_resized > 0).astype(float)
    mask = np.stack([mask] * 3, axis=-1)

    result = (
        img.astype(float) * (1 - mask * alpha)
        + heatmap_color.astype(float) * (mask * alpha)
    )

    return np.uint8(np.clip(result, 0, 255))


def run_prediction(image_bytes, age, sex):

    img_input, img_array = preprocess_image(image_bytes)

    clinical_array = prepare_clinical(age, sex)

    heatmap, pred_index, confidence = get_diagnostic_gradcam(
        img_array,
        clinical_array
    )

    result_img = overlay_heatmap(img_input, heatmap)

    return {
        "predicted_stage": CLASS_NAMES[pred_index],
        "confidence": confidence,
        "heatmap_image": result_img
    }
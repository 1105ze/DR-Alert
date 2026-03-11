import cv2
import numpy as np

def verify_retina(image_bytes):

    img = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(img, cv2.IMREAD_COLOR)

    if img is None:
        return False, "Error: Could not read image file."

    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    lower_red = np.array([0,40,40])
    upper_red = np.array([30,255,255])

    mask = cv2.inRange(hsv, lower_red, upper_red)

    red_ratio = np.sum(mask > 0) / (img.shape[0] * img.shape[1])

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # check black background
    background_mask = gray < 20
    background_ratio = np.sum(background_mask) / (img.shape[0] * img.shape[1])

    _, thresh = cv2.threshold(gray, 15, 255, cv2.THRESH_BINARY)

    contours, _ = cv2.findContours(
        thresh,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    circularity = 0

    if contours:
        cnt = max(contours, key=cv2.contourArea)
        area = cv2.contourArea(cnt)
        perimeter = cv2.arcLength(cnt, True)

        if perimeter > 0:
            circularity = (4*np.pi*area)/(perimeter**2)

    is_retina = (
        red_ratio > 0.35
        and circularity > 0.65
        and background_ratio > 0.2
    )

    return is_retina, {
        "red_ratio": float(red_ratio),
        "circularity": float(circularity),
        "background_ratio": float(background_ratio)
    }
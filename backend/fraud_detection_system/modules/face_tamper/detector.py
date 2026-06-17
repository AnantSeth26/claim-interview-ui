import os
import cv2
import torch
import numpy as np
import segmentation_models_pytorch as smp

from torchvision import transforms

from fraud_detection_system.core.outputs import save_output
from fraud_detection_system.config import get_verdict


# =====================================================
# MODEL
# =====================================================

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

MODEL_PATH = os.path.join(
    os.path.dirname(
        os.path.dirname(
            os.path.dirname(__file__)
        )
    ),
    "models",
    "face_edit_model",
    "deeplab_face_edit.pth"
)

model = smp.DeepLabV3Plus(
    encoder_name="efficientnet-b3",
    encoder_weights=None,
    in_channels=3,
    classes=1
)

model.load_state_dict(
    torch.load(
        MODEL_PATH,
        map_location=DEVICE
    )
)

model.to(DEVICE)
model.eval()


transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((384, 384)),
    transforms.ToTensor()
])


# =====================================================
# MAIN
# =====================================================

def run_face_tamper_detection(image_path):

    image = cv2.imread(image_path)

    if image is None:

        return {
            "module": "face_tamper",
            "score": 0,
            "verdict": "Analysis Failed",
            "faces_detected": 0,
            "regions": [],
            "images": {}
        }

    filename = os.path.basename(image_path)

    image_rgb = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB
    )

    original = image_rgb.copy()

    x = transform(image_rgb)

    x = x.unsqueeze(0).to(DEVICE)

    with torch.no_grad():

        pred = model(x)

        pred = torch.sigmoid(pred)

    pred_mask = (
        pred.squeeze()
        .cpu()
        .numpy()
    )

    binary_mask = (
        pred_mask > 0.30
    ).astype(np.uint8)

    binary_mask = cv2.resize(
        binary_mask,
        (
            original.shape[1],
            original.shape[0]
        ),
        interpolation=cv2.INTER_NEAREST
    )

    overlay = original.copy()

    overlay[
        binary_mask == 1
    ] = [255, 0, 0]



    # ==========================================
    # SCORE
    # ==========================================

    max_confidence = float(pred_mask.max())
    mean_confidence = float(pred_mask.mean())

    print("Max Prediction :", max_confidence)
    print("Mean Prediction:", mean_confidence)

    score = int(max_confidence * 100)

    score = min(score, 100)
    score = max(score, 0)

    # ==========================================
    # SAVE
    # ==========================================

    overlay_bgr = cv2.cvtColor(
        overlay,
        cv2.COLOR_RGB2BGR
    )

    output_path = save_output(
        overlay_bgr,
        "overlay",
        f"face_tamper_{filename}"
    )

    return {
        "module": "face_tamper",
        "score": score,
        "verdict": get_verdict(score),
        "faces_detected": 1,
        "regions": [],
        "images": {
            "visualization": output_path
        }
    }
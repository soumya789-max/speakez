from typing import Any, Dict, Optional


def analyze_vision(summary: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Compute presence/vision score from aggregated client MediaPipe samples.
    Returns available=False when camera was off or too few frames were captured.
    """
    if not summary or int(summary.get("sample_count") or 0) < 3:
        return {
            "score": 0.7,
            "available": False,
            "reason": "insufficient_camera_data",
            "eye_contact": None,
            "posture_score": None,
            "stability": None,
            "face_present_ratio": None,
            "sample_count": int(summary.get("sample_count") or 0) if summary else 0,
        }

    eye = float(summary.get("avg_eye_contact") or 0)
    posture_ratio = float(summary.get("posture_good_ratio") or 0)
    movement = float(summary.get("avg_movement") or 0)
    face_ratio = float(summary.get("face_present_ratio") or 0)
    stability = max(0.0, min(1.0, 1.0 - movement))

    score = (
        0.40 * eye
        + 0.35 * posture_ratio
        + 0.15 * stability
        + 0.10 * face_ratio
    )
    score = round(max(0.0, min(1.0, score)), 3)

    highlights = []
    if eye < 0.45:
        highlights.append(
            {
                "type": "eye_contact",
                "severity": "warn",
                "message": "Eye contact with the camera was inconsistent during the session.",
            }
        )
    if posture_ratio < 0.5:
        highlights.append(
            {
                "type": "posture",
                "severity": "info",
                "message": "Posture could be more upright and squared to the camera.",
            }
        )
    if movement > 0.55:
        highlights.append(
            {
                "type": "movement",
                "severity": "info",
                "message": "Head movement was elevated; try to stay steadier on camera.",
            }
        )

    return {
        "score": score,
        "available": True,
        "eye_contact": round(eye, 3),
        "posture_score": round(posture_ratio, 3),
        "stability": round(stability, 3),
        "face_present_ratio": round(face_ratio, 3),
        "sample_count": int(summary.get("sample_count") or 0),
        "highlights": highlights,
    }

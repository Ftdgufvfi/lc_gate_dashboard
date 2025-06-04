import math

def compute_direction_and_speed(prev_pos, curr_pos, threshold=1.0):
    px, py = prev_pos
    cx, cy = curr_pos
    dx = cx - px
    dy = cy - py
    distance = math.hypot(dx, dy)

    if distance <= threshold:
        return "static", 0.0, True

    angle = math.degrees(math.atan2(-dy, dx))  # y-axis inverted
    if -22.5 < angle <= 22.5:
        direction = "→"
    elif 22.5 < angle <= 67.5:
        direction = "↘"
    elif 67.5 < angle <= 112.5:
        direction = "↓"
    elif 112.5 < angle <= 157.5:
        direction = "↙"
    elif angle > 157.5 or angle <= -157.5:
        direction = "←"
    elif -157.5 < angle <= -112.5:
        direction = "↖"
    elif -112.5 < angle <= -67.5:
        direction = "↑"
    elif -67.5 < angle <= -22.5:
        direction = "↗"
    else:
        direction = "static"

    return direction, distance, False

def annotate_detections(detections_for_deepsort, tracks, prev_positions, motion_threshold=1.0):
    final_detections = []
    track_map = {track.track_id: track for track in tracks if track.is_confirmed()}

    for det in detections_for_deepsort:
        bbox_xywh, conf, cls = det
        matched_track = None
        x, y, w, h = bbox_xywh
        det_center = (x + w // 2, y + h // 2)

        # Try to find a matching track by bbox IoU (optional, for more robust matching)
        for track_id, track in track_map.items():
            tx1, ty1, tx2, ty2 = track.to_ltrb()
            tcx = (tx1 + tx2) // 2
            tcy = (ty1 + ty2) // 2
            if abs(tcx - det_center[0]) < w // 2 and abs(tcy - det_center[1]) < h // 2:
                matched_track = track
                del track_map[track_id]  # prevent duplicate use
                break

        if matched_track:
            track_id = matched_track.track_id
            cx, cy = det_center

            if track_id in prev_positions:
                direction, speed, is_static = compute_direction_and_speed(prev_positions[track_id], (cx, cy), motion_threshold)
            else:
                direction, speed, is_static = "static", 0.0, True

            prev_positions[track_id] = (cx, cy)
        else:
            direction, speed, is_static = "static", 0.0, True
            track_id = -1  # For unmatched cases

        final_detections.append({
            "bbox": [x, y, w, h],
            "class": cls,
            "confidence": conf,
            "is_static": is_static,
            "direction": direction,
            "speed": speed,
            "track_id": track_id,
        })

    return final_detections, prev_positions

def track_and_annotate(tracker, detections_for_deepsort, frame, prev_positions, motion_threshold=1.0):
    if detections_for_deepsort:
        tracks = tracker.update_tracks(detections_for_deepsort, frame=frame)
    else:
        tracks = []

    final_detections, prev_positions = annotate_detections(
        detections_for_deepsort, tracks, prev_positions, motion_threshold
    )

    return final_detections, prev_positions

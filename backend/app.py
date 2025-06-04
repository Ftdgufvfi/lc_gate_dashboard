import cv2
import torch
from flask import Flask
from flask_socketio import SocketIO
from ultralytics import YOLO
import base64
import numpy as np
import math

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# main.py

import cv2
import noise_reduction
import contrast_adjustments
import sharpening
import static_background_sub as bg_sub
import yolo_utilities as yolo_utils
import numpy as np
import zero_dce_utils
from deep_sort_realtime.deepsort_tracker import DeepSort
import deepsort_utils

    
def generate_frames():

    # Open the video file or webcam
    #video_path = r"C:\Users\shiva\Downloads\Unknown Camera1_20250312120150.avi"  # Replace with your video file path or '0' for webcam
    #video_path = r"C:\Users\shiva\Downloads\WhatsApp Video 2025-05-30 at 18.19.41.mp4"
    video_path = 0
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        print("Error: Could not open video!")
        exit()

    # initialize Object tracker
    tracker = DeepSort(max_age=5)
    prev_positions = {}
    count = 1
    while True:
        ret, frame = cap.read()
        frame = cv2.resize(frame, (640, 480))
        #frame_enhanced = swanet_utils.swanet(frame)
        frame_enhanced = zero_dce_utils.enhance_image(frame)
        frame_grey = cv2.cvtColor(frame_enhanced, cv2.COLOR_BGR2GRAY)  

        if not ret:
            print("Error: Failed to read frame or video ended!")
            break

        # Background mask and detections
        mask = bg_sub.bgsub_guassian(frame_grey)

        count += 1
        if count % 5 != 0:
            continue
        else:
            count = 1

        detections = bg_sub.get_contour_detections(mask)
        cv2.imshow('Motion Mask', mask)

        # Run YOLO on full frame
        yolo_bboxes_full, yolo_classes_full, yolo_scores_full = yolo_utils.get_yolo_detections(frame_enhanced, conf_thresh=0.15)

        # fusion
        bg_boxes_coords = np.array([det[:4] for det in detections], dtype=np.float32)
        all_bboxes, all_classes, all_scores = yolo_utils.select_yolo_with_bg_iou(yolo_bboxes_full, yolo_classes_full, yolo_scores_full, bg_boxes_coords, conf_thresh=0.38, iou_thresh=0.7)  #frame, forced_threshold=0.3

        #all_bboxes, all_scores = yolo_bboxes_full, yolo_scores_full
        # Final NMS
        final_detections = []
        if len(all_bboxes) != 0:
            final_bboxes, final_classes, final_scores = yolo_utils.non_max_suppression(all_bboxes, all_classes, all_scores, threshold=0.1)

            detections_for_deepsort = [
                ([int(x1), int(y1), int(x2 - x1), int(y2 - y1)], float(score), int(cls))
                for (x1, y1, x2, y2), cls, score in zip(final_bboxes, final_classes, final_scores)
            ]
        else:
            detections_for_deepsort = []

        final_detections, prev_positions = deepsort_utils.track_and_annotate(tracker, detections_for_deepsort, frame, prev_positions, motion_threshold=1.0)


        # Convert processed frame to Base64
        _, buffer = cv2.imencode(".jpg", frame)
        frame_encoded = base64.b64encode(buffer).decode("utf-8")

        # Send frame + zone-wise predictions to frontend
        socketio.emit("frame", {"image": frame_encoded, "detections": final_detections})

        # Break loop on pressing 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break


@app.route("/")
def index():
    return "YOLO Live detections"

@socketio.on("connect")
def handle_connect():
    print("Client connected!")

if __name__ == "__main__":
    socketio.start_background_task(target=generate_frames)
    socketio.run(app, host="0.0.0.0", port=5000, allow_unsafe_werkzeug=True)

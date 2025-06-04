#from deep_sort_realtime.deepsort_tracker import DeepSort

# tracker = DeepSort(max_age=30)
# if detections_for_deepsort:
#     tracks = tracker.update_tracks(detections_for_deepsort, frame=frame_enhanced)
# else:
#     tracks = []


# for track in tracks:
#     if not track.is_confirmed():
#         continue

#     track_id = track.track_id
#     x1, y1, x2, y2 = map(int, track.to_ltrb())
#     cx = int((x1 + x2) / 2)
#     cy = int((y1 + y2) / 2)

#     direction = "static"
#     speed = 0
#     is_static = True

#     if track_id in prev_positions:
#         px, py = prev_positions[track_id]
#         dx = cx - px
#         dy = cy - py
#         distance = math.hypot(dx, dy)

#         if distance > 3:  # Motion threshold
#             is_static = False
#             angle = math.degrees(math.atan2(-dy, dx))  # y inverted
#             if -22.5 < angle <= 22.5:
#                 direction = "→"
#             elif 22.5 < angle <= 67.5:
#                 direction = "↘"
#             elif 67.5 < angle <= 112.5:
#                 direction = "↓"
#             elif 112.5 < angle <= 157.5:
#                 direction = "↙"
#             elif angle > 157.5 or angle <= -157.5:
#                 direction = "←"
#             elif -157.5 < angle <= -112.5:
#                 direction = "↖"
#             elif -112.5 < angle <= -67.5:
#                 direction = "↑"
#             elif -67.5 < angle <= -22.5:
#                 direction = "↗"
#             speed = distance

#     prev_positions[track_id] = (cx, cy)

#     # Get the class and confidence from the detection matching this track_id
#     # DeepSort doesn't directly provide class/confidence for each track, so let's approximate:
#     # We'll assume detection order corresponds (or store detections with IDs separately)
#     # For simplicity here, set defaults:
#     cls = 0  # Person class assumed
#     conf = 1.0  # Confidence default (you can improve this with additional bookkeeping)
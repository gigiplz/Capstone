import cv2
import numpy as np
import os
import csv
from tqdm import tqdm
import shutil

# COCO 모델 기준 BODY_PARTS와 POSE_PAIRS
BODY_PARTS_COCO = {
    0: "Nose", 1: "Neck", 2: "RShoulder", 3: "RElbow", 4: "RWrist",
    5: "LShoulder", 6: "LElbow", 7: "LWrist", 8: "RHip", 9: "RKnee",
    10: "RAnkle", 11: "LHip", 12: "LKnee", 13: "LAnkle", 14: "REye",
    15: "LEye", 16: "REar", 17: "LEar"
}

POSE_PAIRS_COCO = [
    [1, 2], [1, 5], [2, 3], [3, 4], [5, 6], [6, 7],
    [1, 8], [8, 9], [9, 10], [1, 11], [11, 12], [12, 13],
    [1, 0], [0, 14], [14, 16], [0, 15], [15, 17]
]

# 모델 경로
protoFile = "./coco/pose_deploy_linevec.prototxt"
weightsFile = "./coco/pose_iter_440000.caffemodel"


# 비디오 경로
video = "./test_video/kpop/kpop_test001.mp4"
capture = cv2.VideoCapture(video)
total_frame = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))


# === JSON 저장(프레임별) 설정 ===
import json

# 프레임별 JSON을 저장할 상위 폴더 (영상 이름 하위 폴더에 개별 json 저장)
json_root = "./coco/json_keypoints/kpop"
video_name = os.path.splitext(os.path.basename(video))[0]  # 원본 영상 파일명(확장자 제외)
json_out_dir = os.path.join(json_root, video_name)
os.makedirs(json_out_dir, exist_ok=True)

# 네트워크 불러오기 (동일)
net_openpose = cv2.dnn.readNetFromCaffe(protoFile, weightsFile)
# net_openpose.setPreferableBackend(cv2.dnn.DNN_BACKEND_CUDA)
# net_openpose.setPreferableTarget(cv2.dnn.DNN_TARGET_CUDA)

points = []
confs = []

def save_openpose_json(save_dir, video_stem, frame_idx, points, confs, K=None):
    """
    OpenPose 호환 JSON으로 프레임별 저장.
    points: 길이 K의 [(x,y) or None]
    confs : 길이 K의 [float]
    저장 순서는 x,y,c 반복.
    """
    if K is None:
        K = len(points)
    flat = []
    for i in range(K):
        if points[i] is None:
            flat += [0.0, 0.0, 0.0]
        else:
            x, y = points[i]
            c = float(confs[i])
            flat += [float(x), float(y), c]

    data = {
        "version": 1.2,
        "people": [
            {
                "person_id": [-1],
                "pose_keypoints_2d": flat
            }
        ]
    }
    # OpenPose 관례적인 파일명: <video>_<frame:012d>_keypoints.json
    fname = f"{video_stem}_{frame_idx:012d}_keypoints.json"
    with open(os.path.join(save_dir, fname), "w", encoding="utf-8") as f:
        json.dump(data, f)

def output_keypoints(threshold, BODY_PARTS):
    """
    - points, confs를 채움
    - (x,y,c) 순서로 나중에 JSON에 저장
    - 화면 표시를 위해 원래 하던 circle/label은 유지
    """
    global points, confs
    net = net_openpose

    image_height = 368
    image_width  = 368

    input_blob = cv2.dnn.blobFromImage(
        frame, 1.0 / 255, (image_width, image_height),
        (0, 0, 0), swapRB=False, crop=False
    )
    net.setInput(input_blob)
    out = net.forward()

    out_height = out.shape[2]
    out_width  = out.shape[3]
    frame_height, frame_width = frame.shape[:2]

    points = []
    confs  = []

    for i in range(len(BODY_PARTS)):
        prob_map = out[0, i, :, :]
        _, prob, _, point = cv2.minMaxLoc(prob_map)

        x = int((frame_width  * point[0]) / out_width)
        y = int((frame_height * point[1]) / out_height)

        if prob > threshold:
            cv2.circle(frame_openpose, (x, y), 5, (0, 255, 255), thickness=-1)
            cv2.putText(frame_openpose, str(i), (x, y),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 1)
            points.append((x, y))
            confs.append(float(prob))
        else:
            points.append(None)
            confs.append(0.0)

def output_keypoints_with_lines(POSE_PAIRS):
    for partFrom, partTo in POSE_PAIRS:
        if points[partFrom] and points[partTo]:
            cv2.line(frame_openpose, points[partFrom], points[partTo], (0, 255, 0), 2)

# === 프레임 루프 ===
for now_frame in tqdm(range(total_frame)):
    ret, frame = capture.read()
    if not ret:
        break

    frame_openpose = frame.copy()
    frame_zeros = np.zeros((frame.shape[0], frame.shape[1], 3), np.uint8)

    output_keypoints(threshold=0.1, BODY_PARTS=BODY_PARTS_COCO)
    output_keypoints_with_lines(POSE_PAIRS=POSE_PAIRS_COCO)

    # 프레임별 OpenPose JSON 저장 (x,y,c 순서)
    save_openpose_json(json_out_dir, video_name, now_frame, points, confs, K=len(BODY_PARTS_COCO))

    # 이미지 저장
    # cv2.imwrite(f"./coco/output/kpop/{now_frame:04d}.jpg", frame_openpose)

capture.release()
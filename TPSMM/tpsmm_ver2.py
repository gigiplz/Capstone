import torch, os, json, numpy as np, warnings
from glob import glob
from PIL import Image, ImageDraw
from skimage.io import imread
from skimage.transform import resize
from skimage import img_as_ubyte
import imageio
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from IPython.display import HTML
from demo import load_checkpoints, make_animation, find_best_frame as _find
from dotenv import load_dotenv

warnings.filterwarnings("ignore")

# ====== [1. 설정] ======
load_dotenv()  # .env 파일 로드
ROOT_DIR = os.getenv("ROOT_DIR")  # ex: C:/Users/user/Documents/Hanium
GENRE = os.getenv("GENRE")        # ex: wave1, ballet, hiphop 등

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {device}")

use_json = True  # ⚠️ True: JSON 기반 / False: mp4 driving 사용
dataset_name = 'vox'
config_path = 'config/vox-256.yaml'
checkpoint_path = 'checkpoints/vox.pth.tar'
predict_mode = 'avd'
find_best_frame = False
pixel = 256 if dataset_name != 'ted' else 384

pixel_w = 256
pixel_h = 256
fps = 60

# 파일 경로
source_image_path = os.path.join(ROOT_DIR, 'test_img.jpg')
json_dir = os.path.join(ROOT_DIR, 'json_360', GENRE)
output_video_path = os.path.join(ROOT_DIR, 'output_360_new', f'{GENRE}.mp4')
os.makedirs(os.path.dirname(output_video_path), exist_ok=True)

# ====== [2. 소스 이미지 로드] ======
source_image = imread(source_image_path)
source_image = resize(source_image, (pixel_w, pixel_h))[..., :3]

# ====== [3. driving_video 생성 (JSON 기반 or MP4 기반)] ======

def center_and_scale_pose(kps, canvas_w, canvas_h):
    valid = kps[:, 2] > 0.3
    if not np.any(valid):
        return kps
    center_x = np.mean(kps[valid, 0])
    center_y = np.mean(kps[valid, 1])
    
    offset_x = canvas_w / 2 - center_x
    offset_y = canvas_h / 2 - center_y

    kps[:, 0] += offset_x
    kps[:, 1] += offset_y
    return kps


if use_json:
    def json_to_pose_image(json_path, debug=False):
        with open(json_path, 'r') as f:
            data = json.load(f)
        
        if len(data['people']) == 0:
            print(f"No person found in: {json_path}")
            return np.zeros((pixel_w, pixel_h, 3), dtype=np.uint8)
    
        kps = np.array(data['people'][0]['pose_keypoints_2d']).reshape(-1, 3)
        
        # # 좌표 값 확인용 디버깅 출력
        # x_vals = [x for x, y, c in kps]
        # y_vals = [y for x, y, c in kps]
        # print(f"File: {json_path}")
        # print(f"X range: {min(x_vals)} ~ {max(x_vals)}")
        # print(f"Y range: {min(y_vals)} ~ {max(y_vals)}")

        valid = kps[:, 2] > 0.3
        if not np.any(valid):
            return np.zeros((pixel_h, pixel_w, 3), dtype=np.uint8)

        # 3. 키포인트 좌표를 중심 정렬 + 비율 유지 스케일
        x = kps[valid, 0]
        y = kps[valid, 1]

        min_x, max_x = x.min(), x.max()
        min_y, max_y = y.min(), y.max()
        scale_x = pixel_w / (max_x - min_x)
        scale_y = pixel_h / (max_y - min_y)

        # → 작은 축 기준으로 스케일 (비율 유지)
        scale = 0.9 * min(scale_x, scale_y)

        # 키포인트 중심 정렬
        center_x = (max_x + min_x) / 2
        center_y = (max_y + min_y) / 2
        offset_x = pixel_w / 2 - scale * (center_x)
        offset_y = pixel_h / 2 - scale * (center_y)

        # 전체 키포인트 좌표 조정
        kps[:, 0] = kps[:, 0] * scale + offset_x
        kps[:, 1] = kps[:, 1] * scale + offset_y

        # kps = center_and_scale_pose(kps, pixel_w, pixel_h)

        img = Image.new('RGB', (pixel_w, pixel_h), (0, 0, 0))
        draw = ImageDraw.Draw(img)

        for x, y, conf in kps:
            if conf > 0.3:
                r = 5 #3->5
                draw.ellipse((x - r, y - r, x + r, y + r), fill=(255, 255, 255))
        
        # img = img.resize((pixel_w, pixel_h))
        
        return np.array(img).astype(np.uint8)

    json_files = sorted(glob(os.path.join(json_dir, '*', '*.json')))[:300]
    driving_video = [resize(json_to_pose_image(j), (pixel_w, pixel_h))[..., :3] for j in json_files]
    
    print(f"{len(driving_video)} frames loaded. Generating video...")

    # 디버깅용 예시: 일부 pose 이미지 저장
    for i, jpath in enumerate(json_files[:5]):
        pose_img = json_to_pose_image(jpath)
        Image.fromarray(pose_img).save(f"pose_debug_{i}.png")


# else:
#     reader = imageio.get_reader(driving_video_path)
#     fps = reader.get_meta_data()['fps']
#     driving_video = [resize(frame, (pixel, pixel))[..., :3] for frame in reader]
#     reader.close()

# ====== [4. 시각화 함수] ======
def display(source, driving, generated=None):
    fig = plt.figure(figsize=(8 + 4 * (generated is not None), 6))
    ims = []
    for i in range(len(driving)):
        cols = [source, driving[i]]
        if generated is not None:
            cols.append(generated[i])
        im = plt.imshow(np.concatenate(cols, axis=1), animated=True)
        plt.axis('off')
        ims.append([im])
    ani = animation.ArtistAnimation(fig, ims, interval=50, repeat_delay=1000)
    plt.close()
    return ani


# ====== [5. TPSMM 모델 로드 및 예측] ======
inpainting, kp_detector, dense_motion_network, avd_network = load_checkpoints(
    config_path=config_path,
    checkpoint_path=checkpoint_path,
    device=device
)

if predict_mode == 'relative' and find_best_frame:
    i = _find(source_image, driving_video, device.type == 'cpu')
    print("Best frame:", i)
    driving_forward = driving_video[i:]
    driving_backward = driving_video[:(i+1)][::-1]
    predictions_forward = make_animation(source_image, driving_forward, inpainting, kp_detector, dense_motion_network, avd_network, device=device, mode=predict_mode)
    predictions_backward = make_animation(source_image, driving_backward, inpainting, kp_detector, dense_motion_network, avd_network, device=device, mode=predict_mode)
    predictions = predictions_backward[::-1] + predictions_forward[1:]
else:
    predictions = make_animation(source_image, driving_video, inpainting, kp_detector, dense_motion_network, avd_network, device=device, mode=predict_mode)

print("Generation done.")

# ====== [6. 영상 저장] ======
print(f"Saving to {output_video_path}")
# imageio.mimsave(output_video_path, [img_as_ubyte(frame) for frame in predictions], fps=fps)

writer = imageio.get_writer(output_video_path, fps=fps, codec='libx264', quality=10, bitrate='8M')
for frame in predictions:
    writer.append_data(img_as_ubyte(frame))
writer.close()

print("Video saved.")

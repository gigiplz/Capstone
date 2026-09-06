import os, time, json, tempfile, subprocess, traceback, requests
from urllib.parse import urljoin

# ========= 설정 =========
API_BASE    = os.environ.get("API_BASE", "https://lackadaisically-uncapsuled-christena.ngrok-free.app").rstrip("/")
COLAB_TOKEN = os.environ.get("COLAB_TOKEN", "")  # 필수
BACKOFF_SEC = int(os.environ.get("BACKOFF", "3"))
TIMEOUT     = 60

def log(*args):
    print("[WF]", *args, flush=True)

def api_url(path: str) -> str:
    path = path.lstrip("/")
    return f"{API_BASE}/{path}"

# ========= 1) 작업 클레임 =========
def claim_job():
    url = api_url("api/colab/claim")
    headers = {}
    # 백엔드 구현에 따라 x-colab-token 또는 Authorization 중 하나만 쓰면 됩니다.
    if COLAB_TOKEN:
        headers["x-colab-token"] = COLAB_TOKEN
    log("claim →", url)
    r = requests.post(url, headers=headers, timeout=TIMEOUT)
    log("claim status:", r.status_code)

    if r.status_code == 204:
        return None  # 큐 비었음

    # 원문 프리뷰(디버깅)
    raw_preview = (r.text[:200] + "...") if len(r.text) > 200 else r.text
    log("claim raw preview:", raw_preview.replace("\n", "\\n"))

    r.raise_for_status()
    payload = r.json()
    job = payload.get("job") or payload  # 서버 구현 따라 유연 처리
    if not job:
        return None
    return {
        "job_id": job.get("job_id"),
        "image_url": job.get("image_url") or job.get("image_path"),
        "genre": job.get("genre"),
        "example_index": job.get("example_index")  # ✅ 추가
    }

# ========= 2) 입력 이미지 다운로드 =========
def download_image(image_url: str, dst: str):
    full = image_url if image_url.startswith(("http://", "https://")) else urljoin(API_BASE + "/", image_url.lstrip("/"))
    log("download →", full)
    with requests.get(full, stream=True, timeout=TIMEOUT) as resp:
        log("image status:", resp.status_code, "content-type:", resp.headers.get("content-type"))
        resp.raise_for_status()
        with open(dst, "wb") as f:
            for chunk in resp.iter_content(1024 * 64):
                if chunk:
                    f.write(chunk)


#모델 수정에 맞춰서 수정함
def run_model(image_path: str, out_path: str, genre: str, example_index: int = 1):
    import subprocess, sys, os, time

    base = os.environ.get("MODEL_DIR", "/content/drive/MyDrive/KMY/Musepose/Musepose")

    #  1. 호출할 모델 스크립트 파일명 변경
    model_script_name = "test_stage_2_json_test.py"

    if not os.path.exists(os.path.join(base, model_script_name)):
        # 에러 메시지도 새 파일명으로 변경
        raise FileNotFoundError(f"{base} 에 {model_script_name}가 없습니다!")

    #  2.  장르별 포즈 비디오 경로 수정
    #       (버그 수정: hiphop_video002.mp4 -> hiphop002.mp4)
    #       (포맷팅 수정: '00{example_index}' -> '{example_index:03d}'로 변경)
    pose_video = (
        f"/content/drive/MyDrive/KMY/Musepose/Musepose/assets/poses/align/"
        f"{genre}/{genre}{example_index:03d}.mp4"
        # 예: genre="hiphop", index=2 -> ".../hiphop/hiphop002.mp4"
        # 예: genre="jazz", index=3 -> ".../jazz/jazz003.mp4"
    )

    if not os.path.exists(pose_video):
        raise FileNotFoundError(f"포즈 비디오 파일이 존재하지 않습니다: {pose_video}")


    #  3.  MusePose 실행 명령어 수정
    cmd = [
        sys.executable, model_script_name,         #  1번에서 정의한 새 스크립트 실행
        "--config", "test_stage_2.yaml",         # 기존 config 경로 유지 (로그 기반)
        "-W", "512", "-H", "512", "-L", "450", #임의로 고침
        "--ref_image", image_path,
        "--pose_video", pose_video                 #  2번에서 생성한 새 경로 사용
    ]

    print(f"[WF] MusePose 실행 시작 (경로: {base})")
    print("[WF] 명령어:", " ".join(cmd)) # 수정된 명령어가 출력됨

    # subprocess 실행 (이 부분은 동일)
    p = subprocess.run(cmd, cwd=base, text=True, capture_output=True)
    print("[WF][MusePose stdout]\n", p.stdout)
    print("[WF][MusePose stderr]\n", p.stderr)

    if p.returncode != 0:
        raise RuntimeError(f"MusePose 실행 실패 (returncode={p.returncode})")

    #  결과 파일 자동 탐색 (하위 폴더 전체에서 mp4 검색)
    found = []
    for root, _, files in os.walk(base):
        for f in files:
            #  4. 모델이 생성하는 임시파일(_temp...)은 무시
            if f.endswith(".mp4") and not f.startswith("_temp"):
                full = os.path.join(root, f)
                if time.time() - os.path.getmtime(full) < 600: # 10분 이내 생성
                    found.append(full)

    if not found: raise RuntimeError("MusePose가 영상을 생성하지 않았습니다. (.mp4 파일을 찾을 수 없음)")

    # 최신 파일 선택 (이 부분은 동일)
    latest = max(found, key=os.path.getmtime)
    print(f"[WF]  MusePose 결과 파일 감지됨: {latest}")

    import shutil
    shutil.copy2(latest, out_path)
    print("[WF] MusePose 영상 복사 완료 :", out_path)


# ========= 4) 결과 영상 업로드 (/api/internal/upload_result) =========
def upload_result(job_id: str, video_path: str):
    url = api_url("api/internal/upload_result")
    headers = {"Authorization": f"Bearer {COLAB_TOKEN}"} if COLAB_TOKEN else {}
    files = {"video": open(video_path, "rb")}
    data = {"job_id": job_id}
    log("upload_result →", url)
    r = requests.post(url, headers=headers, files=files, data=data, timeout=120)
    r.raise_for_status()
    res = r.json()  # {result_filename, result_url}
    log("upload_result OK:", res)
    return res

# ========= 5) 콜백으로 상태 DONE 처리 (/api/internal/callback) =========
def callback_done(job_id: str, result_filename: str, result_url: str, example_index: int):
    url = api_url("api/internal/callback")
    headers = {"Authorization": f"Bearer {COLAB_TOKEN}"} if COLAB_TOKEN else {}

    data = {
        "job_id": job_id,
        "error_msg": "",
        "example_index": str(example_index),
        # ✅ 파일은 이미 업로드됐으므로 포함하지 않음
    }

    log("callback →", url, "job_id:", job_id)
    # ✅ 이제 파일 대신 JSON만 전송
    r = requests.post(url, data=data, headers=headers, timeout=TIMEOUT)
    log("callback status:", r.status_code)
    log("callback text:", r.text)
    r.raise_for_status()


# ========= 6) 전체 처리 파이프라인 =========
def process_one(job):
    job_id   = job["job_id"]
    image_url= job["image_url"]
    genre    = job.get("genre") or "hiphop"
    example_index = job.get("example_index")
    if example_index is None:
        example_index = 1
    else:
        example_index = int(example_index)
    log("job_id:", job_id, "genre:", genre, "image_url:", image_url, "example_index:", example_index)

    with tempfile.TemporaryDirectory() as tmpd:
        img = os.path.join(tmpd, "input.png")
        out = os.path.join(tmpd, "out.mp4")

        download_image(image_url, img)
        run_model(img, out, genre, example_index)  # ✅ 수정  # ← 반드시 out.mp4 생성
        if not os.path.exists(out):
            raise RuntimeError("model did not produce output video")

        res = upload_result(job_id, out)  # → /videos/xxx.mp4 저장됨
        callback_done(job_id, res["result_filename"], res["result_url"], example_index)


# ========= 7) 루프 =========
def main_loop():
    if not COLAB_TOKEN:
        log("⚠️ COLAB_TOKEN이 비어있습니다. 환경변수로 설정하세요.")
    while True:
        try:
            job = claim_job()
            if not job:
                time.sleep(BACKOFF_SEC)
                continue
            process_one(job)
        except requests.HTTPError as e:
            log("HTTPError:", e, "status=", getattr(e.response, "status_code", None))
            if getattr(e, "response", None) is not None:
                body = e.response.text
                log("HTTPError body:", (body[:200]+"...") if len(body)>200 else body)
            time.sleep(BACKOFF_SEC)
        except Exception as e:
            log("Unexpected error:", e)
            traceback.print_exc()
            time.sleep(BACKOFF_SEC)

if __name__ == "__main__":
    main_loop()

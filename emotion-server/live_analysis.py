"""
AI Interview Coach - Live Analysis Window
=========================================
One OpenCV window showing ALL detections + FastAPI on port 8001 for Next.js.

Run:  python live_analysis.py
Quit: press Q in the OpenCV window
"""

import cv2, numpy as np, threading, time, uvicorn
import mediapipe as mp
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ── MediaPipe setup ──────────────────────────────────────────────────────────
mpH  = mp.solutions.hands
mpFM = mp.solutions.face_mesh
mpP  = mp.solutions.pose
mpD  = mp.solutions.drawing_utils
mpDS = mp.solutions.drawing_styles

hands     = mpH.Hands(max_num_hands=2, min_detection_confidence=0.7)
face_mesh = mpFM.FaceMesh(max_num_faces=1, refine_landmarks=True,
                           min_detection_confidence=0.5)
pose      = mpP.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

# ── FER emotion model ────────────────────────────────────────────────────────
try:
    from fer import FER
    emotion_det = FER(mtcnn=False)
    USE_FER = True
    print("✅ FER emotion model loaded")
except Exception as e:
    emotion_det = None
    USE_FER = False
    print(f"⚠️  FER not available ({e}) — install with: pip install fer tensorflow")

# ── Eye Aspect Ratio indices ─────────────────────────────────────────────────
LEFT_EYE  = [362, 385, 387, 263, 373, 380]
RIGHT_EYE = [33,  160, 158, 133, 153, 144]
EAR_THRESH   = 0.22
DROWSY_LIMIT = 25   # consecutive frames

def calc_ear(lm, idx, w, h):
    p = np.array([[lm[i].x * w, lm[i].y * h] for i in idx])
    A = np.linalg.norm(p[1]-p[5]); B = np.linalg.norm(p[2]-p[4])
    C = np.linalg.norm(p[0]-p[3])
    return (A+B)/(2*C) if C > 0 else 0.3

# ── Shared state for FastAPI ─────────────────────────────────────────────────
lock = threading.Lock()
STATE = dict(emotion="neutral", emoji="😐", emotion_conf=0.0, all_scores={},
             eye="Open", ear=0.0, blinks=0, drowsy=False,
             hands=0, slouching=False, posture="Good", fps=0)

ECOLS = dict(angry=(0,0,220), disgusted=(0,180,50), fearful=(0,165,255),
             happy=(0,220,110), neutral=(150,150,150), sad=(220,80,0),
             surprised=(200,0,200))
ELABELS = dict(angry="Angry", disgusted="Disgusted", fearful="Fearful",
               happy="Happy", neutral="Neutral", sad="Sad", surprised="Surprised")
EEMOJI  = dict(angry="😠", disgusted="🤢", fearful="😨", happy="😊",
               neutral="😐", sad="😢", surprised="😲")

def put(img, txt, xy, scale=0.55, col=(220,220,220), thick=1):
    cv2.putText(img, txt, xy, cv2.FONT_HERSHEY_SIMPLEX, scale, col, thick, cv2.LINE_AA)

def bar(img, x, y, val, col, maxw=140, h=9):
    cv2.rectangle(img, (x, y), (x+maxw, y+h), (40,40,50), -1)
    cv2.rectangle(img, (x, y), (x+int(val*maxw), y+h), col, -1)

def alert(img, txt, color, w, h):
    bw = 420; bh = 38
    bx = w//2 - bw//2; by = h - bh - 10
    cv2.rectangle(img, (bx,by), (bx+bw, by+bh), color, -1)
    put(img, txt, (bx+14, by+26), 0.55, (255,255,255), 2)

# ── Camera thread ─────────────────────────────────────────────────────────────
def run_camera():
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH,  1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT,  720)

    emo = "neutral"; emo_conf = 0.0; all_sc = {}
    blinks = 0; blink_ctr = 0; drowsy_ctr = 0
    skip = 0; SKIP_N = 6
    t_prev = time.time()

    while cap.isOpened():
        ok, frame = cap.read()
        if not ok: break
        frame = cv2.flip(frame, 1)
        H, W = frame.shape[:2]
        rgb   = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        fps = int(1 / max(time.time()-t_prev, 1e-4)); t_prev = time.time()

        # ── Hands ────────────────────────────────────────────────────────────
        hr = hands.process(rgb); hand_n = 0
        if hr.multi_hand_landmarks:
            hand_n = len(hr.multi_hand_landmarks)
            for hlm in hr.multi_hand_landmarks:
                mpD.draw_landmarks(frame, hlm, mpH.HAND_CONNECTIONS,
                    mpDS.get_default_hand_landmarks_style(),
                    mpDS.get_default_hand_connections_style())

        # ── Face Mesh → EAR ──────────────────────────────────────────────────
        fr = face_mesh.process(rgb)
        ear = 0.3; drowsy = False; eye_s = "Open"
        if fr.multi_face_landmarks:
            lm = fr.multi_face_landmarks[0].landmark
            le = calc_ear(lm, LEFT_EYE, W, H)
            re = calc_ear(lm, RIGHT_EYE, W, H)
            ear = (le+re)/2
            # Draw eye dots
            for idx in LEFT_EYE+RIGHT_EYE:
                pt = (int(lm[idx].x*W), int(lm[idx].y*H))
                cv2.circle(frame, pt, 2, (0,255,200), -1)
            if ear < EAR_THRESH:
                blink_ctr += 1; drowsy_ctr += 1
                if blink_ctr >= 3: blinks += 1; blink_ctr = 0
                if drowsy_ctr >= DROWSY_LIMIT: drowsy = True; eye_s = "DROWSY"
                else: eye_s = "Blinking"
            else:
                blink_ctr = 0
                drowsy_ctr = max(0, drowsy_ctr-1)

        # ── Pose → slouching ─────────────────────────────────────────────────
        pr = pose.process(rgb)
        slouch = False; posture_s = "Good"
        if pr.pose_landmarks:
            lm = pr.pose_landmarks.landmark
            ls = lm[mpP.PoseLandmark.LEFT_SHOULDER]
            rs = lm[mpP.PoseLandmark.RIGHT_SHOULDER]
            le2= lm[mpP.PoseLandmark.LEFT_EAR]
            re2= lm[mpP.PoseLandmark.RIGHT_EAR]
            ear_y  = (le2.y+re2.y)/2
            sho_y  = (ls.y+rs.y)/2
            if sho_y - ear_y < 0.14: slouch = True; posture_s = "Slouching"
            lpt=(int(ls.x*W),int(ls.y*H)); rpt=(int(rs.x*W),int(rs.y*H))
            col=(0,60,255) if slouch else (0,220,80)
            cv2.line(frame, lpt, rpt, col, 3)
            cv2.circle(frame, lpt, 7, col, -1)
            cv2.circle(frame, rpt, 7, col, -1)

        # ── FER emotion ───────────────────────────────────────────────────────
        skip += 1
        if USE_FER and skip >= SKIP_N:
            skip = 0
            try:
                res = emotion_det.detect_emotions(frame)
                if res:
                    sc  = res[0]["emotions"]
                    emo = max(sc, key=sc.get)
                    emo_conf = sc[emo]
                    all_sc   = sc
            except: pass

        # ── Update shared state ───────────────────────────────────────────────
        with lock:
            STATE.update(emotion=emo, emoji=EEMOJI.get(emo,"😐"),
                         emotion_conf=round(emo_conf,3), all_scores=all_sc,
                         eye=eye_s, ear=round(ear,3), blinks=blinks,
                         drowsy=drowsy, hands=hand_n, slouching=slouch,
                         posture=posture_s, fps=fps)

        # ── Draw dark sidebar panel ───────────────────────────────────────────
        SW = 260
        panel = frame[0:H, 0:SW].copy()
        cv2.addWeighted(panel, 0.3, np.zeros_like(panel), 0.7, 0, frame[0:H,0:SW])

        ecol = ECOLS.get(emo, (150,150,150))
        y = 28
        put(frame,"AI Interview Coach",(10,y),0.6,(200,200,255),2); y+=22
        put(frame,"Live Analysis",(10,y),0.35,(100,100,160)); y+=12
        cv2.line(frame,(8,y),(SW-8,y),(60,60,90),1); y+=14

        # Emotion section
        put(frame,"EMOTION",(10,y),0.35,(120,120,150)); y+=18
        put(frame,ELABELS.get(emo,emo),(10,y),0.75,ecol,2); y+=22
        put(frame,f"Confidence: {int(emo_conf*100)}%",(10,y),0.35,ecol); y+=12
        # bars for all 7 emotions
        for em in ["happy","neutral","sad","angry","fearful","surprised","disgusted"]:
            sc_v = all_sc.get(em, 0.0)
            bc   = ECOLS.get(em,(100,100,100))
            bar(frame,10,y,sc_v,bc,maxw=140,h=7)
            put(frame,em[:3],(156,y+7),0.28,bc)
            y+=11
        y+=4
        cv2.line(frame,(8,y),(SW-8,y),(60,60,90),1); y+=12

        # Eyes section
        ecol2=(0,50,255) if drowsy else (0,200,200) if eye_s=="Blinking" else (0,220,80)
        put(frame,"EYES",(10,y),0.35,(120,120,150)); y+=18
        put(frame,eye_s,(10,y),0.65,ecol2,2); y+=20
        put(frame,f"EAR:{ear:.3f}  Blinks:{blinks}",(10,y),0.32,(100,100,120)); y+=14
        cv2.line(frame,(8,y),(SW-8,y),(60,60,90),1); y+=12

        # Hands section
        hcol=(0,200,255) if hand_n>0 else (80,80,100)
        put(frame,"HANDS",(10,y),0.35,(120,120,150)); y+=18
        put(frame,f"{hand_n} hand{'s' if hand_n!=1 else ''} detected",(10,y),0.6,hcol,2); y+=20
        cv2.line(frame,(8,y),(SW-8,y),(60,60,90),1); y+=12

        # Posture section
        pcol=(0,50,255) if slouch else (0,220,80)
        put(frame,"POSTURE",(10,y),0.35,(120,120,150)); y+=18
        put(frame,posture_s,(10,y),0.65,pcol,2); y+=20

        # FPS + API
        put(frame,f"FPS:{fps}",(10,H-36),0.35,(70,70,100))
        put(frame,"API:8001 (Next.js)",(10,H-20),0.32,(60,120,60))

        # Alert banners
        if drowsy:
            alert(frame,"⚠  DROWSINESS DETECTED — Blink and stay alert!",(0,0,180),W,H)
        elif slouch:
            alert(frame,"⚠  Sit up straight — poor posture detected!",(30,80,180),W,H)
        elif hand_n > 0:
            alert(frame,"👐  Hands detected — keep them still",(100,80,10),W,H)

        cv2.imshow("AI Interview Coach — Live Analysis  [Q to quit]", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

# ── FastAPI server (runs in background thread) ────────────────────────────────
app = FastAPI(title="Live Analysis Server")
app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])

@app.get("/")
def health():
    return {"status":"ok","port":8001}

@app.get("/state")
def get_state():
    with lock:
        return dict(STATE)

@app.post("/detect_emotion")
async def detect_emotion(body: dict):
    """Compatibility endpoint for Camera.tsx frame polling."""
    with lock:
        return {
            "emotion": STATE["emotion"],
            "emoji":   STATE["emoji"],
            "confidence": STATE["emotion_conf"],
            "all_scores": STATE["all_scores"],
        }

def run_api():
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="error")

# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n🎬 Starting AI Interview Coach Live Analysis")
    print("   OpenCV window will open shortly...")
    print("   FastAPI serving on http://localhost:8001")
    print("   Press Q in the OpenCV window to quit\n")
    api_thread = threading.Thread(target=run_api, daemon=True)
    api_thread.start()
    time.sleep(1)   # let FastAPI boot first
    run_camera()    # runs on main thread (required by OpenCV)

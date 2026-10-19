# AI Studio Voiceover Studio & Video Producer 🎙️🎬

A production-ready AI Voiceover and High-Retention Animated YouTube Video Production suite powered by **Google AI Studio** and **Gemini 3.8 Speech Models** (`gemini-3.8-flash-lite-tts` and `gemini-3.8-flash-tts`).

Repository: `thinkdivisionv-p1/ai-studio-voiceover`

---

## ⚡ What Makes This Studio Unique

### 1. 🎙️ Gemini 3.8 Speech Synthesis
- **Single & Dual-Speaker**: Direct solo narrators or 2-actor dialogues with natural conversational backchanneling (`|mhm|`, `|yeah|`).
- **Expressive Vocal Bursts**: Inject human breathing (`<breath>`), laughter (`<laugh>`), gasps (`<gasp>`), and sighs (`<sigh>`).
- **5 Neural Voice Profiles**: Kore, Puck, Fenrir, Zephyr, and Charon.

### 2. 📄 Document-to-Speech (TXT / DOCX / PDF)
- Drag and drop `.TXT`, `.DOCX` (Word), or `.PDF` files.
- Automatically segments long scripts into logical ~160-word chunks.
- **Lossless Master WAV Stitching**: Concatenates all segment clips into a single continuous 24kHz 16-bit mono WAV file with bit-perfect RIFF header reconstruction.

### 3. 🎬 Market Gap Daily — High-Retention YouTube Video Engine
- **1920 × 1080 (Full HD) @ 30 FPS MP4 / WebM**: Rendered dynamically using high-performance HTML5 Canvas and MediaRecorder.
- **Visual Identity**: Dark charcoal/navy base (`#070B14`, `#0B1120`), Electric Cyan accent (`#00F0FF`), technical grid lines, and glowing energy pulses.
- **Kinetic Typography & Animated Data Charts**: Growing bar charts, progressive line graphs, and counting metric counters.
- **Infrastructure Flow Diagrams**: Visual pipelines showing engineering bottlenecks and solutions.
- **Pacing Standard**: Enforces visual composition changes every 3–6s (no static slides > 6.0s).
- **All 4 Deliverables**:
  1. 1080p MP4 Video
  2. Word-Accurate Synchronized `.SRT` Captions
  3. 1280 × 720 PNG High-CTR Thumbnail
  4. Automated Quality-Control (QC) Audit Report

### 4. ☁️ Cloudflare Pages & Workers ($0 / Month)
- Serverless edge functions in `/functions/api/...` for instant audio proxying without a separate Node.js server.
- Automated CI/CD via GitHub Actions and Cloudflare Git Integration.
- Optional `STUDIO_PASSWORD` authentication to protect your API quota.

---

## 🚀 How to Reflect & Deploy This on GitHub and Cloudflare

### Step 1: Push Changes to Your GitHub Repository
Run these commands in your project terminal:

```bash
# 1. Add all files and commit
git add .
git commit -m "feat: complete voiceover studio with YouTube video generator and cloudflare pages deployment"

# 2. Push to your main branch
git push -u origin main
```

*(If you get a push rejection due to remote changes on GitHub, run `git pull --rebase origin main && git push origin main`)*.

---

### Step 2: Connect to Cloudflare Pages (Free, Zero Local Software)

1. Open [dash.cloudflare.com](https://dash.cloudflare.com/) and navigate to **Workers & Pages** > **Create Application** > **Pages** > **Connect to Git**.
2. Select your repository: **`thinkdivisionv-p1/ai-studio-voiceover`**.
3. Confirm Build Settings:
   - **Framework preset**: `Vite` (or `None`)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. In **Environment Variables (Advanced)**, add:
   - `GEMINI_API_KEY`: *(Your key from [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey))*
   - `STUDIO_PASSWORD`: *(Optional personal passcode to protect your public URL)*
5. Click **Save and Deploy**.

Cloudflare will build the frontend, deploy the serverless edge functions (`/functions/api/...`), and give you a live production URL:
`https://ai-studio-voiceover.pages.dev` with free SSL, global CDN, and automated deployments on every future commit!

---

## 📁 Repository Structure

```
├── functions/                     # Cloudflare Pages Edge Functions
│   └── api/
│       ├── tts/generate.ts        # Gemini 3.8 Speech Edge Worker
│       ├── script/generate.ts     # Script Generation Worker
│       ├── auth/verify.ts         # Security Auth Verification Worker
│       └── health.ts              # Edge Health Check
├── src/
│   ├── components/
│   │   ├── VideoStudio/           # YouTube Animated Video Production
│   │   │   ├── CanvasVideoPlayer.tsx    # 1080p 30 FPS Player & HUD
│   │   │   ├── SceneTableEditor.tsx     # Storyboard & Pacing Beat Editor
│   │   │   ├── ThumbnailPreviewModal.tsx# 1280x720 PNG Thumbnail Studio
│   │   │   ├── QCReportModal.tsx        # Retention & Static Duration QC
│   │   │   ├── ExportVideoModal.tsx     # 1080p MP4 Video Encoder
│   │   │   └── VideoStudioPage.tsx      # Main Video Production Suite
│   │   ├── AudioPlayer.tsx        # 24kHz Waveform Audio Scrubber
│   │   ├── MultiSegmentManager.tsx# TXT/DOCX/PDF Uploader & WAV Stitcher
│   │   ├── DialogueEditor.tsx     # Dual-Speaker Screenplay Director
│   │   ├── VoiceSelector.tsx      # Neural Voice Persona Cards & Audition
│   │   └── SecuritySettingsModal.tsx # Passcode Protection
│   ├── utils/
│   │   ├── canvasSceneRenderer.ts # 1080p Kinetic & Diagram Renderer
│   │   ├── thumbnailGenerator.ts  # 720p Thumbnail Renderer
│   │   ├── srtGenerator.ts        # Word-Accurate SRT Captions
│   │   ├── qcAuditor.ts           # 6s Static Limit & Retention Auditor
│   │   ├── documentParser.ts      # Mammoth & PDF.js Text Extractor
│   │   └── wavStitcher.ts         # Lossless RIFF PCM WAV Concatenation
│   ├── App.tsx                    # Main Studio Orchestrator
│   └── main.tsx
├── .github/workflows/
│   └── deploy-cloudflare.yml      # Automated GitHub Actions CI/CD
├── wrangler.toml                  # Cloudflare Pages Configuration
└── server.ts                      # Local Express Dev / Fallback Server
```

---

## 📄 License
Apache-2.0

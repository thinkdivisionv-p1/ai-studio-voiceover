# AI Studio Voiceover Studio 🎙️

A production-ready AI Voiceover and Screenplay synthesis web application powered by **Google AI Studio** and **Gemini 3.8 Speech Synthesis** models (`gemini-3.8-flash-lite-tts` and `gemini-3.8-flash-tts`).

Craft studio-grade voiceovers, YouTube narration, cinematic documentary voice acting, and dual-speaker podcasts with natural breathing pauses, vocal bursts (`<laugh>`, `<gasp>`, `<sigh>`), and dialogue backchanneling (`|mhm|`, `|yeah|`).

---

## ✨ Features

- **⚡ Gemini 3.8 Speech Models**:
  - `gemini-3.8-flash-lite-tts`: High-efficiency, crisp 24kHz audio for YouTube narration, explainers, and audiobooks.
  - `gemini-3.8-flash-tts`: Flagship audio model with expressive voice design, vocal bursts, and dual-speaker screenplay direction.
- **🎭 5 Prebuilt Studio Voice Personas**:
  - **Kore**: Calm, warm, articulate, empathetic.
  - **Puck**: Youthful, vibrant, energetic, playful.
  - **Fenrir**: Deep, cinematic baritone, authoritative.
  - **Zephyr**: Modern, conversational, relaxed, relatable.
  - **Charon**: Solemn, reflective, grounded, commanding.
- **🎬 Dual-Speaker Screenplay Directing**:
  - Direct 2 distinct voice actors in a single script turn (e.g. Alex & Sam podcast).
- **💥 Human Nuance & Vocal Burst Injection**:
  - One-click insertion of `<breath>`, `<laugh>`, `<gasp>`, `<sigh>`, `<cough>`, `|mhm|`, `|yeah|`.
- **✍️ Gemini AI Scriptwriter**:
  - Integrated script generator powered by `gemini-3.8-flash` with target duration estimation.
- **🎵 Waveform Audio Player**:
  - Interactive scrubbing, variable speed (0.75x to 2.0x), volume control, and instant `.WAV` download.
- **🔒 Enterprise Full-Stack Security**:
  - Secure server-side proxy via Express. API keys are never exposed to the client bundle.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- A free Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### 2. Clone or Push to Your GitHub
```bash
# Initialize git if starting fresh
git init
git add .
git commit -m "feat: initial commit of AI Studio Voiceover Studio"

# Add your GitHub remote
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-studio-voiceover.git
git push -u origin main
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Open `.env` and add your Gemini API key:
```env
GEMINI_API_KEY="AIzaSy..."
PORT=3000
```
> Get your free key instantly at [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### 5. Run Locally
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 📦 Production Build & Deployment

### Build
```bash
npm run build
npm start
```

### Deploy to Hosting Platforms

#### Deploy to Render / Railway / Fly.io / VPS:
1. Connect your GitHub repository.
2. Build Command: `npm run build`
3. Start Command: `npm start`
4. Set Environment Variable: `GEMINI_API_KEY = your_gemini_key`

#### Deploy to Google Cloud Run:
```bash
gcloud run deploy ai-studio-voiceover \
  --source . \
  --set-env-vars GEMINI_API_KEY="YOUR_KEY" \
  --allow-unauthenticated
```

---

## 🛠️ Architecture

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons
- **Backend**: Node.js, Express, `tsx` runtime, `@google/genai` SDK v2.4+
- **Audio Output**: 24kHz 16-bit Mono WAV format with standard RIFF headers

---

## 📄 License
Apache-2.0

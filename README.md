<div align="center">
  <img src="jawhar_logo.png" alt="Jawhar Logo" width="150" height="150">
  
  # Jawhar (جوهر) - Arabic Morphosyntactic Explorer
  
  **An AI-driven pedagogical tutor for Classical Arabic**
</div>

<br />

<div align="center">

[![Backend Deployment](https://img.shields.io/badge/HF%20Spaces-Backend-blue?logo=huggingface)](https://huggingface.co/spaces/meherali/jawhar)
[![Frontend Deployment](https://img.shields.io/badge/Vercel-Frontend-black?logo=vercel)](#)
[![Medium Article](https://img.shields.io/badge/Medium-Article-black?logo=medium)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

<div align="center">
  
  ![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)
  ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
  ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
  ![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
  ![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)
  
</div>

## 📖 Overview

**Jawhar (جوهر)** is an advanced, AI-driven pedagogical tool designed for exploring the classical Arabic corpus (specifically the Quran). The platform offers deep morphological analysis, semantic search capabilities, and an interactive AI tutor designed to facilitate learning. Leveraging state-of-the-art NLP tools like CAMeL and Google's Gemini Flash, Jawhar breaks down complex Arabic words into digestible morphological and syntactic components.

---

## 📸 Screenshots

*Replace the placeholders below with actual screenshots of the application.*

| Main Dashboard | Morphological Analysis | Verse Exploration | AI Tutor Chat |
| :---: | :---: | :---: | :---: |
| <img src="screenshots/main_dashboard_placeholder.png" width="200" alt="Main Dashboard"/> | <img src="screenshots/morphology_placeholder.png" width="200" alt="Morphological Analysis"/> | <img src="screenshots/verse_placeholder.png" width="200" alt="Verse Detail"/> | <img src="screenshots/chat_placeholder.png" width="200" alt="AI Tutor Chat"/> |

---

## ✨ Features

- **🧩 Deep Morphological Analysis (Sarf)**: Interactive word-by-word breakdown showing Root, Lemma, POS tags, Person, Voice, Aspect, Case, and meaning using CAMeL Tools.
- **🔍 Semantic Search**: Search the Quranic corpus using a highly specialized Vector DB (ChromaDB) RAG pipeline.
- **🤖 AI Pedagogical Tutor (Jawhar AI)**: Engage with a Gemini-powered AI tutor that provides I'rab (syntax) and Sarf (morphological) explanations tailored to your selections.
- **🌍 Bilingual & RTL**: A perfectly localized UI in both Arabic and English with seamless Right-to-Left (RTL) transition.
- **🎨 Custom Modern UI**: A premium dark-mode interface embellished with Glassmorphism and subtle animations.

---

## 🏗 System Architecture

The project employs a modern separated frontend/backend architecture, integrating cutting edge AI and NLP components:

```mermaid
graph TD
    %% Frontend Layer
    subgraph Frontend [Mobile/Web App - Expo React Native]
        UI[User Interface]
        State[State Management]
        TutorUI[Chat Interface]
        APIClient[API Client service]
    end

    %% Backend Layer
    subgraph Backend [FastAPI Server]
        API[REST API Routes]
        Morph[CAMeL Tools NLP Engine]
        RAG[ChromaDB Vector Store]
        Gemini[Gemini Flash Service]
        Data[Quranic Dataset]
    end

    %% Connections
    UI <--> State
    State <--> APIClient
    TutorUI <--> APIClient
    
    APIClient <--> |HTTPS / JSON| API
    
    API --> Morph
    API --> RAG
    API --> Gemini
    API --> Data
    
    RAG -.->|Contextual Data| Gemini
```

---

## 📁 Directory Structure

```text
jawhar/
├── backend/              # Python FastAPI Application
│   ├── app/              # Microservices & API Routes
│   ├── scripts/          # Database & Vector DB population utilities
│   ├── tests/            # Pytest test suite
│   ├── Dockerfile        # Production Containerization setup
│   └── requirements.txt  # Python backend dependencies
├── frontend/             # Expo React Native App
│   ├── src/              # Reusable UI Components, Services, Utilities
│   ├── app/              # Expo Router specific screens and tabs
│   ├── assets/           # Application images and fonts
│   └── package.json      # Node.js dependencies
├── dataset/              # Base Quranic Morphology Corpus (v0.4)
├── dev.sh                # Zero-config Orchestration Script for locals
└── README.md             # You are here!
```

---

## 🚀 Deployment

The project is designed with seamless deployment to optimal environments.

### Backend (Hugging Face Spaces)
The backend is Dockerized and deployed gracefully to Hugging Face Spaces.

**Remote Origin Deployment**:
`git push https://<USER>:<TOKEN>@huggingface.co/spaces/<USER>/jawhar hf-deploy:main --force`

- **Production API**: `https://meherali-jawhar.hf.space/api/v1`
- **Space URL**: [Meherali Jawhar Space](https://huggingface.co/spaces/meherali/jawhar)

### Frontend (Vercel)
The React Native app can be readily built and shipped to Vercel via a continuous deployment process linking directly to your GitHub remote.
Be sure to set the `EXPO_PUBLIC_API_URL` to your production Hugging Face Spaces API.

---

## 🛠️ Local Setup & Development

Do you want to run Jawhar locally on your machine?

### Prerequisites
- **Python 3.12+**
- **Node.js 18+** & **pnpm**
- **Gemini API Key**: Grab one from [Google AI Studio](https://aistudio.google.com/)

### Step-by-Step Configuration

1. **Clone the Repo:**
   ```bash
   git clone https://github.com/magic-meer/Arabic-Morphosyntactic-Explorer.git
   cd Arabic-Morphosyntactic-Explorer
   ```

2. **Environment Variables:**
   Create a `.env` file in the `backend/` directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Running the Application (One-Command setup):**
   ```bash
   ./dev.sh
   ```
   *This script orchestrates both the backend (Uvicorn port `8000`) and the frontend Expo server simultaneously.*

4. **Running Individually:**
   - **Backend:** 
     ```bash
     cd backend && pip install -r requirements.txt
     uvicorn app.main:app --reload --port 8000
     ```
   - **Frontend:**
     ```bash
     cd frontend && pnpm install
     npx expo start
     ```

---

## 🤝 Contributing

Contributions are more than welcome!
Feel free to open an issue or fork the repository and submit a Pull Request.

---

## 📜 License

[MIT License](https://opensource.org/licenses/MIT)

*Jawhar is built to democratize Arabic learning. Explore, analyze, and learn.*
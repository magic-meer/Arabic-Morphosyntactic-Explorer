---
title: Jawhar - Arabic Morphosyntactic Explorer
emoji: 📖
colorFrom: indigo
colorTo: blue
sdk: docker
pinned: false
---

# 📖 Arabic Morphosyntactic Explorer (A-AME)

[![Backend Deployment](https://img.shields.io/badge/HF%20Spaces-Backend-blue?logo=huggingface)](https://huggingface.co/spaces/meherali/jawhar)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An AI-driven pedagogical tutor for Classical Arabic (Quranic corpus). A-AME provides deep morphological analysis, semantic search, and interactive learning powered by Gemini 2.0.

---

## ✨ Key Features

- **🔍 Semantic Search**: Search the Quranic corpus by Arabic text or semantic meaning (RAG pipeline).
- **🧩 Morphological Explorer**: Interactive word-by-word analysis including Root, Lemma, POS tags, and full I'rab.
- **🤖 AI Pedagogical Tutor**: A context-aware chat interface powered by Gemini 2.0 with context caching for efficiency.
- **🌍 Bilingual & RTL**: Fully localized UI in Arabic and English with native RTL layout support.
- **🚀 One-Click Setup**: Hybrid development environment orchestrator for instant local startup.

---

## 🛠️ Tech Stack

### Backend (Python/FastAPI)
- **NLP**: [CAMeL Tools](https://github.com/CAMeL-Lab/camel_tools) for morphology.
- **Vector DB**: [ChromaDB](https://www.trychroma.com/) for semantic indexing.
- **AI**: Gemini 2.0 Flash API with Context Caching.
- **Server**: FastAPI with Uvicorn.

### Frontend (Expo/React Native)
- **Framework**: Expo (React Native) with Expo Router.
- **Language**: TypeScript.
- **UI/UX**: Custom premium dark-mode design with Glassmorphism elements.
- **RTL**: Native `I18nManager` integration.

---

## 🚦 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+ & `pnpm`
- [Gemini API Key](https://aistudio.google.com/)

### One-Command Setup & Run
Clone the repository and run the orchestrator:

```bash
cd arabic-morphosyntactic-explorer
./dev.sh
```

This script will:
1. Create a Python virtual environment.
2. Install all backend dependencies.
3. Install all frontend dependencies via `pnpm`.
4. Launch both the Backend (Port 8000) and Frontend development servers.

---

## ☁️ Deployment

The backend is containerized and optimized for **Hugging Face Spaces**.

- **Dockerfile**: Optimized for HF with automated startup database population.
- **Production URL**: `https://meherali-jawhar.hf.space/`

*Note: Ensure `GEMINI_API_KEY` is set as a Secret in your HF Space.*

---

## 📁 Project Structure

```text
├── backend/              # FastAPI Application
│   ├── app/              # Source code
│   ├── scripts/          # DB population utilities
│   └── requirements.txt  # Python weights
├── frontend/             # Expo Mobile App
│   ├── src/              # Components, Hooks, API
│   └── app/              # Expo Router screens
├── dataset/              # Quranic Morphology Corpus (v0.4)
├── dev.sh                # Unified Orchestration Script
└── Dockerfile            # Production Containerization
```

---

## 🤝 Contributing

This project is a 30-day capstone module. Contributions are welcome for:
- Expanding the vector store beyond the initial 1000 verses.
- Adding advanced morphological filtering.
- Enhancing AI pedagogical prompts.

---

## 📜 License

MIT License - 2026 A-AME Team
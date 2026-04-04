# Design Document: AI Arabic Morphosyntactic Explorer

## Project Overview

**Project Name**: AI Arabic Morphosyntactic Explorer  
**Type**: AI-Driven Pedagogical Tutor for Classical Arabic  
**Version**: 1.0  
**Date**: 2026-04-04

---

## 1. Problem Statement

Classical Arabic is morphologically rich, where a single word-form can contain an entire sentence's worth of information. Existing tools like the Quranic Arabic Corpus are expert-oriented but static, while general AI models often "hallucinate" grammatical roots or rules due to a lack of grounded linguistic metadata.

---

## 2. Objectives

1. **High-Fidelity Reasoning**: Leverage LLM reasoning to explain complex I'rab (syntax) and Sarf (morphology)
2. **Grounded Accuracy**: Integrate expert-verified datasets into a Retrieval-Augmented Generation (RAG) pipeline
3. **Professional Deployment**: Demonstrate a containerized (Docker) backend and a mirrored (RTL) mobile UI
4. **Cost Efficiency**: Utilize Gemini 3.1 Flash Lite context caching to reduce API operational costs

---

## 3. Solution Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (Expo/React Native)                │
│                    RTL Support + Bilingual UI                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FastAPI Backend                            │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │  API Routes   │  │  Services    │  │   Models          │   │
│  │  /verses      │  │  - quran     │  │   - Pydantic      │   │
│  │  /morphology  │  │  - morphology│  │   - Response      │   │
│  │  /chat        │  │  - rag       │  │                   │   │
│  │               │  │  - gemini    │  │                   │   │
│  └──────────────┘  └──────────────┘  └───────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  CAMeL Tools    │  │     ChromaDB    │  │   Gemini 3.1    │
│  (Morphology)   │  │   (Vectors)     │  │   Flash Lite    │
│                 │  │                 │  │   Preview       │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Quranic Arabic  │  │ Quranic Corpus  │  │ Context Cache   │
│ Corpus v0.4     │  │ (vectors)       │  │ (cost savings)  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 4. Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | React Native (Expo) | Latest |
| **Backend** | FastAPI | 0.100+ |
| **NLP** | CAMeL Tools | Latest |
| **Vector DB** | ChromaDB | Latest |
| **AI** | Gemini 3.1 Flash Lite | Preview |
| **Embeddings** | sentence-transformers | 2.2+ |

---

## 5. Data Specification

### Dataset: Quranic Arabic Corpus v0.4

**Source**: Local file `dataset/quranic-corpus-morphology-0.4.txt`

**Format**: Tab-separated with columns:
- `LOCATION`: `(chapter:verse:word:subword)` e.g., `(1:1:1:1)`
- `FORM`: Transliterated Arabic word
- `TAG`: Part-of-speech tag (N, V, ADJ, PN, etc.)
- `FEATURES`: Morphological features (LEMMA, ROOT, GENDER, CASE, etc.)

**Coverage**:
- 114 chapters (surahs)
- 6,236 verses
- ~77,000 words with full morphological annotation

**Example Entry**:
```
(1:1:1:2)	somi	N	STEM|POS:N|LEM:{som|ROOT:smw|M|GEN
```

---

## 6. Component Specifications

### 6.1 Corpus Parser Service

**Purpose**: Parse the morphology corpus file and extract structured data

**Functionality**:
- Read tab-separated file
- Parse location codes (chapter:verse:word:subword)
- Extract form, tag, and features
- Group words by verse
- Expose API for verse lookup

**Output**: Structured verse data with morphological annotations

### 6.2 Morphology Service

**Purpose**: Provide morphological analysis for both corpus and user-entered text

**Functionality**:
- For Quranic verses: Return pre-annotated data from corpus
- For user text: Use CAMeL Tools for real-time analysis
- Extract: root, lemma, POS, gender, number, case, mood, voice

**Output**: Morphological analysis result with all linguistic features

### 6.3 Vector Store (ChromaDB)

**Purpose**: Enable semantic search over Quranic verses

**Functionality**:
- Store verses with metadata (chapter, verse, Arabic text, translation)
- Generate embeddings using sentence-transformers
- Support semantic similarity search
- Support filtering by chapter/verse

**Schema**:
```
- id: str
- chapter: int
- verse: int
- arabic_text: str
- translation: str (optional)
- tokens: list[dict]
```

### 6.4 RAG Pipeline

**Purpose**: Ground AI responses in verified Quranic data

**Functionality**:
- Receive user question
- Search ChromaDB for relevant verses
- Fetch morphological data for mentioned words
- Construct context prompt with verse data
- Send to Gemini with context
- Return grounded response

**Context Format**:
```
Relevant verses from the Quran:
[Verse 1:1] بسم الله الرحمن الرحيم
- Word: "الرحمن" - Root: ر ح م - POS: ADJ - Meaning: The Merciful

Question: Explain the morphology of "الرحمن"
```

### 6.5 Gemini AI Service

**Purpose**: Provide conversational tutoring with context caching

**Functionality**:
- Initialize Gemini 3.1 Flash Lite (Preview)
- Implement context caching for repeated Quranic references
- Generate pedagogical explanations
- Support bilingual responses (Arabic + English)
- Handle error cases gracefully

**Cost Optimization**:
- Cache frequently accessed verses
- Reuse context for similar queries
- Monitor token usage

### 6.6 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/health` | GET | Health check |
| `/api/v1/verses/{chapter}/{verse}` | GET | Get specific verse |
| `/api/v1/verses/{chapter}` | GET | Get chapter verses |
| `/api/v1/verses/search` | POST | Semantic search |
| `/api/v1/morphology/{chapter}/{verse}` | GET | Morphology for verse |
| `/api/v1/morphology/analyze` | POST | Analyze user text |
| `/api/v1/chat` | POST | AI tutoring chat |

---

## 7. Frontend Specifications (Phase 2)

### 7.1 Technology
- React Native with Expo
- React Navigation
- i18next for internationalization

### 7.2 Screens
- **Home**: Welcome + quick search
- **Verse Explorer**: Browse/search verses
- **Morphology**: Word analysis view
- **Chat**: AI tutoring interface
- **Settings**: Language, theme

### 7.3 RTL Support
- Use `I18nManager` for RTL
- Use `start`/`end` instead of `left`/`right`
- Test all layouts in both directions

---

## 8. Deployment

### 8.1 Backend
- Docker container
- Python 3.10+
- Environment variables for API keys

### 8.2 Frontend
- Expo for development
- Build for Android/iOS
- APK/IPA for distribution

---

## 9. Implementation Phases

### Phase 1: Backend Core (Week 1-2)
- [ ] Project setup with FastAPI
- [ ] Corpus parser service
- [ ] Basic API endpoints
- [ ] ChromaDB integration

### Phase 2: NLP & RAG (Week 3)
- [ ] CAMeL Tools integration
- [ ] RAG pipeline implementation
- [ ] Gemini integration
- [ ] Context caching

### Phase 3: Frontend (Week 4)
- [ ] Expo project setup
- [ ] UI components with RTL
- [ ] API integration
- [ ] Testing & deployment

---

## 10. Constraints & Considerations

1. **Dataset Limitation**: Only Quranic Classical Arabic
2. **API Dependency**: Requires Gemini API key
3. **Offline**: AI features require internet; morphological analysis can work offline
4. **Performance**: Large corpus may require optimized loading

---

## 11. Success Criteria

- [ ] Backend API returns verse data with morphology
- [ ] Semantic search returns relevant results
- [ ] RAG pipeline grounds responses in corpus data
- [ ] Gemini provides pedagogical explanations
- [ ] Context caching reduces API costs
- [ ] Frontend displays RTL Arabic correctly
- [ ] Bilingual support (Arabic + English)
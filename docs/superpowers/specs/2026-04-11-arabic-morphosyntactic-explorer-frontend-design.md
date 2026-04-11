# Design Document: Arabic Morphosyntactic Explorer Frontend

## Project Overview

**Project Name**: Arabic Morphosyntactic Explorer - Frontend  
**Type**: React Native Mobile Application (Expo)  
**Version**: 1.0  
**Date**: 2026-04-11

---

## 1. Introduction

This is Phase 2 of the Arabic Morphosyntactic Explorer project - the frontend mobile application. The backend (FastAPI + CAMeL Tools + ChromaDB + Gemini) is already implemented and running.

The frontend will provide a mobile interface for students to explore Quranic verses, analyze morphological features, and chat with an AI tutor.

---

## 2. Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React Native (Expo) | Latest (SDK 52+) |
| Language | TypeScript | 5.x |
| Navigation | React Navigation | 6.x |
| HTTP Client | axios | 1.x |
| Internationalization | i18next + react-i18next | 23.x |
| Localization | expo-localization | Latest |
| State Management | React Context + useReducer | Built-in |
| UI Components | Custom + React Native core | Built-in |

---

## 3. Screen Specifications

### 3.1 Home Screen

**Purpose**: Welcome screen with quick search and navigation

**Components**:
- App logo/title
- Search bar (semantic search)
- Quick access buttons:
  - "Browse Chapters"
  - "Random Verse"
  - "AI Tutor"
- Language toggle (AR/EN)

**Navigation**: Stack → Verse Explorer, Morphology, Chat

### 3.2 Verse Explorer Screen

**Purpose**: Browse and select Quranic verses

**Components**:
- Chapter list (114 surahs)
- Selected chapter → Verse list
- Verse tap → Morphology view
- Search filter
- Pagination (load more)

**Navigation**: Tap chapter → shows verses → tap verse → Morphology

### 3.3 Morphology Screen

**Purpose**: Display word-by-word morphological analysis

**Components**:
- Verse header (chapter:verse)
- Word list with:
  - Arabic form (transliterated)
  - Part of Speech (tag)
  - Root (triliteral)
  - Lemma
  - Gender, Number, Case
- Tap word for expanded details
- Share verse button

**Data Source**: Backend `/api/v1/morphology/{chapter}/{verse}`

### 3.4 Chat Screen (AI Tutor)

**Purpose**: Conversational interface for AI tutoring

**Components**:
- Message list (user + assistant)
- Input field + send button
- Context verses display (when AI references verses)
- Loading indicator
- Error handling

**Data Source**: Backend `/api/v1/chat`

### 3.5 Settings Screen

**Purpose**: User preferences

**Components**:
- Language selector (Arabic / English)
- Theme toggle (Light / Dark) - future
- About section
- API configuration (backend URL)

---

## 4. RTL & Bilingual Support

### 4.1 RTL Implementation

- Use `I18nManager` from Expo
- All layout: use `start`/`end` instead of `left`/`right`
- Text alignment: Arabic → right, English → left
- Test in both LTR and RTL modes

### 4.2 Internationalization (i18n)

**Supported Languages**:
- English (en) - default
- Arabic (ar) - RTL

**Implementation**:
- i18next configuration
- Separate locale files: `en.json`, `ar.json`
- Translation keys for all UI text
- Dynamic language switching
- Persist language preference

---

## 5. API Integration

### 5.1 Base Configuration

- Default API URL: `http://localhost:8000`
- Configurable in Settings
- Timeout: 30 seconds

### 5.2 Endpoints Used

| Endpoint | Method | Usage |
|----------|--------|-------|
| `/api/v1/verses/{chapter}/{verse}` | GET | Get verse data |
| `/api/v1/verses/{chapter}` | GET | Get chapter verses |
| `/api/v1/verses/search` | POST | Semantic search |
| `/api/v1/morphology/{chapter}/{verse}` | GET | Get morphology |
| `/api/v1/morphology/analyze` | POST | Analyze user text |
| `/api/v1/chat` | POST | AI chat |
| `/api/v1/health` | GET | Connection test |

### 5.3 Error Handling

- Network errors: Show retry option
- API errors: Display user-friendly message
- Offline: Show connection status
- Timeout: Show timeout message

---

## 6. File Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── VerseCard.tsx
│   │   ├── WordItem.tsx
│   │   ├── SearchBar.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── LanguageToggle.tsx
│   │   └── LoadingIndicator.tsx
│   │
│   ├── screens/           # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── VerseExplorerScreen.tsx
│   │   ├── MorphologyScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   └── SettingsScreen.tsx
│   │
│   ├── services/          # API client
│   │   └── api.ts
│   │
│   ├── hooks/            # Custom hooks
│   │   ├── useVerses.ts
│   │   ├── useMorphology.ts
│   │   ├── useChat.ts
│   │   └── useLanguage.ts
│   │
│   ├── i18n/             # Internationalization
│   │   ├── index.ts
│   │   ├── en.json
│   │   └── ar.json
│   │
│   ├── utils/            # Utilities
│   │   ├── rtl.ts
│   │   └── constants.ts
│   │
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   │
│   └── context/          # React Context
│       └── AppContext.tsx
│
├── app.json              # Expo config
├── package.json
├── tsconfig.json
└── babel.config.js
```

---

## 7. Component Details

### VerseCard
- Displays chapter:verse
- Shows first few words
- Tap to navigate to Morphology

### WordItem
- Arabic form
- POS tag badge
- Root indicator
- Expandable for more details

### ChatMessage
- User message (right aligned)
- Assistant message (left aligned)
- Context verses (when referenced)

### SearchBar
- Text input
- Search button
- Clear button
- Loading state

---

## 8. State Management

### App Context
- Language (en/ar)
- Theme (light/dark)
- API URL
- User preferences

### Screen States
- Loading: Show spinner
- Error: Show error message + retry
- Empty: Show empty state message
- Data: Render content

---

## 9. Implementation Phases

### Phase 1: Setup & Core
- [ ] Initialize Expo project
- [ ] Configure TypeScript
- [ ] Set up React Navigation
- [ ] Configure i18next

### Phase 2: Components
- [ ] Build reusable components
- [ ] Implement RTL utilities

### Phase 3: Screens
- [ ] Home Screen
- [ ] Verse Explorer Screen
- [ ] Morphology Screen
- [ ] Chat Screen
- [ ] Settings Screen

### Phase 4: Integration
- [ ] Connect to backend API
- [ ] Error handling
- [ ] Loading states

### Phase 5: Polish
- [ ] Bilingual UI
- [ ] Test RTL/LTR
- [ ] Build APK

---

## 10. Constraints

1. **30-day timeline** - Prioritize core features first
2. **API dependency** - Frontend needs backend running
3. **RTL testing** - Must test both directions
4. **Bilingual** - All UI text in Arabic + English

---

## 11. Success Criteria

- [ ] All 5 screens functional
- [ ] API integration working
- [ ] RTL layout correct
- [ ] Bilingual support complete
- [ ] APK builds successfully
- [ ] Tested on Android device/emulator
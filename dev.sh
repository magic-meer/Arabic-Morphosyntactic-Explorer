#!/bin/bash

# Arabic Morphosyntactic Explorer (A-AME) - Development Orchestrator
# Runs both backend and frontend locally.

# Text colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting A-AME Development Environment...${NC}"

# Function to kill child processes on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# 1. Setup & Start Backend
echo -e "${YELLOW}Setting up Python Backend...${NC}"
cd backend || exit

if [ ! -d ".venv" ]; then
    echo -e "${BLUE}Creating virtual environment...${NC}"
    python3 -m venv .venv
fi

echo -e "${BLUE}Activating virtual environment...${NC}"
source .venv/bin/activate

echo -e "${BLUE}Starting Backend (FastAPI) on port 8000...${NC}"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# 2. Setup & Start Frontend
echo -e "${YELLOW}Setting up Expo Frontend...${NC}"
cd frontend || exit
pnpm install --silent

echo -e "${BLUE}Starting Frontend (Expo)...${NC}"
npx expo start --clear

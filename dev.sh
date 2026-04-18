#!/bin/bash

# Arabic Morphosyntactic Explorer (A-AME) - Development Orchestrator
# This script sets up the environments and runs both frontend and backend.

# Text colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting A-AME Development Environment...${NC}"

# 1. Check for dependencies
echo -e "${YELLOW}Checking system dependencies...${NC}"

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ python3 is not installed. Please install it to continue.${NC}"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm is not installed. Please install it (npm install -g pnpm) to continue.${NC}"
    exit 1
fi

# 2. Setup Backend
echo -e "${YELLOW}Setting up Python Backend...${NC}"
cd backend || exit

if [ ! -d ".venv" ]; then
    echo -e "${BLUE}Creating virtual environment...${NC}"
    python3 -m venv .venv
fi

echo -e "${BLUE}Activating virtual environment and installing requirements...${NC}"
source .venv/bin/activate
pip install -q  -r ../requirements.txt
cd ..

# 3. Setup Frontend
echo -e "${YELLOW}Setting up Expo Frontend...${NC}"
cd frontend || exit
echo -e "${BLUE}Installing frontend dependencies...${NC}"
pnpm install --silent
cd ..

# 4. Orchestration
echo -e "${GREEN}✨ Environments ready! Starting servers...${NC}"

# Function to kill child processes on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    kill $BACKEND_PID
    exit
}

trap cleanup SIGINT SIGTERM

# Start Backend
echo -e "${BLUE}Starting Backend (FastAPI) on port 8000...${NC}"
cd backend
source .venv/bin/activate
# Run uvicorn in background
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > /dev/null 2>&1 &
BACKEND_PID=$!
cd ..

# Start Frontend
echo -e "${BLUE}Starting Frontend (Expo)...${NC}"
cd frontend
npx expo start

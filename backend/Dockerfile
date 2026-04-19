FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for typical NLP libraries (CAMeL tools may need them)
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and other files
COPY . .

# Hugging Face spaces use port 7860
EXPOSE 7860

# Specify environment variable for port
ENV PORT=7860

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]

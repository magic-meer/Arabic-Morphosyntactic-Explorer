# Use Python 3.12 (stable) as base
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app
ENV CAMELTOOLS_DATA=/app/.camel_tools

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy dataset and backend code
COPY dataset/ dataset/
COPY backend/ /app/
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

# Ensure scripts are executable and directory exists with correct permissions
RUN mkdir -p /app/.camel_tools && chmod -R 777 /app/.camel_tools
RUN chmod +x /app/docker-entrypoint.sh /app/scripts/*.sh

# Expose port (7860 for Hugging Face Spaces)
EXPOSE 7860

# Run the application using the entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]
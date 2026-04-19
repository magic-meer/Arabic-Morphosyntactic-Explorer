#!/bin/bash
set -e

# RUN CAMeL bootstrap if it exists
if [ -f "scripts/bootstrap_camel_data.sh" ]; then
    echo "Entrypoint: Running CAMeL bootstrap..."
    bash scripts/bootstrap_camel_data.sh
fi

# Run the application
echo "Entrypoint: Starting Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 7860

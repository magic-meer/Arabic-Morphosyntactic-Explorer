#!/usr/bin/env bash
set -euo pipefail

DATA_ENV="${CAMELTOOLS_DATA:-/opt/camel_tools}"
MORPH_ONLY="${CAMEL_MORPH_ONLY:-0}"

if [[ "$MORPH_ONLY" == "1" || "$MORPH_ONLY" == "true" || "$MORPH_ONLY" == "yes" ]]; then
  DATASET_TO_USE="morph"
else
  DATASET_TO_USE="light"
fi

echo "Bootstrapping CAMeL Tools data into: ${DATA_ENV}"
mkdir -p "$DATA_ENV"

if command -v camel_data >/dev/null 2>&1; then
  if [ -z "$(ls -A "$DATA_ENV" 2>/dev/null)" ]; then
    echo "Installing CAMeL data ($DATASET_TO_USE) to $DATA_ENV"
    CAMELTOOLS_DATA="$DATA_ENV" camel_data -i "$DATASET_TO_USE" || true
  else
    echo "CAMeL data already present in $DATA_ENV"
  fi
else
  echo "camel_data command not found in PATH. Ensure CAMeL Tools is installed."
fi

exit 0

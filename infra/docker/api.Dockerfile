FROM python:3.12-slim

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY apps/api/pyproject.toml apps/api/uv.lock ./
RUN pip install --no-cache-dir uv && uv sync --frozen

# Copy application
COPY apps/api/ ./

# Create storage directories
RUN mkdir -p /app/storage/{originals,extracted,previews,thumbnails,exports}

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

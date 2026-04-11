FROM python:3.12-slim

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY apps/worker/pyproject.toml apps/worker/uv.lock ./
RUN pip install --no-cache-dir uv && uv sync --frozen

# Copy application
COPY apps/worker/ ./

# Create storage directories
RUN mkdir -p /app/storage/{originals,extracted,previews,thumbnails,exports,vault}

CMD ["uv", "run", "python", "-m", "app.main"]

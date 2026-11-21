FROM python:3.11-slim

# Install system dependencies (libzbar0 for pyzbar QR decoding, curl for healthchecks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libzbar0 \
    curl \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency definition
COPY requirements.txt .

# Install python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . .

# Expose API port
EXPOSE 8000

# Run FastAPI with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

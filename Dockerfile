# ─────────────────────────────────────────────────────────────────────────────
# Multi-Stage Production Dockerfile for GoDine v2.0
# ─────────────────────────────────────────────────────────────────────────────

# Stage 1: Build React Frontend App
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

COPY frontend/ ./
RUN npm run build

# Stage 2: Production Python Backend Server + Static Single-Page App
FROM python:3.10-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir email-validator httpx==0.27.2

COPY backend/ ./app
COPY --from=frontend-builder /app/frontend/dist ./app/app/static

ENV PORT=8000
EXPOSE 8000

WORKDIR /app/app
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

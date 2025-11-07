# Use lightweight Python base image
FROM python:3.12-slim

# Set work directory
WORKDIR /app

# Copy requirements first for caching
COPY requirements.txt /app/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . /app

# Expose backend port
EXPOSE 8000

# Run FastAPI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

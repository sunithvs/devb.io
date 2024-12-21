# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN apt-get update && apt-get install -y --no-install-recommends gcc \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get remove -y gcc && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# Copy the rest of the application code
COPY . /app

# Expose the application port
ENV PORT=8000
EXPOSE $PORT

# Define environment variable for Redis
ENV REDIS_URL=redis://redis:6379/0

# Run the application
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "$PORT"]

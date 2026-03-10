# Use python as base image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy requirements and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY . .

# Open port 8000
EXPOSE 8000

# Run the app
CMD ["python", "app.py"]

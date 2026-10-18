FROM python:3.12-slim
WORKDIR /app
COPY opsforge/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt
COPY opsforge /app/opsforge
COPY lib/opsforge /app/lib/opsforge
COPY drizzle /app/drizzle
CMD ["python", "-m", "opsforge.pipeline", "--fixture", "base"]

FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
	build-essential \
	gcc \
	&& rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
COPY requirements-astro.txt ./
RUN pip install --no-cache-dir -r requirements.txt -r requirements-astro.txt

COPY app ./app
COPY .env.example ./.env.example

EXPOSE 8010

CMD ["python", "-m", "app.run"]

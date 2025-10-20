FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    apt-transport-https \
    build-essential \
    unixodbc-dev \
    gcc \
    g++ \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Install Microsoft ODBC Driver 18 for SQL Server
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
 && curl https://packages.microsoft.com/config/debian/12/prod.list > /etc/apt/sources.list.d/mssql-release.list \
 && apt-get update \
 && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install pip requirements
COPY requirements.txt ./
RUN python -m pip install --upgrade pip setuptools wheel
RUN python -m pip install -r requirements.txt

# Copy project
COPY . /app

# Collect static files
RUN python manage.py collectstatic --noinput || true

ENV PORT=8000
EXPOSE 8000

# Use gunicorn to serve the WSGI app
CMD ["gunicorn", "personal_budget_manager.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]

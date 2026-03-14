# If you want to use the standard python slim image:
# FROM python:3.13-slim

# To use the hardened image with sfw
# FROM dhi.io/python:3.13-sfw-dev

# To use the hardened image without sfw
FROM dhi.io/python:3.13-debian13-dev

# Set working directory
WORKDIR /code

# Install system dependencies including CA certificates
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    wget \
    ca-certificates \
    curl \
    gnupg2 \
    apt-transport-https \
    gzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Build argument to control certificate installation
ARG LOCAL_BUILD=true

# If you have an environment where you need to trust an Enterprise CA:
# Download and install enterprise CA certificate
# RUN if [ "$LOCAL_BUILD" = "true" ]; then \
#         mkdir -p /usr/local/share/ca-certificates && \
#         wget -q -P /usr/local/share/ca-certificates/ https://{cert_uri_here} && \
#         update-ca-certificates; \
#     fi

# Set environment variables for certificate paths
ENV REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt
ENV CURL_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt
ENV SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt
ENV SSL_CERT_DIR=/etc/ssl/certs/

ENV PYTHONPATH=/code

# Install ODBC Driver 17 for SQL Server
RUN curl -k https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > /etc/apt/trusted.gpg.d/microsoft.gpg && \
    echo "deb [arch=amd64] https://packages.microsoft.com/debian/12/prod bookworm main" | tee /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update && \
    ACCEPT_EULA=Y apt-get install -y msodbcsql17 unixodbc unixodbc-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Rebuild ld.so cache explicitly (required for VS Code Server check-requirements.sh)
RUN ldconfig || true

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install debugpy for VS Code debugging
RUN pip install --no-cache-dir debugpy

# Remove the requiremnts file, allow it to be mounted instead
RUN rm requirements.txt

# Copy application code
# COPY . .

# Expose port for FastAPI
EXPOSE 5011

# Expose port for debugpy
EXPOSE 5678

# Default command for production (no debugpy, no --reload)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5011"]
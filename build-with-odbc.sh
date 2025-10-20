#!/bin/bash
# Update package list
apt-get update

# Install ODBC driver dependencies
apt-get install -y unixodbc unixodbc-dev

# Download and install Microsoft ODBC driver
curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add -
curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list > /etc/apt/sources.list.d/mssql-release.list
apt-get update
ACCEPT_EULA=Y apt-get install -y msodbcsql17

# Install Python dependencies
pip install -r requirements.txt
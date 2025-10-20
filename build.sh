#!/bin/bash
echo "Python Version:"
/usr/local/bin/python3.12 --version
echo "Installing dependencies..."
/usr/local/bin/python3.12 -m pip install --upgrade pip
/usr/local/bin/python3.12 -m pip install -r requirements.txt
echo "Collecting static files..."
/usr/local/bin/python3.12 manage.py collectstatic --noinput --clear
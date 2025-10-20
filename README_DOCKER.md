This Dockerfile builds a container image with the Microsoft ODBC driver installed so Django can connect to Azure SQL Server.

Build locally:

```bash
docker build -t budget-master:latest .
```

Run locally (set env vars appropriately):

```bash
docker run -e SECRET_KEY=your-secret -e DB_NAME=... -e DB_USER=... -e DB_PASSWORD=... -e DB_HOST=... -p 8000:8000 budget-master:latest
```

Deploy to any container platform (Azure App Service, AWS ECS, etc.)

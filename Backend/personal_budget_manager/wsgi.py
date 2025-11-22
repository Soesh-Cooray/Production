import os
from django.core.wsgi import get_wsgi_application

if os.environ.get('VERCEL'):
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'personal_budget_manager.settings_production')
else:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'personal_budget_manager.settings')

application = get_wsgi_application()
app = application

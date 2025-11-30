# BudgetMaster - Personal Budget Manager

A full-stack personal budget management application built with Django REST Framework and React.

## 🚀 Features

- User authentication and authorization (JWT)
- Income and expense tracking
- Budget management
- Financial reports and analytics
- Email notifications and reminders
- Password reset functionality
- Mobile-responsive design

## 🏗️ Tech Stack

### Backend
- Django 4.2
- Django REST Framework
- PostgreSQL (Production) / MySQL (Development)
- JWT Authentication (Simple JWT)
- Djoser for user management
- Whitenoise for static files

### Frontend
- React.js
- React Router
- Axios for API calls
- Modern responsive UI

## 📋 Prerequisites

- Python 3.9+
- Node.js 14+
- PostgreSQL (for production) or MySQL (for development)
- Gmail account for email functionality

## 🔧 Local Development Setup

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Budget-Master-Production/Backend
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create `.env` file**
   
   Copy `.env.example` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

   Required environment variables:
   ```
   SECRET_KEY=your-django-secret-key
   DEBUG=True
   DB_NAME=personal_budget_manager
   DB_USER=budget_user
   DB_PASSWORD=your-database-password
   DB_HOST=127.0.0.1
   DB_PORT=3306
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-gmail-app-password
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   python manage.py seed_categories  # Seed default categories
   ```

6. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run development server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to Frontend directory**
   ```bash
   cd ../Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

   The app will open at [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment (Vercel)

### Backend Deployment

1. **Set Environment Variables in Vercel**
   
   Go to your Vercel project → Settings → Environment Variables and add:
   - `SECRET_KEY` - Your Django secret key
   - `EMAIL_HOST_USER` - Your Gmail address
   - `EMAIL_HOST_PASSWORD` - Your Gmail App Password
   - `DATABASE_URL` - PostgreSQL connection string (auto-set by Vercel Postgres)

2. **Deploy**
   ```bash
   vercel --prod
   ```

### Frontend Deployment

1. **Update API endpoint**
   
   Update `Frontend/src/constants.js` with your backend URL

2. **Deploy**
   ```bash
   cd Frontend
   vercel --prod
   ```

## 🔐 Security Notes

- **Never commit `.env` files** - They are gitignored for security
- **Use environment variables** for all sensitive data
- **Generate strong SECRET_KEY** for production
- **Use Gmail App Passwords** instead of your actual Gmail password
- The project uses HTTPS in production with secure cookies

## 📧 Email Setup (Gmail)

1. Go to [Google Account App Passwords](https://myaccount.google.com/apppasswords)
2. Create a new app password for "BudgetMaster"
3. Copy the generated password (remove spaces)
4. Add to your `.env` file or Vercel environment variables

## 🗂️ Project Structure

```
Budget-Master-Production/
├── Backend/
│   ├── accounts/              # User authentication app
│   ├── budget/                # Budget management app
│   ├── personal_budget_manager/  # Django project settings
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example          # Environment variables template
│   └── vercel.json           # Vercel deployment config
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── api.js           # API configuration
│   │   ├── constants.js     # App constants
│   │   └── App.js
│   ├── package.json
│   └── vercel.json
└── README.md
```

## 🛠️ Available Scripts

### Backend

```bash
python manage.py runserver          # Start development server
python manage.py makemigrations     # Create migrations
python manage.py migrate            # Apply migrations
python manage.py createsuperuser    # Create admin user
python manage.py seed_categories    # Seed default categories
python manage.py collectstatic      # Collect static files
```

### Frontend

```bash
npm start       # Start development server
npm build       # Build for production
npm test        # Run tests
```

## 🐛 Troubleshooting

### Backend Issues

**"SECRET_KEY must not be empty"**
- Make sure you've set `SECRET_KEY` in your `.env` file or Vercel environment variables

**Email not sending**
- Verify Gmail App Password is correct
- Check that 2FA is enabled on your Gmail account
- Ensure `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD` are set correctly

**Database connection errors**
- Verify database credentials in `.env`
- Ensure PostgreSQL/MySQL is running
- Check `DATABASE_URL` in production

### Frontend Issues

**API connection errors**
- Verify backend URL in `constants.js`
- Check CORS settings in Django settings
- Ensure backend is running

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. Please contact the owner for contribution guidelines.

## 📧 Support

For issues or questions, please contact the project maintainer.
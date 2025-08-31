# Worksyde - Freelancing Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg)](https://reactjs.org/)
[![Django](https://img.shields.io/badge/Django-4.0-092E20.svg)](https://www.djangoproject.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-47A248.svg)](https://www.mongodb.com/)

Worksyde is a comprehensive freelancing platform that connects businesses with skilled professionals. It provides a seamless experience for freelancers to find work and for clients to hire top talent for their projects.

## ✨ Features

### For Freelancers
- Create and manage professional profiles
- Browse and apply for jobs
- Submit proposals with custom offers
- Track project progress and milestones
- Secure payment processing
- Real-time communication with clients

### For Clients
- Post job listings with detailed requirements
- Browse freelancer profiles and portfolios
- Review proposals and hire top talent
- Manage projects and milestones
- Process secure payments
- Rate and review freelancers

### For Admins
- User management and moderation
- Content approval system
- Analytics and reporting
- Dispute resolution
- Platform configuration

## 🚀 Tech Stack

### Frontend
- **Framework**: React.js
- **State Management**: Redux
- **Routing**: React Router
- **UI Components**: Material-UI, Styled Components
- **Form Handling**: Formik with Yup validation
- **HTTP Client**: Axios
- **Real-time**: WebSocket

### Backend
- **Framework**: Django REST Framework
- **Database**: MongoDB with MongoEngine
- **Authentication**: JWT, OAuth 2.0
- **Real-time**: Django Channels
- **Task Queue**: Celery with Redis
- **API Documentation**: Swagger/OpenAPI

### DevOps
- **Containerization**: Docker
- **Web Server**: Nginx
- **WSGI Server**: Gunicorn
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry, Prometheus, Grafana

## 🛠️ Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB 4.4+
- Redis
- Git

## 🚀 Installation

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/AnshuHemal/Worksyde---A-Freelancing-Platform.git
   cd worksyde/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Deployment

### Using Docker (Recommended)

1. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

2. Run migrations:
   ```bash
   docker-compose exec web python manage.py migrate
   ```

3. Create a superuser:
   ```bash
   docker-compose exec web python manage.py createsuperuser
   ```

## 🔧 Environment Variables

### Backend (.env)
```
DEBUG=True
SECRET_KEY=your-secret-key
MONGODB_URI=mongodb://localhost:27017/worksyde
JWT_SECRET_KEY=your-jwt-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-email-password
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000/ws
```

## 📚 API Documentation

API documentation is available at `/api/docs/` when the development server is running.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- [Hemal Katariya](https://github.com/AnshuHemal)
- [Pal Trivedi](https://github.com/PalTrivedi)
- [Janvi Kanani](https://github.com/Janvi5647)
- [Manthan Gohel](https://github.com/manthangohel12)
- [Rajveer Rajpurohit](https://github.com/Rajveer290704)


## 🙏 Acknowledgments

- [Django](https://www.djangoproject.com/)
- [React](https://reactjs.org/)
- [MongoDB](https://www.mongodb.com/)
- And all the amazing open-source libraries used in this project

---

<div align="center">
  Made with ❤️ by the Worksyde Team
</div>

# 🩹 SmartWound - AI-Assisted Wound Care Companion

## 📋 Table of Contents
- [Overview](#overview)
- [✅ Currently Implemented Features](#-currently-implemented-features)
- [❌ Not Yet Implemented](#-not-yet-implemented)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📱 Features Overview](#-features-overview)
- [🔐 Authentication & Security](#-authentication--security)
- [🏥 Medical Safety Features](#-medical-safety-features)
- [🎯 Project Goals](#-project-goals)
- [📊 Development Status](#-development-status)

## Overview

**SmartWound** is an AI-assisted wound care companion app designed to help users track, monitor, and manage wound healing with professional medical oversight. The application combines AI vision analysis, community support, and medical professional moderation to provide comprehensive wound care assistance.

> ⚠️ **Important Medical Disclaimer**: This application is NOT a diagnostic tool and does not replace professional medical advice. Always consult healthcare professionals for serious wounds or medical concerns.

## ✅ Currently Implemented Features

### 🔐 User Authentication System
- ✅ User registration and login
- ✅ JWT-based authentication with httpOnly cookies
- ✅ Role-based access control (User/Admin)
- ✅ Secure password hashing
- ✅ Session management

### 🩹 Wound Tracking & Management
- ✅ **Wound Creation & Upload**: Users can create wound records with photos
- ✅ **AI Vision Analysis**: 
  - Groq Vision (Meta LLaMA) integration for wound analysis
  - Google Vision API support
  - Structured JSON analysis + plain English summaries
  - Confidence scoring and wound type classification
- ✅ **Wound Detail Pages**: Individual wound tracking with photo history
- ✅ **Wound Status Tracking**: Healing progress monitoring
- ✅ **Photo Timeline**: Historical photo comparison for healing progress

### 🏥 Medical Professional Features
- ✅ **Admin Dashboard**: Complete moderation interface for medical staff
- ✅ **Wound Flagging System**: Medical professionals can flag concerning wounds
- ✅ **Admin Comments**: Medical team can add professional guidance to flagged wounds
- ✅ **Moderation Queue**: Organized interface for reviewing flagged content
- ✅ **User Notifications**: Flagged wound alerts and medical guidance display

### 💬 Community Forum System
- ✅ **Forum Posts**: Users can create posts by wound type
- ✅ **Comments & Discussions**: Threaded comment system
- ✅ **Search & Filter**: Search posts and filter by wound type
- ✅ **Moderation Tools**: Admin can flag/delete inappropriate content
- ✅ **Wound Type Categories**: Cut, Burn, Scrape, Bruise, Puncture, Surgical, Diabetic, Pressure, Other

### 📊 User Dashboard
- ✅ **Wound Overview**: Visual cards showing all user wounds
- ✅ **Flagged Wound Alerts**: Prominent notifications for medical attention
- ✅ **Quick Actions**: Easy access to create wounds, forum, and AI analysis
- ✅ **Status Indicators**: Visual wound status and healing progress
- ✅ **Admin Comments Display**: Medical team guidance prominently shown

### 🤖 AI Integration
- ✅ **Multiple AI Providers**: Groq Vision, Google Vision, ChatGPT support
- ✅ **Smart Analysis**: Wound type detection, severity assessment
- ✅ **Medical Prompting**: Specialized prompts for wound analysis
- ✅ **Fallback Systems**: Graceful handling of API failures
- ✅ **Analysis History**: Stored AI analysis results

### 🔧 Backend Infrastructure
- ✅ **PostgreSQL Database**: User data, wounds, forum posts, admin comments (Neon DB)
- ✅ **RESTful API**: Complete CRUD operations for all features
- ✅ **File Upload**: Image handling with Cloudinary integration + local backup
- ✅ **Email System**: SMTP integration for notifications and support
- ✅ **Error Handling**: Comprehensive error management
- ✅ **CORS Configuration**: Secure cross-origin requests
- ✅ **Input Validation**: Data sanitization and validation

### 🎨 Frontend (Next.js)
- ✅ **Responsive Design**: Mobile-first approach with Tailwind CSS
- ✅ **Modern UI/UX**: Clean, medical-appropriate interface
- ✅ **Real-time Updates**: Dynamic content updates
- ✅ **Loading States**: Proper loading indicators
- ✅ **Error Boundaries**: Graceful error handling
- ✅ **Navigation**: Intuitive routing and breadcrumbs

## ❌ Not Yet Implemented

### 🔔 Notification System
- ❌ Push notifications for wound check reminders
- ❌ Email notifications for flagged wounds
- ❌ SMS alerts for urgent medical attention
- ❌ Healing milestone notifications

### 📅 Reminder & Scheduling
- ❌ Smart wound care reminders (cleaning, dressing changes)
- ❌ Follow-up appointment scheduling
- ❌ Medication reminders
- ❌ Progress check-in prompts

### 🗺️ Healthcare Provider Integration
- ❌ Google Maps clinic/doctor finder
- ❌ Telemedicine appointment booking
- ❌ Healthcare provider directory
- ❌ Insurance integration

### 📊 Advanced Analytics
- ❌ Healing progress charts and graphs
- ❌ Wound healing statistics
- ❌ Comparative healing analysis
- ❌ Predictive healing timelines

### 🤖 Advanced AI Features
- ❌ Custom trained wound classification models
- ❌ Automated severity escalation triggers
- ❌ AI-powered healing predictions
- ❌ Personalized care recommendations

### 💰 Monetization Features
- ❌ Premium subscription tiers
- ❌ Telehealth consultation booking
- ❌ Wound care supply ordering
- ❌ B2B clinic dashboard licensing

### 📱 Mobile App
- ❌ Native iOS/Android applications
- ❌ Offline functionality
- ❌ Camera integration optimization
- ❌ Push notification support

### 🔒 Advanced Security
- ❌ Two-factor authentication
- ❌ HIPAA compliance features
- ❌ Advanced audit logging
- ❌ Data encryption at rest

### 🌐 Internationalization
- ❌ Multi-language support
- ❌ Localized medical guidance
- ❌ Regional healthcare integration
- ❌ Cultural wound care practices

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Tailwind
- **State Management**: React hooks and context
- **HTTP Client**: Fetch API

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT with httpOnly cookies
- **File Upload**: Multer middleware
- **Validation**: Custom validation middleware

### AI & External APIs
- **Vision AI**: Groq Vision (Meta LLaMA), Google Vision API, OpenAI GPT-4
- **Language Models**: Support for multiple providers (Groq, OpenAI)
- **Image Storage**: Cloudinary cloud storage + local backup
- **Email Service**: SMTP (Gmail) for notifications and support

### Development Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Development**: Hot reload, TypeScript support

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database (or Neon DB for cloud)
- API keys for AI services:
  - Groq API key for vision analysis
  - OpenAI API key for GPT-4
  - Google Vision API key (optional)
- Cloudinary account for image storage
- Gmail account with app password for email notifications

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SmartWound
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your database and API credentials
   
   # Start the backend server
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Start the development server
   npm run dev
   ```

4. **Database Setup**
   - Create PostgreSQL database (local) or use Neon DB (cloud)
   - Update DATABASE_URL in .env with your connection string
   - Run migration scripts in `backend/scripts/`
   - Tables: users, wounds, forum_posts, forum_comments, wound_comments

### Environment Variables

**Backend (.env)**
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
JWT_SECRET=your_jwt_secret_key

# AI Service APIs
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
GOOGLE_VISION_API_KEY=your_google_vision_api_key

# Cloudinary Image Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD="your_app_password"
MAIL_FROM=your_email@gmail.com
EMAIL_FROM="App Name <your_email@gmail.com>"
SUPPORT_EMAIL=support@yourdomain.com

# Frontend URLs
FRONTEND_URL=http://localhost:3000
FRONTEND_LAN_URL=http://192.168.x.x:3000
```

## 📱 Features Overview

### For Users
1. **Wound Tracking**: Upload photos and track healing progress
2. **AI Analysis**: Get instant wound type classification and guidance
3. **Community Support**: Connect with others through the forum
4. **Medical Guidance**: Receive professional feedback on flagged wounds
5. **Progress Monitoring**: Visual tracking of wound healing

### For Medical Professionals
1. **Moderation Dashboard**: Review and flag concerning wounds
2. **Admin Comments**: Provide professional guidance to users
3. **Content Moderation**: Manage forum posts and comments
4. **User Oversight**: Monitor wound healing progress

## 🔐 Authentication & Security

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: User and Admin role separation
- **Input Validation**: Comprehensive data validation
- **CORS Protection**: Configured for secure cross-origin requests
- **Password Security**: Bcrypt hashing for passwords

## 🏥 Medical Safety Features

- **Medical Disclaimers**: Clear warnings about app limitations
- **Professional Oversight**: Admin flagging and comment system
- **No Diagnosis Claims**: App explicitly avoids medical diagnosis
- **Escalation Prompts**: Encourages professional medical consultation
- **Content Moderation**: Medical professionals review concerning content

## 🎯 Project Goals

**What SmartWound IS:**
- A wound tracking and monitoring companion
- An AI-assisted guidance tool
- A community support platform
- A bridge to professional medical care

**What SmartWound is NOT:**
- A diagnostic medical device
- A replacement for professional healthcare
- A treatment recommendation system
- A medical emergency response tool

## 📊 Development Status

### ✅ Completed (Phase 1-2)
- Core wound tracking functionality
- AI vision integration
- User authentication system
- Admin moderation tools
- Community forum
- Basic wound management

### 🚧 In Progress (Phase 3)
- Advanced analytics and reporting
- Enhanced AI features
- Mobile optimization
- Performance improvements

### 📋 Planned (Phase 4-5)
- Healthcare provider integration
- Advanced notification system
- Mobile applications
- Monetization features
- HIPAA compliance

---

**⚠️ Medical Disclaimer**: This application is for informational purposes only and does not constitute medical advice. Always consult qualified healthcare professionals for wound care and medical concerns. In case of emergency, contact emergency services immediately.

**📞 Support**: For technical issues or questions, please contact the development team or create an issue in the repository.





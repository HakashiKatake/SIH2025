# 🌾 KhetiVeti - Smart Farming Ecosystem

## Project Overview

**KhetiVeti** is a comprehensive digital farming platform designed to empower farmers with modern technology solutions. Built as a submission for **Smart India Hackathon (SIH) 2025** under the **Mindspace Hackathon** track, this application bridges the gap between traditional farming practices and cutting-edge agricultural technology.

Demo:

https://github.com/user-attachments/assets/878a75cc-564e-4109-920a-fa5676fc42d4


Figma link: 
https://www.figma.com/design/7e46GLDr9m3f7WL5879jlS/KhetiVeti?node-id=0-1&t=vOs4eclH1j0lNTz4-1

### 🏆 Hackathon Details
- **Event**: Smart India Hackathon (SIH) 2025
- **Hackathon**: Mindspace Hackathon
- **Team**: StrawHats
- **Project Name**: KhetiVeti

## 👥 Team Members

| Name | Role | GitHub |
|------|------|--------|
| **Saurabh Yadav** | Full Stack Developer & Team Lead | - |
| **Ayush Jha** | Frontend Developer | - |
| **Prince Vavya** | AI Engineer | - |
| **Naaz Ahmedi** | UI/UX Designer | - |
| **Sakshi Shingole** | UI/UX | - |
| **Pari Gothi** | UI/UX & Business Model | - |

## 🚀 Features

### 🔐 Authentication & User Management
- **Multi-role Authentication**: Farmers, Dealers, Government Officials
- **Secure JWT-based Authentication**
- **Profile Management with Role-based Access**

### 🌾 Crop Management
- **AI-Powered Crop Analysis** using Computer Vision
- **Crop Health Monitoring** with Disease Detection
- **MRL (Maximum Residue Limit) Calculator**
- **Precision Resource Optimizer** with AI recommendations
- **Field Management Tools** with Calendar Integration

### 🛒 Marketplace
- **Farmer-to-Consumer Direct Sales**
- **Dealer Network Integration**
- **Order Management System**
- **Real-time Inventory Tracking**

### 🌤️ Weather Integration
- **Real-time Weather Data** from OpenWeather API
- **Weather-based Farming Recommendations**
- **Climate Pattern Analysis**
- **Alert System for Extreme Weather**

### 🏛️ Government Schemes
- **Scheme Discovery & Eligibility Checker**
- **Application Process Simplification**
- **Progress Tracking**
- **Policy Updates & Notifications**

### 💬 Community Features
- **Farmer Community Forum**
- **Expert Consultation Chat**
- **Knowledge Sharing Platform**
- **Multi-language Support** (Hindi, English, Regional Languages)

### 🗺️ Farmer's Roadmap
- **Crop Planning Assistant**
- **Season-wise Recommendations**
- **Market Price Predictions**
- **Resource Optimization**

## 🏗️ Architecture

### Backend (Node.js + Express)
```
📁 src/
├── 📁 controllers/     # API Controllers
├── 📁 models/         # MongoDB Models
├── 📁 routes/         # API Routes
├── 📁 middleware/     # Authentication & Validation
├── 📁 services/       # Business Logic
├── 📁 utils/          # Helper Functions
└── 📄 index.ts        # Entry Point
```

### Frontend (React Native + Expo)
```
📁 farmer-mobile-app/
├── 📁 app/            # Expo Router Pages
├── 📁 components/     # Reusable Components
├── 📁 src/
│   ├── 📁 store/      # Zustand State Management
│   ├── 📁 services/   # API Services
│   ├── 📁 types/      # TypeScript Types
│   └── 📁 utils/      # Helper Functions
├── 📁 assets/         # Images & Fonts
└── 📁 constants/      # App Constants
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Cloudinary
- **API Documentation**: RESTful APIs
- **Language**: TypeScript

### Frontend (Mobile App)
- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **UI Components**: Custom Design System
- **Internationalization**: i18next
- **Language**: TypeScript

### External APIs & Services
- **Weather Data**: OpenWeather API
- **Image Storage**: Cloudinary
- **Maps**: Expo Location Services
- **Notifications**: Expo Notifications

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally or connection string
- Redis server running
- Expo CLI installed globally
- Android Studio (for Android development)
- Xcode (for iOS development - macOS only)

### 🔧 Backend Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd kisaan
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/farmer-app
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_EXPIRES_IN=7d
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Weather API Configuration
   WEATHER_API_KEY=your-openweather-api-key
   WEATHER_API_URL=https://api.openweathermap.org/data/2.5
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   The backend server will be running at `http://localhost:3000`

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

### 📱 Frontend Setup

1. **Navigate to Mobile App Directory**
   ```bash
   cd farmer-mobile-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Expo Development Server**
   ```bash
   npm start
   ```

4. **Run on Device/Simulator**
   ```bash
   # For Android
   npm run android
   
   # For iOS (macOS only)
   npm run ios
   
   # For Web
   npm run web
   ```

### 🔄 Database Setup

1. **Start MongoDB**
   ```bash
   # Using MongoDB Community Edition
   mongod
   
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **Start Redis**
   ```bash
   # Using Redis directly
   redis-server
   
   # Using Docker
   docker run -d -p 6379:6379 --name redis redis:latest
   ```

## 📋 Available Scripts

### Backend Scripts
```bash
npm run dev          # Start development server with nodemon
npm run build        # Build TypeScript to JavaScript
npm start           # Start production server
npm run test-db     # Test database connection
npm run test-auth   # Test authentication endpoints
npm run test-crops  # Test crop analysis features
```

### Frontend Scripts
```bash
npm start           # Start Expo development server
npm run android     # Run on Android device/emulator
npm run ios         # Run on iOS device/simulator
npm run web         # Run on web browser
npm run lint        # Run ESLint
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Crop Management
- `POST /api/crops/analyze` - Analyze crop image
- `GET /api/crops/recommendations` - Get crop recommendations
- `POST /api/crops/mrl-calculate` - Calculate MRL values
- `GET /api/crops/calendar` - Get farming calendar

### Marketplace
- `GET /api/marketplace/products` - Get marketplace products
- `POST /api/marketplace/products` - Add new product
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders

### Weather
- `GET /api/weather/current` - Get current weather
- `GET /api/weather/forecast` - Get weather forecast
- `GET /api/weather/alerts` - Get weather alerts

### Government Schemes
- `GET /api/schemes` - Get available schemes
- `POST /api/schemes/check-eligibility` - Check scheme eligibility
- `POST /api/schemes/apply` - Apply for scheme

## 📱 Mobile App Features

### User Roles
1. **Farmer Dashboard**
   - Crop management tools
   - Weather information
   - Marketplace access
   - Government schemes
   - Community chat

2. **Dealer Dashboard**
   - Inventory management
   - Order processing
   - Farmer network
   - Analytics

3. **Government Official Dashboard**
   - Scheme management
   - Application review
   - Analytics and reports

### Key Screens
- **Authentication Flow**: Login, Register, Role Selection
- **Dashboard**: Role-specific home screens
- **Crop Scanner**: AI-powered crop analysis
- **Weather**: Real-time weather and forecasts
- **Marketplace**: Product listing and ordering
- **Chat**: Community and expert consultation
- **Profile**: User profile management

## 🌐 Internationalization

The app supports multiple languages:
- **English** (Default)
- **Hindi** (हिंदी)
- **Regional Languages** (Configurable)

Translation files are located in `farmer-mobile-app/src/locales/`

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Role-based Access Control** (RBAC)
- **Input Validation** using express-validator
- **Password Hashing** with bcryptjs
- **CORS Protection**
- **Rate Limiting** for API endpoints
- **Secure File Upload** with Cloudinary

## 📊 Performance Optimizations

- **Redis Caching** for frequently accessed data
- **Image Optimization** with Cloudinary
- **Database Indexing** for faster queries
- **Lazy Loading** in mobile app
- **State Management** with Zustand
- **Memory Management** with proper cleanup

## 🧪 Testing

### Backend Testing
```bash
npm run test-db      # Test database connectivity
npm run test-auth    # Test authentication flow
npm run test-crops   # Test crop analysis
npm run test-weather # Test weather integration
```

### Frontend Testing
The mobile app includes validation scripts for different features:
- Authentication integration tests
- Marketplace functionality tests
- Chat system tests
- Weather integration tests

## 🚀 Deployment

### Backend Deployment
1. **Environment Variables**: Set up production environment variables
2. **Database**: Configure production MongoDB instance
3. **Redis**: Set up production Redis instance
4. **Cloudinary**: Configure production Cloudinary account
5. **Deploy**: Use platforms like Heroku, AWS, or DigitalOcean

### Mobile App Deployment
1. **Build APK/IPA**: Use EAS Build
2. **App Store**: Deploy to Google Play Store / Apple App Store
3. **Over-the-Air Updates**: Use Expo Updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Smart India Hackathon 2025** for the opportunity
- **Mindspace** for hosting the hackathon
- **OpenWeather API** for weather data
- **Cloudinary** for image management
- **Expo** for React Native development tools
- **MongoDB** for database solutions

## 📞 Contact & Support

For any queries regarding this project:

- **Team Lead**: Saurabh Yadav
- **Email**: [Contact Email]
- **Project Repository**: [GitHub Repository URL]

---

**Made with ❤️ by Team StrawHats for Smart India Hackathon 2025**

*Empowering farmers with technology, one field at a time.* 🌾

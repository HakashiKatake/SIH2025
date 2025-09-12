# Farmer Mobile App

A React Native mobile application built with Expo for testing the Farmer Backend API. This app provides a mobile interface for farmers to access AI-powered agricultural services.

## Features

- **Authentication**: User registration and login
- **Dashboard**: Overview of farm details and available features
- **Feature Preview**: Placeholder screens for upcoming functionality
- **API Integration**: Ready to connect with the backend API

## Tech Stack

- **React Native** with **Expo Router**
- **TypeScript** for type safety
- **Tailwind CSS** with **NativeWind** for styling
- **Zustand** for state management
- **React Navigation** for navigation
- **AsyncStorage** for local data persistence

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- Backend API server running on `http://localhost:3000`

### Installation

1. Navigate to the mobile app directory:
   ```bash
   cd farmer-mobile-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run web    # For web browser
   npm run android # For Android
   npm run ios     # For iOS
   ```

## Project Structure

```
farmer-mobile-app/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Dashboard screen
│   │   └── features.tsx   # Features overview
│   ├── login.tsx          # Login screen
│   ├── register.tsx       # Registration screen
│   └── _layout.tsx        # Root layout
├── src/
│   ├── store/             # Zustand stores
│   │   └── authStore.ts   # Authentication state
│   └── types/             # TypeScript types
│       └── index.ts       # Type definitions
├── global.css             # Tailwind CSS styles
└── tailwind.config.js     # Tailwind configuration
```

## API Integration

The app is configured to connect to the backend API at `http://localhost:3000/api`. Make sure the backend server is running for full functionality.

### Authentication Flow

1. User registers/logs in through the mobile app
2. JWT token is stored in AsyncStorage
3. Token is used for authenticated API requests
4. User session persists across app restarts

## Development Status

- ✅ **Task 14**: Basic app structure and authentication
- 🚧 **Task 15**: Crop analysis interface (Next)
- ⏳ **Task 16**: Weather and chatbot interfaces
- ⏳ **Task 17**: Marketplace and roadmap interfaces
- ⏳ **Task 18**: Full API integration

## Testing

Run the test script to verify the app structure:

```bash
node test-app.js
```

## Contributing

This app is part of the Farmer Mobile App Backend project. See the main project README for contribution guidelines.
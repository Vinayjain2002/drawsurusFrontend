# 🔐 API Integration Guide for Drawsurus Authentication

This guide explains how to integrate your backend API with the authentication system.

## 📋 Overview

The authentication system is designed to work with a RESTful API that follows these patterns:
- **Base URL**: `http://localhost:3001/api` (configurable)
- **Authentication**: JWT Bearer tokens
- **Response Format**: Consistent JSON structure with `success`, `data`, and `message` fields

## 🚀 Quick Start

### 1. Environment Configuration

Create a `.env.local` file in your project root:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Backend Configuration (for your backend server)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3001
```

### 2. Backend API Endpoints

Your backend should implement these endpoints:

#### Authentication Endpoints

**POST `/api/auth/signup`**
```json
// Request
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "123456789",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User created successfully"
}
```

**POST `/api/auth/login`**
```json
// Request
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "123456789",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

**POST `/api/auth/logout`**
```json
// Headers: Authorization: Bearer <token>
// Response
{
  "success": true,
  "message": "Logged out successfully"
}
```

**GET `/api/auth/me`**
```json
// Headers: Authorization: Bearer <token>
// Response
{
  "success": true,
  "data": {
    "id": "123456789",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**POST `/api/auth/refresh`**
```json
// Headers: Authorization: Bearer <token>
// Response
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Token refreshed successfully"
}
```

#### Game Endpoints

**POST `/api/games/create`**
```json
// Headers: Authorization: Bearer <token>
// Request
{
  "settings": {
    "rounds": 3,
    "timePerRound": 60,
    "maxPlayers": 8,
    "difficulty": "medium",
    "category": "all"
  }
}

// Response
{
  "success": true,
  "data": {
    "id": "game123",
    "hostId": "123456789",
    "settings": { ... },
    "players": ["123456789"],
    "status": "waiting",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Game created successfully"
}
```

**POST `/api/games/:gameId/join`**
```json
// Headers: Authorization: Bearer <token>
// Response
{
  "success": true,
  "data": {
    "gameId": "game123",
    "playerId": "123456789"
  },
  "message": "Joined game successfully"
}
```

**GET `/api/games/:gameId`**
```json
// Headers: Authorization: Bearer <token>
// Response
{
  "success": true,
  "data": {
    "id": "game123",
    "status": "active",
    "players": [...],
    "currentRound": 1,
    "currentWord": "ELEPHANT",
    "timeLeft": 45
  }
}
```

## 🔧 Implementation Details

### Frontend API Service (`lib/api.ts`)

The API service handles:
- **Token Management**: Automatically stores/retrieves JWT tokens
- **Request Headers**: Adds Authorization headers for authenticated requests
- **Error Handling**: Consistent error handling across all API calls
- **Response Parsing**: Standardized response format

### Authentication Context (`contexts/auth-context.tsx`)

The auth context provides:
- **Global State**: User authentication state across the app
- **API Integration**: Seamless integration with backend API
- **Session Persistence**: Automatic token restoration on app load
- **Error Handling**: Proper error handling for auth failures

### Usage in Components

**Login Page:**
```typescript
const { login } = useAuth()

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  try {
    await login({ email, password })
    // Success - user is automatically logged in
    router.push('/')
  } catch (error) {
    // Handle error
    toast({ title: 'Login Failed', description: error.message })
  }
}
```

**Signup Page:**
```typescript
const { signup } = useAuth()

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  try {
    await signup({ name, email, password })
    // Success - user is automatically logged in
    router.push('/')
  } catch (error) {
    // Handle error
    toast({ title: 'Signup Failed', description: error.message })
  }
}
```

## 🛡️ Security Features

### JWT Token Management
- **Automatic Storage**: Tokens are stored in localStorage
- **Token Refresh**: Automatic token refresh when needed
- **Secure Headers**: All authenticated requests include Bearer tokens
- **Token Cleanup**: Tokens are cleared on logout

### Password Security
- **Client-side Validation**: Strong password requirements
- **Server-side Hashing**: Passwords are hashed using bcrypt
- **Secure Transmission**: All requests use HTTPS (in production)

### Error Handling
- **User-friendly Messages**: Clear error messages for users
- **Security**: No sensitive information in error messages
- **Logging**: Server-side error logging for debugging

## 🚀 Deployment

### Frontend (Next.js)
1. Set environment variables:
   ```env
   NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
   ```

2. Build and deploy:
   ```bash
   npm run build
   npm start
   ```

### Backend (Node.js/Express)
1. Set environment variables:
   ```env
   JWT_SECRET=your-production-secret-key
   PORT=3001
   DATABASE_URL=your-production-database-url
   ```

2. Install dependencies and start:
   ```bash
   npm install
   node server.js
   ```

## 🔍 Testing

### API Testing with curl

**Signup:**
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Password123!"}'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'
```

**Get Current User:**
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your backend has CORS configured
2. **Token Issues**: Check JWT_SECRET is set correctly
3. **API URL**: Verify NEXT_PUBLIC_API_URL is correct
4. **Network Errors**: Check if backend server is running

### Debug Mode

Enable debug logging in the API service:
```typescript
// In lib/api.ts, add console.log statements
private async request<T>(endpoint: string, options: RequestInit = {}) {
  console.log('API Request:', endpoint, options)
  // ... rest of the method
}
```

## 📚 Additional Resources

- [JWT.io](https://jwt.io/) - JWT token debugging
- [bcrypt.js](https://github.com/dcodeIO/bcrypt.js) - Password hashing
- [Express.js](https://expressjs.com/) - Backend framework
- [Next.js](https://nextjs.org/) - Frontend framework

This integration provides a robust, secure authentication system that can scale with your application needs! 
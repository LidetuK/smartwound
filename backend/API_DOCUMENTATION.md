# Smart Wound Backend - API Documentation

This document provides a complete reference for the Smart Wound backend API.

**Base URL**: `http://localhost:3001` (for local development)

---

## Authentication

All protected routes require a `Bearer Token` in the `Authorization` header.

`Authorization: Bearer <your_jwt_token>`

---

### 1. Authentication (`/api/auth`)

#### **`POST /api/auth/register`**
- **Description**: Registers a new user.
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe",
    "role": "user" // optional, defaults to 'user'
  }
  ```
- **Success Response** (201):
  ```json
  {
    "id": "uuid-goes-here",
    "email": "user@example.com"
  }
  ```
- **Error Response** (400):
  ```json
  {
    "errors": [
      { "msg": "Password must be at least 8 characters long." }
    ]
  }
  ```

#### **`POST /api/auth/login`**
- **Description**: Logs in a user and returns a JWT.
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Success Response** (200):
  ```json
  {
    "token": "jwt_token_string"
  }
  ```

---

### 2. User Profile (`/api/users`)

#### **`GET /api/users/me`**
- **Description**: Gets the profile of the currently logged-in user.
- **Authentication**: Required
- **Success Response** (200): Returns the full user object (without the password hash).

---

### 3. Image Upload (`/api/upload`)

#### **`POST /api/upload`**
- **Description**: Uploads a single image file.
- **Authentication**: Required
- **Request Body**: `multipart/form-data` with a single field `image`.
- **Success Response** (200):
  ```json
  {
    "message": "File uploaded successfully",
    "url": "https://res.cloudinary.com/..."
  }
  ```

---

### 4. Image Analysis (`/api/vision`)

#### **`POST /api/vision/analyze`**
- **Description**: Analyzes an image from a URL and returns wound type classification.
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "imageUrl": "https://path.to/your/image.jpg"
  }
  ```
- **Success Response** (200):
  ```json
  {
    "type": "scrape",
    "severity": "minor",
    "confidence": 0.92,
    "raw_labels": ["Abrasion", "Skin"]
  }
  ```

---

### 5. Wound Management (`/api/wounds`)

#### **`POST /api/wounds`**
- **Description**: Creates a new wound record for the logged-in user.
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "type": "scrape",
    "severity": "minor",
    "image_url": "https://path.to/your/image.jpg",
    "status": "open"
  }
  ```
- **Success Response** (201): Returns the created wound object.

#### **`GET /api/wounds`**
- **Description**: Gets all wounds for the logged-in user.
- **Authentication**: Required
- **Success Response** (200): Returns an array of wound objects.

#### **`POST /api/wounds/:woundId/logs`**
- **Description**: Adds a new log (photo and notes) to a specific wound.
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "photo_url": "https://path.to/your/image.jpg",
    "notes": "Looks like it's healing well."
  }
  ```
- **Success Response** (201): Returns the created wound log object.

---

### 6. Chatbot (`/api/chatbot`)

#### **`POST /api/chatbot`**
- **Description**: Sends a message to the AI chatbot.
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "message": "What should I do for a small scrape?",
    "history": [] // Optional: array of previous messages
  }
  ```
- **Success Response** (200):
  ```json
  {
    "reply": "For a small scrape, you should... This is not a medical diagnosis..."
  }
  ```

---

### 7. Community Forum (`/api/forum`)

#### **`GET /api/forum/posts`**
- **Description**: Gets all forum posts. Can be filtered by `wound_type`.
- **Authentication**: None
- **Success Response** (200): Returns an array of post objects.

#### **`POST /api/forum/posts`**
- **Description**: Creates a new forum post.
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "content": "Does anyone have experience with hydrocolloid bandages?",
    "wound_type": "blister"
  }
  ```
- **Success Response** (201): Returns the created post object.

---

### 8. Admin Dashboard (`/api/admin`)

All admin routes require `role: 'admin'`.

#### **`GET /api/admin/stats`**
- **Description**: Gets system-wide statistics.
- **Authentication**: Required (Admin)
- **Success Response** (200): Returns a JSON object with user, wound, clinic, and forum counts.

#### **`GET /api/admin/moderation/queue`**
- **Description**: Gets a list of all flagged posts and comments for review.
- **Authentication**: Required (Admin)
- **Success Response** (200): Returns an object with `posts` and `comments` arrays. 
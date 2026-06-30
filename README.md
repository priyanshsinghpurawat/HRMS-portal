# 🚀 Job Portal Platform (Frontend + Backend)

A scalable full-stack Job Portal and HRMS application built using React (Vite), Node.js, Express.js, MongoDB, and Cloudinary.

This backend provides authentication, profile management, profile image upload, and resume upload APIs.

---

# 📦 Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer
- Cloudinary

---

# 📁 Project Setup

## 1️⃣ Clone Repository

```bash
git clone <your-repository-url>
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Create Environment Variables

Create a `.env` file in the root directory.

```env
PORT=3000

MONGODB_URI=your_mongodb_uri

JWT_SECRET_KEY=your_jwt_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_jwt_refresh_secret
REFRESH_TOKEN_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 4️⃣ Start Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

---

## 5️⃣ Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```
2. Install frontend dependencies:
```bash
npm install
```
3. Create a `.env` file in the `client` directory. **Crucial:** Ensure the API URL includes `/api/v1`:
```env
VITE_API_URL=http://localhost:3000/api/v1
```
4. Start the frontend development server:
```bash
npm run dev
```

---

## 🚀 Recent Updates & Fixes
* **Global 404 Resolution**: Missing frontend routes (footer marketing links, unfinished dashboards) are now dynamically captured and mapped to a beautifully designed `ComingSoon` component instead of throwing unhandled 404 errors.
* **HRMS Auth Connectivity**: Re-aligned frontend `HrmApi` calls with the backend by globally enforcing the `/api/v1` prefix via Vite environment variables.
* **Employee Dashboard Fixes**: Corrected spelling and broken router links (`/employee/attendance`, `LeaveApplyEm`).
* **Enhanced Footer Navigation**: Re-built footer aesthetics with standardized, modern links pointing to valid UI fallbacks.

---

# 🌐 Base URL

```bash
http://localhost:3000/api/v1
```

---

# 🔐 Authentication APIs

---

## 1️⃣ Register User

### Endpoint

```http
POST /auth/register
```

### Full URL

```bash
http://localhost:3000/api/v1/auth/register
```

### Description

Creates a new user account.

### Request Body

```json
{
  "name": "Harsh",
  "email": "harsh@gmail.com",
  "password": "Asdf@1234",
  "phone": "+911234567890",
  "title": "Full Stack Developer"
}
```

---

## 2️⃣ Login User

### Endpoint

```http
POST /auth/login
```

### Full URL

```bash
http://localhost:3000/api/v1/auth/login
```

### Description

Authenticates user and returns access token.

### Request Body

```json
{
  "email": "harsh@gmail.com",
  "password": "Asdf@1234"
}
```

---

# 👤 Profile APIs

> ⚠️ All profile routes require Authorization Token.

### Authorization Header

```bash
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 3️⃣ Get User Profile

### Endpoint

```http
GET /profile
```

### Full URL

```bash
http://localhost:3000/api/v1/profile
```

### Description

Fetch logged-in user profile details.

---

## 4️⃣ Complete Profile

### Endpoint

```http
PUT /profile
```

### Full URL

```bash
http://localhost:3000/api/v1/profile
```

### Description

Update user profile details.

### Example Request Body

```json
{
  "bio": "MERN Stack Developer",
  "skills": ["Node.js", "MongoDB", "React"],
  "education": [
    {
      "college": "JECRC University",
      "degree": "MCA"
    }
  ]
}
```

---

## 5️⃣ Upload Profile Image

### Endpoint

```http
PUT /profile/image
```

### Full URL

```bash
http://localhost:3000/api/v1/profile/image
```

### Description

Uploads user profile image to Cloudinary.

### Form Data

```bash
profileImage : image file
```

---

## 6️⃣ Delete Profile Image

### Endpoint

```http
DELETE /profile/image
```

### Full URL

```bash
http://localhost:3000/api/v1/profile/image
```

### Description

Deletes profile image from database and Cloudinary.

---

## 7️⃣ Upload Resume

### Endpoint

```http
PUT /profile/resume
```

### Full URL

```bash
http://localhost:3000/api/v1/profile/resume
```

### Description

Uploads user resume to Cloudinary.

### Form Data

```bash
resume : pdf/doc/docx file
```

---

## 8️⃣ Delete Resume

### Endpoint

```http
DELETE /profile/resume
```

### Full URL

```bash
http://localhost:3000/api/v1/profile/resume
```

### Description

Deletes resume from database and Cloudinary.

---

# 📂 Folder Structure

```bash
src/
│
├── controllers/
├── models/
├── routes/
├── middlewares/
├── utils/
├── validations/
├── config/
└── app.js
```

---

# 🧪 API Testing

You can test all APIs using:

- Postman
- Thunder Client
- Insomnia

---

# ☁️ Features

- JWT Authentication
- User Registration & Login
- Complete Profile Management
- Profile Image Upload
- Resume Upload
- Cloudinary Integration
- MongoDB Database
- Error Handling
- Secure APIs

---

# 👨‍💻 Developed By

Harsh Jain , Farhan Khan , Anjali Agarwal

---
```
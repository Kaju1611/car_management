# 🚗 CarVault — Car Management Application

A production-ready full-stack Car Management Application where authenticated users can create, view, search, update, and delete their own car listings with up to 10 images each.

---

## 🔗 Live Deployment

| Service  | URL |
|----------|-----|
| Frontend | `https://your-app.vercel.app` |
| Backend  | `https://your-app.onrender.com` |
| API Docs | `https://your-app.onrender.com/api/docs` |

---

## 🛠 Tech Stack

| Layer        | Technology |
|-------------|------------|
| Frontend    | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend     | Node.js, Express.js, TypeScript |
| Database    | MongoDB Atlas |
| Auth        | JWT (Bearer tokens) |
| File Storage| Cloudinary |
| Docs        | Swagger / OpenAPI 3.0 |
| Deployment  | Vercel (frontend), Render (backend) |

---

## 📁 Project Structure

```
car-management/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts             # MongoDB connection
│   │   │   └── cloudinary.ts     # Cloudinary + Multer setup
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts # JWT verify middleware
│   │   │   └── error.middleware.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   └── Car.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   └── car.controller.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   └── car.routes.ts
│   │   ├── docs/
│   │   │   └── swagger.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── app/
    │   ├── login/page.tsx
    │   ├── register/page.tsx
    │   ├── dashboard/page.tsx
    │   ├── create-car/page.tsx
    │   ├── car/[id]/page.tsx
    │   └── edit-car/[id]/page.tsx
    ├── components/
    │   ├── Navbar.tsx
    │   ├── CarCard.tsx
    │   ├── CarForm.tsx
    │   ├── SearchBar.tsx
    │   └── ui/               # shadcn/ui components
    ├── hooks/
    │   ├── useAuth.ts
    │   └── useDebounce.ts
    ├── services/
    │   └── api.ts            # Axios instance + API calls
    ├── types/
    │   └── index.ts
    ├── lib/
    │   └── utils.ts
    └── middleware.ts
```

---

## 🚀 Local Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account
- Cloudinary account

---

### 1. Clone & Install

```bash
git clone https://github.com/your-username/car-management.git
cd car-management
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/car-management
JWT_SECRET=your_super_secret_32_char_minimum_key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

```bash
npm run dev
# Server runs on http://localhost:5000
# Swagger docs at http://localhost:5000/api/docs
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

```bash
npm run dev
# App runs on http://localhost:3000
```

---

## 🌐 API Endpoints

### Authentication

| Method | Endpoint             | Description         | Auth |
|--------|---------------------|---------------------|------|
| POST   | `/api/auth/register`| Register user        | ❌   |
| POST   | `/api/auth/login`   | Login user           | ❌   |
| GET    | `/api/auth/me`      | Get current user     | ✅   |

### Cars

| Method | Endpoint               | Description                    | Auth |
|--------|------------------------|-------------------------------|------|
| GET    | `/api/cars`            | Get all cars (paginated)       | ✅   |
| POST   | `/api/cars`            | Create car (multipart/form)    | ✅   |
| GET    | `/api/cars/search?q=`  | Search cars                    | ✅   |
| GET    | `/api/cars/stats`      | Dashboard statistics           | ✅   |
| GET    | `/api/cars/:id`        | Get single car                 | ✅   |
| PUT    | `/api/cars/:id`        | Update car                     | ✅   |
| DELETE | `/api/cars/:id`        | Delete car                     | ✅   |

### Query Parameters

| Param   | Default     | Description |
|---------|-------------|-------------|
| `page`  | `1`         | Page number |
| `limit` | `10`        | Items per page |
| `sort`  | `-createdAt`| Sort order (`-createdAt` or `createdAt`) |
| `q`     | —           | Search query |

### Request/Response Examples

**Register**
```json
POST /api/auth/register
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}

Response 201:
{
  "success": true,
  "message": "Account created successfully",
  "token": "eyJhbGci...",
  "user": { "_id": "...", "fullName": "John Doe", "email": "john@example.com" }
}
```

**Create Car** (multipart/form-data)
```
POST /api/cars
Authorization: Bearer <token>
Content-Type: multipart/form-data

title: "2024 Toyota RAV4 XLE"
description: "Excellent condition, one owner"
tags[company]: "Toyota"
tags[carType]: "SUV"
tags[dealer]: "AutoPlex Motors"
tags[customTags]: ["awd", "heated-seats"]
images: [file1.jpg, file2.jpg]
```

**Search**
```
GET /api/cars/search?q=toyota&page=1&limit=10
Authorization: Bearer <token>
```

---

## ☁️ Deployment

### Backend → Render

1. Push backend code to GitHub
2. Create new **Web Service** on [render.com](https://render.com)
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables from `.env.example`

### Frontend → Vercel

1. Push frontend code to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Set root directory to `frontend`
4. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-render-app.onrender.com`
5. Deploy

---

## 🔒 Security Features

- **JWT Authentication** — Bearer token on all protected routes
- **Password Hashing** — bcryptjs with salt rounds 12
- **Rate Limiting** — 200 req/15min globally; 20 req/15min on auth routes
- **Helmet** — Sets secure HTTP headers
- **CORS** — Restricted to frontend origin
- **Input Validation** — express-validator on all inputs
- **Image Validation** — MIME type + size checks (max 10MB)
- **Owner Checks** — All car operations verify `createdBy === userId`

---

## ✨ Features

- 🔐 JWT authentication (register, login, protected routes)
- 🚗 Full CRUD for car listings
- 🖼 Upload up to 10 images per car via Cloudinary
- 🔍 Global search across title, description, company, dealer, type, tags
- 📄 Server-side pagination with sort (newest/oldest)
- 📊 Dashboard statistics (total cars, companies, dealers)
- 🎠 Image carousel with thumbnails on detail page (Embla Carousel)
- 🌙 Dark mode toggle (persisted to localStorage)
- ⏱ Debounced search (300ms)
- 📱 Fully responsive mobile design
- ⚡ Loading skeletons
- 🔔 Toast notifications (sonner)
- 📖 Swagger/OpenAPI documentation at `/api/docs`

---

## 📦 Environment Variables Reference

### Backend

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `FRONTEND_URL` | Frontend URL for CORS |
| `NODE_ENV` | `development` or `production` |

### Frontend

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |

---

## 📮 Postman Collection

Import `CarVault.postman_collection.json` from the repo root. Set the `baseUrl` variable to your API URL and `token` variable after login.

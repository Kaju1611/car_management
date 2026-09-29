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

| Layer          | Technology |
|----------------|------------|
| Frontend       | Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend        | Node.js, Express.js, TypeScript |
| Database       | MongoDB Atlas (production) / MongoDB via Docker (local dev) |
| Auth           | JWT (Bearer tokens) |
| File Storage   | Cloudinary |
| Docs           | Swagger / OpenAPI 3.0 |
| Deployment     | Vercel (frontend), Render (backend) |
| Local Database | Docker + Docker Compose |

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
├── frontend/
│   ├── app/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── create-car/page.tsx
│   │   ├── car/[id]/page.tsx
│   │   └── edit-car/[id]/page.tsx
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── CarCard.tsx
│   │   ├── CarForm.tsx
│   │   ├── SearchBar.tsx
│   │   └── ui/               # shadcn/ui components
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useDebounce.ts
│   ├── services/
│   │   └── api.ts            # Axios instance + API calls
│   ├── types/
│   │   └── index.ts
│   ├── lib/
│   │   └── utils.ts
│   └── middleware.ts
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Local Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Cloudinary account
- **Either** a MongoDB Atlas account **or** Docker Desktop (for a local MongoDB container — see below)

---

### 1. Clone & Install

```bash
git clone https://github.com/your-username/car-management.git
cd car-management
```

### 2. Set Up MongoDB

Choose one:

- **Option A — MongoDB Atlas** (no Docker needed): create a free cluster and grab your connection string.
- **Option B — Docker (recommended for local dev)**: see [🐳 Docker Setup](#-docker-setup-mongodb-only) below. Do this before starting the backend.

### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your own values:

```env
PORT=5000

# Option A — MongoDB Atlas
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/car-management

# Option B — Local MongoDB via Docker (see Docker Setup section)
# MONGO_URI=mongodb://admin:change-this-password@localhost:27017/car-management?authSource=admin

JWT_SECRET=your_super_secret_32_char_minimum_key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

> ⚠️ **`.env.example` must only ever contain placeholder values.** Never commit real database credentials, API keys, or secrets into a tracked file, even one named `.env.example` — anything committed to a public repo should be treated as permanently public, since it stays in git history even after you delete it later.

```bash
npm run dev
# Server runs on http://localhost:5000
# Swagger docs at http://localhost:5000/api/docs
```

### 4. Frontend Setup

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

## 🐳 Docker Setup (Full Stack)

CarVault can run entirely in Docker — MongoDB, backend, and frontend together on one shared network — with a single command. No local Node install, no manually running three terminals.

### Prerequisites

- Docker Desktop installed and running

### Project Docker files

```
car-management/
├── docker-compose.yml       # orchestrates all three services
├── .env                     # your real secrets (create from .env.example, gitignored)
├── .env.example             # placeholder template for the above
│
├── backend/
│   ├── Dockerfile
│   └── .dockerignore
│
└── frontend/
    ├── Dockerfile
    ├── .dockerignore
    └── next.config.ts       # must have output: 'standalone'
```

### 1. Create your root `.env` file

At the **project root** (same folder as `docker-compose.yml`), copy the template:

```bash
cp .env.example .env
```

Edit `.env` with real values:

```env
JWT_SECRET=your_own_long_random_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> This root `.env` is only for Docker Compose. It's separate from `backend/.env` and `frontend/.env.local`, which are used when running those apps directly with `npm run dev`.

### 2. Start everything

```bash
docker compose up --build
```

This builds and starts all three containers:

| Container | Port | Role |
|---|---|---|
| `carvault-mongodb` | 27017 | Database |
| `carvault-backend` | 5000 | API |
| `carvault-frontend` | 3000 | Web app |

Once it's running, open `http://localhost:3000`.

### How the containers talk to each other

- **Backend → MongoDB**: uses the Compose service name `mongodb` as the hostname (`mongodb://admin:...@mongodb:27017/...`), *not* `localhost` — inside a container, `localhost` means the container itself, not its neighbors. Docker Compose gives every service a DNS entry on the shared network instead.
- **Browser → Backend**: the frontend's `NEXT_PUBLIC_API_URL` stays as `http://localhost:5000`, because that value is baked into the JavaScript that runs in your **browser** on your host machine — the browser has no idea what the `backend` service name means, only Docker's internal network does.
- **Backend CORS**: `FRONTEND_URL` on the backend must match the origin your browser actually loads (`http://localhost:3000`), or requests from the frontend get blocked by CORS.

### Useful Commands

| Command | Description |
|---|---|
| `docker compose up --build` | Build and start all three services |
| `docker compose up -d` | Start in the background |
| `docker compose down` | Stop and remove containers (MongoDB data is kept) |
| `docker compose down -v` | ⚠️ Stop and **delete** the MongoDB volume — destroys all data |
| `docker ps` | Check which containers are running |
| `docker compose logs -f backend` | Tail backend logs |
| `docker compose logs -f mongodb` | Tail MongoDB logs |
| `docker volume ls` | List Docker volumes |

### Verifying it actually works

```bash
# Backend health check
curl http://localhost:5000/health

# All three containers should show "Up"
docker ps
```

Then open `http://localhost:3000`, register a user, and confirm the data actually lands in MongoDB:

```bash
docker exec -it carvault-mongodb mongosh -u admin -p
```
```js
use car-management
db.users.find().pretty()
```

### Notes

- This setup is for **local development**. In production, use MongoDB Atlas rather than a single Docker MongoDB container — Atlas handles backups, monitoring, and scaling that one container does not.
- Always change the default `admin` / `change-this-password` credentials before sharing this project publicly.
- Docker is optional: you can still run everything locally with `npm run dev` in `backend/` and `frontend/`, using MongoDB Atlas or a standalone local MongoDB install instead (see [Backend Setup](#3-backend-setup) → Option A).

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
```

Response `201`:

```json
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

## 👥 Multi-user Behavior

- Any authenticated user can **view** all car listings, not just their own.
- A user can **edit** or **delete** only cars where `createdBy === userId`.
- Ownership is enforced on the backend for every write operation, regardless of what the frontend UI shows or hides.

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

### Database — Production

Use **MongoDB Atlas** in production. Don't rely on a single local Docker MongoDB container as your only production database — it has no built-in backups, replication, or monitoring.

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
- 🐳 One-command local MongoDB via Docker

---

## 📦 Environment Variables Reference

### Backend

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string (Atlas or local Docker) |
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

---

## 🛡️ Production Checklist

- [ ] Change `JWT_SECRET` to a strong, unique value
- [ ] Use strong MongoDB credentials (not the local Docker defaults)
- [ ] Restrict MongoDB network access (IP allowlist on Atlas)
- [ ] Configure CORS to only allow your production frontend origin
- [ ] Enable HTTPS everywhere
- [ ] Verify rate limiting is active
- [ ] Set up MongoDB Atlas backups
- [ ] Add database indexes for frequently queried fields (`createdBy`, `createdAt`)
- [ ] Test auth and ownership checks end-to-end
- [ ] Remove any development credentials from environment configs
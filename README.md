# 🔍 Roboflow Image Metadata Filtering Interface

A full-stack web app that lets you filter and explore your Roboflow dataset images by **time of day**, **GPS location**, **custom tags**, and **dataset split** — built with React, Node.js, and Docker.

> Built as a portfolio project inspired by Roboflow's engineering roadmap.

## ✨ Features

- 🕒 **Time of Day filtering** — Morning, Afternoon, Evening, Night
- 📍 **GPS radius filtering** — Filter images by geographic location
- 🏷️ **Tag-based filtering** — Mix and match custom tags
- 🔀 **Dataset split** — Filter by Train / Validation / Test
- 🔎 **Filename search** — Quick text search across images
- 🖼️ **Annotation viewer** — Click any image to see its annotations
- ⚡ **5-minute server-side cache** — Fast responses without hammering Roboflow API
- 🐳 **Docker support** — One command to run everything

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Roboflow account with a project ([sign up free](https://app.roboflow.com))
- Docker & Docker Compose (for containerized deployment)

---

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/roboflow-filter-app
cd roboflow-filter-app
```

### 2. Set up environment variables

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```
ROBOFLOW_API_KEY=your_api_key_here      # Settings → API Keys
ROBOFLOW_WORKSPACE=your_workspace_slug  # From your Roboflow URL
ROBOFLOW_PROJECT=your_project_slug      # From your Roboflow URL
```

**Where to find these values:**
- Go to [app.roboflow.com](https://app.roboflow.com)
- Your URL looks like: `app.roboflow.com/MY-WORKSPACE/MY-PROJECT`
- API Key: Settings → Roboflow API

---

### 3a. Run locally (without Docker)

**Backend:**
```bash
cd backend
npm install
npm run dev       # Starts on http://localhost:4000
```

**Frontend (in a new terminal):**
```bash
cd frontend
npm install
npm run dev       # Starts on http://localhost:3000
```

### 3b. Run with Docker

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

---

## 🏗️ Architecture

```
React Frontend (Vite)
  ↓ REST API
Express Backend (Node.js)
  ↓ Roboflow REST API
Roboflow Cloud
```

**Stack:**
- Frontend: React 18, Vite, plain CSS
- Backend: Node.js, Express, Axios
- Deployment: Docker, Nginx

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/images` | Fetch filtered images (see query params below) |
| GET | `/api/images/:id` | Get image detail + annotations |
| GET | `/api/project` | Get project info |
| GET | `/api/tags` | List all available tags |
| DELETE | `/api/cache` | Clear server cache |

**Filter query params for `/api/images`:**

| Param | Type | Example |
|-------|------|---------|
| `timeOfDay` | string | `morning` |
| `tag` | string | `car,truck` |
| `split` | string | `train` |
| `search` | string | `street` |
| `lat`, `lng`, `radius` | number | `37.77,-122.41,5` |
| `page` | number | `2` |
| `limit` | number | `24` |

---

## 📁 Project Structure

```
roboflow-filter-app/
├── backend/
│   ├── server.js          # Express API + filtering logic
│   ├── roboflow.js        # Roboflow API wrapper + normalization
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── api/client.js
│   │   └── components/
│   │       ├── FilterPanel.jsx
│   │       ├── ImageGallery.jsx
│   │       ├── ImageCard.jsx
│   │       └── ImageModal.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── Dockerfile
└── docker-compose.yml
```

---

## 🛣️ Roadmap / Potential Improvements

- [ ] Add map view for GPS-tagged images (Leaflet.js)
- [ ] Export filtered subset as a new Roboflow dataset version
- [ ] Bulk tag editing
- [ ] Annotation overlay on image preview
- [ ] TensorFlow.js in-browser inference preview
- [ ] Firebase Firestore for storing custom user tags

---

## 📝 License

MIT

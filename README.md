# CoursePilot

CoursePilot is a full-stack study tracker for YouTube course playlists. It lets you import a playlist, track completion, weight important videos, and estimate how long the course will take based on your daily study time.

## Local Setup

1. Start MongoDB locally or use a MongoDB Atlas connection string.
2. Create `server/.env` from `server/.env.example`.
3. Fill in the required values:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/coursepilot
JWT_SECRET=your_jwt_secret_here
YOUTUBE_API_KEY=your_youtube_api_key_here
CORS_ORIGIN=http://localhost:5173
```

4. Install dependencies and start the backend:

```powershell
Set-Location "c:\Users\ASHISH KUMAR\OneDrive\Documents\Desktop\KJSCE\kj stuff\TY Full Syllabus\course-pilot\server"
npm install
npm run dev
```

5. In a second terminal, start the frontend:

```powershell
Set-Location "c:\Users\ASHISH KUMAR\OneDrive\Documents\Desktop\KJSCE\kj stuff\TY Full Syllabus\course-pilot\client"
npm install
npm run dev
```

## Environment Variables

Server:

- `MONGODB_URI` - MongoDB connection string.
- `JWT_SECRET` - Secret used to sign auth tokens.
- `YOUTUBE_API_KEY` - YouTube Data API v3 key.
- `PORT` - Server port, defaults to `5000`.
- `CORS_ORIGIN` - Allowed frontend origin or comma-separated origins.

Client:

- `VITE_API_BASE_URL` - Optional API base URL, defaults to `http://localhost:5000/api`.

## Checks

```powershell
Set-Location "c:\Users\ASHISH KUMAR\OneDrive\Documents\Desktop\KJSCE\kj stuff\TY Full Syllabus\course-pilot\client"
npm run lint
npm run build
```

The server currently has no automated test suite, but the backend modules now validate their environment on startup and the client passes lint/build locally.
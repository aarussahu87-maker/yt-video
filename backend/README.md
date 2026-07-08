Backend for YT Video prototype

Requirements
- Node 14+
- npm install
- ffmpeg installed on the host (required for mp3 transcoding)

Install
- cd to repo root
- npm install --prefix backend

Run (development)
- npm run start

Notes
- The backend serves the frontend static files and exposes /api/preview and /api/download
- preview: POST /api/preview { url }
- download: GET /api/download?url=...&itag=...&type=audio|video

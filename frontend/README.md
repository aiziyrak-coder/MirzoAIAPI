# Mirzo AI Frontend

Frontend React application for Mirzo AI Platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
VITE_API_URL=http://localhost:8000/api
```

3. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## Development

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Build for production
npm run preview  # Preview production build
```

## Backend Connection

Frontend connects to backend at: `http://localhost:8000/api`

Make sure backend is running before starting frontend.

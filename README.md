# NFL Game Tracker

A lightweight web application that connects to the NFL API on RapidAPI to display real-time game status and play-by-play data for in-play events.

## Features

- 🏈 Real-time NFL game status tracking
- 📊 Live play-by-play updates
- 🎲 Random game selection from current games
- ⏱️ Auto-refresh every 30 seconds
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive design

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Get RapidAPI Key

1. Visit [RapidAPI NFL API](https://rapidapi.com/Creativesdev/api/nfl-api-data/)
2. Subscribe to the API
3. Copy your API key

### 3. Configure Environment

Create a `.env.local` file in the root directory:

```bash
RAPIDAPI_KEY=your-rapidapi-key-here
```

### 4. Run the Application

#### Development Mode (Both Frontend and Backend)
```bash
npm run dev:full
```

#### Or run separately:
```bash
# Terminal 1 - Backend Server
npm run server

# Terminal 2 - Frontend
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## API Endpoints

- `GET /api/games/current` - Get all current games
- `GET /api/games/random-current` - Get a random current game with details
- `GET /api/games/:gameId` - Get specific game details

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Express.js, Node.js
- **Styling**: Tailwind CSS
- **API**: RapidAPI NFL API
- **HTTP Client**: Axios

## Project Structure

```
nfl-game-tracker/
├── src/
│   └── app/
│       └── page.tsx          # Main game tracker component
├── server.js                 # Express backend server
├── package.json
└── README.md
```

## Usage

1. Click "Get Random Current Game" to fetch a random NFL game
2. The app will display:
   - Game status (Live, Timeout, Halftime, Final)
   - Team names and scores
   - Current quarter and time
   - Recent plays with player information
3. The app automatically refreshes every 30 seconds

## Notes

- The app filters for games that are currently in progress, recently finished, or in timeout
- Player names and numbers are displayed when available
- The UI is fully responsive and works on mobile devices
- All API calls are made through the Express backend to avoid CORS issues# nfl-supabase

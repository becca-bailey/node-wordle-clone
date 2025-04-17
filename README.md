# Wordle Clone

A React-based Wordle game clone with a Node.js backend. This application allows users to play the popular word-guessing game Wordle, with features like word validation, letter status tracking, and keyboard input.

## Features

- Random word generation
- Word validation
- Letter status tracking (correct, present, absent)
- Keyboard input support
- Responsive design
- Celebration sound on win
- Mobile-friendly layout

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/wordle-clone.git
cd wordle-clone
```

2. Install dependencies:

```bash
npm install
cd client
npm install
cd ..
```

## API Key Setup

This application uses the WordsAPI from RapidAPI for word validation. To set up your API key:

1. Sign up for a free account at [RapidAPI](https://rapidapi.com/signup)
2. Subscribe to [WordsAPI](https://rapidapi.com/dpventures/api/wordsapi) (there's a free tier available)
3. Get your API key from RapidAPI
4. Create a `.env` file in the root directory:

```bash
touch .env
```

5. Add your API key to the `.env` file:

```
RAPID_API_KEY=your_api_key_here
```

## Running the Application

### Development Mode

To run both the frontend and backend in development mode:

```bash
npm start
```

This will:

- Start the backend server on http://localhost:3000
- Start the Vite dev server on http://localhost:5173

### Individual Components

To run just the backend server:

```bash
npm run server
```

To run just the frontend development server:

```bash
npm run client
```

## Project Structure

```
wordle-clone/
├── client/                 # React frontend
│   ├── src/               # Source files
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── server.mjs             # Backend server
└── package.json           # Project configuration
```

## API Endpoints

- `GET /api/random-word` - Returns a random 5-letter word
- `GET /api/validate-word/:word` - Validates if a word exists

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

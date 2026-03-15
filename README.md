# Notess 📝

A clean and simple notes web app built with the MERN stack.

## Features

- **Create, edit, and delete notes** — full CRUD functionality
- **Tags** — organize notes by category: `Work`, `Personal`, `Idea`, or `Urgent`
- **Date created** — each note displays when it was made

## Tech Stack

**Frontend**
- React (built with Vite)

**Backend**
- Node.js
- Express
- MongoDB

## Getting Started

### Prerequisites

- Node.js
- Docker & Docker Compose (handles MongoDB automatically)

### Installation

1. Clone the repository

```bash
git clone https://github.com/your-username/notess.git
cd notess
```

2. Install all dependencies from the root

```bash
npm run install:all
```

3. Create a `.env` file in the `backend` directory using the provided template

```bash
cp backend/.env.example backend/.env
```

The default values work out of the box for local development:

```env
MONGO_URI=mongodb://localhost:27017/notesdb
PORT=5000
```

4. Start MongoDB with Docker

```bash
docker compose up -d
```

5. Run the app

```bash
npm run dev
```

The app will be running at `http://localhost:5173`

## Screenshots

> Coming soon

## Deployment

Deployment coming soon.

## License

This project is licensed under the [MIT License](LICENSE.txt).
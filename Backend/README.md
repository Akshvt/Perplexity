# Perplexity Clone Backend

This is the backend service for a Perplexity clone, providing an AI-powered chat interface with internet research capabilities.

## Features
- **Authentication System** with email verification (JWT & bcrypt)
- **Chat with AI** powered by Google GenAI (Langchain)
- **Internet Research Feature** integrated with the AI
- **Chat History & Message Storage** via MongoDB

## Tech Stack
- Express.js
- Node.js
- Mongoose (MongoDB)
- LangChain Google GenAI
- JWT Authentication
- Nodemailer

## Data Models

### User
- `_id`, `username`, `email`, `password`
- `verified` (Email link verification)
- `createdAt`, `updatedAt`

### Chat Model
- `_id`, `user`, `title`
- `createdAt`, `updatedAt`

### Message
- `_id`, `chat`, `content`
- `role`: [user, ai]

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

BASE_URL=https://your-backend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app

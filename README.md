# Dora API

Lightweight AI Agent API with memory and tools. Built by **Rahaman Leon**.

## Features

- Chat with AI (Groq integration)
- Persistent memory (MongoDB)
- Tool system (web search, URL fetch, image generation)
- Dynamic skill loading
- RESTful API

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd dora-api
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
GROQ_API_KEY=your_key_here
MONGODB_URI=mongodb://localhost:27017/dora
PORT=3000
```

### 3. Get Groq API Key

Sign up at https://console.groq.com/ and get a free API key.

### 4. MongoDB Setup

**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas (Free Tier)**
1. Create account at https://www.mongodb.com/atlas
2. Create free cluster
3. Get connection string
4. Update MONGODB_URI

### 5. Run

```bash
npm start
```

Server runs on http://localhost:3000

## API Endpoints

### Chat

```bash
POST /chat
Content-Type: application/json

{
  "user_id": "user123",
  "message": "Hello, what's the weather?"
}
```

Response:
```json
{
  "reply": "Hello! I can help you...",
  "actions": [],
  "memory_update": []
}
```

### Memory

```bash
# Get memory
GET /chat/memory?user_id=user123

# Save memory
POST /chat/memory
{
  "user_id": "user123",
  "key": "preference",
  "value": "likes coffee"
}

# Delete memory
DELETE /chat/memory?user_id=user123&key=preference

# Get conversation history
GET /chat/history?user_id=user123
```

### Tools

```bash
# List available tools
GET /tools

# Execute tool directly
POST /tools/execute
{
  "user_id": "user123",
  "tool_name": "webSearch",
  "params": { "query": "weather today" }
}

# Load dynamic skill
POST /tools/skill
{
  "name": "mySkill",
  "code": "async function(params) { return { result: 'Hello!' }; }"
}
```

## Response Format

All chat responses follow this format:

```json
{
  "reply": "The AI's response text",
  "actions": [
    { "type": "webSearch", "result": {...} }
  ],
  "memory_update": [
    { "key": "user_name", "value": "John" }
  ]
}
```

## Deploy to Render

### 1. Create Render Account
https://render.com

### 2. Create Web Service

- Connect GitHub repository
- Build Command: `npm install`
- Start Command: `npm start`

### 3. Add Environment Variables

In Render dashboard, add:
- `GROQ_API_KEY`
- `MONGODB_URI` (use MongoDB Atlas)
- `NODE_ENV=production`

### 4. Set Port

Render sets `PORT` env variable automatically.

## Project Structure

```
dora-api/
├── src/
│   ├── app.js           # Main entry
│   ├── controllers/     # Route handlers
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── models/          # MongoDB schemas
│   ├── tools/           # Base tools
│   ├── skills/          # Dynamic skills
│   └── utils/           # Utilities
├── .env
├── .env.example
├── package.json
└── README.md
```

## Available Tools

| Tool | Description |
|------|-------------|
| webSearch | Search the web (DuckDuckGo) |
| fetchUrl | Fetch and parse web pages |
| generateImage | Generate images (placeholder) |

## Dynamic Skills

Add custom skills dynamically:

```javascript
POST /tools/skill
{
  "name": "calculator",
  "code": "async function(params) { return { result: eval(params.expr) }; }"
}
```

Then use it in chat or execute directly.

## License

MIT - Rahaman Leon

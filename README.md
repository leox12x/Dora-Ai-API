# Dora API

Lightweight AI Agent API with memory and tools. Built by **Rahaman Leon**.

## Features

- Chat with AI (Groq, OpenAI, OpenRouter, HuggingFace, Ollama)
- Persistent memory (MongoDB)
- Tool system (web search, URL fetch, image generation)
- Dynamic skill loading
- RESTful API

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/rahamanleon/Dora-Ai-API.git
cd Dora-Ai-API
npm install
```

### 2. Configure

```bash
cp config.example.json config.json
```

Edit `config.json` with your API keys:

```json
{
  "aiProviders": {
    "groq": {
      "apiKey": "YOUR_GROQ_API_KEY"
    }
  },
  "activeProvider": "groq",
  "database": {
    "mongodb": "mongodb://localhost:27017/dora"
  }
}
```

### 3. Get API Keys

**Groq (Free tier)** - https://console.groq.com/
**OpenAI** - https://platform.openai.com/
**OpenRouter (Free models)** - https://openrouter.ai/
**Ollama (Local)** - https://ollama.com/

### 4. MongoDB Setup

**Local:**
```bash
mongod
```

**Atlas (Cloud - Free):**
1. Create account: https://www.mongodb.com/atlas
2. Create free cluster
3. Get connection string
4. Update config.json

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

### Memory

```bash
GET /chat/memory?user_id=user123
POST /chat/memory (body: user_id, key, value)
DELETE /chat/memory?user_id=user123&key=preference
GET /chat/history?user_id=user123
```

### Tools

```bash
GET /tools
POST /tools/execute (body: user_id, tool_name, params)
POST /tools/skill (body: name, code)
```

## Deploy to Render

1. Push to GitHub
2. Create Web Service on Render
3. Build: `npm install`
4. Start: `npm start`
5. Add environment variable: `CONFIG_JSON` (paste your config.json content)

## Project Structure

```
Dora-Ai-API/
├── src/
│   ├── app.js           # Main entry
│   ├── config.js        # Config loader
│   ├── controllers/     # Route handlers
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── models/          # MongoDB schemas
│   ├── tools/           # Base tools
│   ├── skills/          # Dynamic skills
│   └── utils/           # Utilities
├── config.example.json  # Example config
├── config.json          # Your config (gitignored)
├── package.json
└── README.md
```

## License

MIT - Rahaman Leon

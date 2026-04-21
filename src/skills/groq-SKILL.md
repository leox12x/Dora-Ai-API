---
name: groq
description: Groq API integration for Dora API. Handles chat completions with function calling support using Llama models.
homepage: https://console.groq.com
metadata: {"nanobot":{"emoji":"⚡","requires":{"env":["GROQ_API_KEY"]}}}
---

# Groq Service

Groq API integration for AI chat completions with function calling support.

## Usage

```javascript
const groqService = require('./services/groqService');

const messages = [
  { role: 'system', content: 'You are helpful.' },
  { role: 'user', content: 'Hello!' }
];

const tools = toolRegistry.getDefinitions();
const response = await groqService.chat(messages, tools);
```

## Configuration

Set in `.env`:
```
GROQ_API_KEY=your_key_here
```

## Default Settings

| Parameter | Value |
|-----------|-------|
| Model | llama-3.1-8b-instant |
| Temperature | 0.7 |
| Max Tokens | 1024 |
| Tool Choice | auto |

## Request Format

```json
{
  "model": "llama-3.1-8b-instant",
  "messages": [...],
  "temperature": 0.7,
  "max_tokens": 1024,
  "tools": [...],
  "tool_choice": "auto"
}
```

## Response Format

```json
{
  "choices": [
    {
      "message": {
        "content": "...",
        "tool_calls": [...]
      },
      "finish_reason": "stop"
    }
  ]
}
```

## Error Handling

Returns descriptive errors:
- `GROQ_API_KEY not configured`
- `Groq API error: {status} - {message}`

## Available Models

- llama-3.1-8b-instant (default)
- llama-3.1-70b-versatile
- llama-3.1-405b-reasoning

## Rate Limits

Groq free tier: 30 requests/minute

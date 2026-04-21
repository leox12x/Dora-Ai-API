---
name: agent
description: Main AI agent service for Dora API. Handles chat with memory, tool calls, and conversation management using Groq LLM.
homepage: https://github.com/leoxs/dora-api
metadata: {"nanobot":{"emoji":"🤖","requires":{"env":["GROQ_API_KEY"]}}}
---

# Agent Service

Main AI agent that orchestrates chat, memory, and tools using Groq LLM.

## Usage

```javascript
const agentService = require('./services/agentService');

// Chat with the agent
const result = await agentService.chat(userId, message);
```

## Response Format

```json
{
  "reply": "The agent's response",
  "actions": [
    { "type": "webSearch", "result": {...} }
  ],
  "memory_update": [
    { "key": "user_name", "value": "John" }
  ]
}
```

## System Prompt

The agent uses this system prompt:
- Role: Dora, helpful AI assistant
- Available tools: webSearch, fetchUrl, generateImage
- Rules: Use tools for real-time info, save preferences to memory

## Conversation Flow

1. Fetch recent memory
2. Load conversation history
3. Build messages array
4. Get tool definitions
5. Call Groq API
6. Execute tool calls if any
7. Parse structured response
8. Save conversation
9. Save memory updates
10. Return response

## Dependencies

- groqService: LLM API calls
- memoryService: Memory persistence
- toolRegistry: Tool execution

---
name: chatController
description: Chat API controller for Dora API. Handles user messages, memory management, and conversation history.
homepage: https://github.com/leoxs/dora-api
metadata: {"nanobot":{"emoji":"💬","requires":{"modules":["express"]}}}
---

# Chat Controller

Handles chat API endpoints for Dora API.

## Endpoints

### POST /chat
Send a message and get AI response.

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user123", "message": "Hello!"}'
```

**Request:**
```json
{
  "user_id": "user123",
  "message": "Hello!"
}
```

**Response:**
```json
{
  "reply": "Hello! How can I help?",
  "actions": [],
  "memory_update": []
}
```

**Validation:**
- user_id: required
- message: required, string, max 10000 chars

### GET /chat/memory
Get user memories.

```bash
curl "http://localhost:3000/chat/memory?user_id=user123&limit=10"
```

**Query Parameters:**
| Param | Required | Description |
|-------|----------|-------------|
| user_id | Yes | User identifier |
| key | No | Filter by memory key |
| limit | No | Max memories (default: 20) |

### POST /chat/memory
Save a memory.

```bash
curl -X POST http://localhost:3000/chat/memory \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user123", "key": "name", "value": "John"}'
```

**Request:**
```json
{
  "user_id": "user123",
  "key": "name",
  "value": "John"
}
```

### DELETE /chat/memory
Delete memories.

```bash
curl -X DELETE "http://localhost:3000/chat/memory?user_id=user123&key=name"
```

### GET /chat/history
Get conversation history.

```bash
curl "http://localhost:3000/chat/history?user_id=user123&limit=50"
```

**Query Parameters:**
| Param | Required | Description |
|-------|----------|-------------|
| user_id | Yes | User identifier |
| limit | No | Max messages (default: 50) |

## Dependencies

- agentService: Chat processing
- memoryService: Memory operations

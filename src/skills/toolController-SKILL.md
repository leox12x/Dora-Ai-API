---
name: toolController
description: Tool API controller for Dora API. Manages tool listing, execution, and dynamic skill loading.
homepage: https://github.com/leoxs/dora-api
metadata: {"nanobot":{"emoji":"🔧","requires":{"modules":["express"]}}}
---

# Tool Controller

Handles tool management API endpoints.

## Endpoints

### GET /tools
List all available tools and definitions.

```bash
curl http://localhost:3000/tools
```

**Response:**
```json
{
  "tools": ["webSearch", "fetchUrl", "generateImage"],
  "definitions": [...]
}
```

### POST /tools/execute
Execute a tool directly.

```bash
curl -X POST http://localhost:3000/tools/execute \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user123", "tool_name": "webSearch", "params": {"query": "weather"}}'
```

**Request:**
```json
{
  "user_id": "user123",
  "tool_name": "webSearch",
  "params": { "query": "weather" }
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "success": true,
    "results": [...],
    "query": "weather"
  }
}
```

### POST /tools/skill
Load and save a dynamic skill (persistent).

```bash
curl -X POST http://localhost:3000/tools/skill \
  -H "Content-Type: application/json" \
  -d '{
    "name": "calculator",
    "code": "async function(params) { return { result: params.a + params.b }; }"
  }'
```

**Request:**
```json
{
  "name": "calculator",
  "code": "async function(params) { ... }"
}
```

**Notes:**
- Saves skill to `src/skills/{name}.js`
- Auto-loads after save
- Persists across restarts

### POST /tools/register
Register a dynamic skill (in-memory only).

```bash
curl -X POST http://localhost:3000/tools/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "tempCalc",
    "code": "async function(params) { return { celsius: params.fahrenheit - 32 } * 5/9; }"
  }'
```

**Notes:**
- Registers tool in memory
- Does NOT persist to disk
- Lost on restart

## Dependencies

- toolRegistry: Tool management
- agentService: Tool execution with memory tracking

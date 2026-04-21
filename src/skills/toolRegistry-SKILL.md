---
name: toolRegistry
description: Dynamic tool and skill registry for Dora API. Manages tool loading, registration, and execution with dynamic skill loading support.
homepage: https://github.com/leoxs/dora-api
metadata: {"nanobot":{"emoji":"🔧","requires":{"bins":["fs","path"]}}}
---

# Tool Registry

Dynamic tool and skill registry for Dora API.

## Usage

```javascript
const toolRegistry = require('./services/toolRegistry');

// Initialize (loads all tools from src/tools/)
await toolRegistry.loadTools();

// Register a custom tool
toolRegistry.register('myTool', async (params) => {
  return { result: 'Hello!' };
});

// Execute a tool
const result = await toolRegistry.execute('webSearch', { query: 'test' });

// List all tools
const tools = toolRegistry.list();

// Get tool definitions (for LLM function calling)
const definitions = toolRegistry.getDefinitions();

// Load dynamic skill
await toolRegistry.loadSkill('calculator', 'async function(params) { return { result: params.a + params.b }; }');

// Save skill to file
await toolRegistry.saveSkill('mySkill', 'async function(params) { return { data: params }; }');
```

## Directory Structure

```
src/
├── tools/           # Base tools (auto-loaded)
│   ├── webSearch.js
│   ├── fetchUrl.js
│   └── generateImage.js
└── skills/          # Dynamic skills (persistent)
    └── .gitkeep
```

## Auto-loaded Tools

| Tool | Description |
|------|-------------|
| webSearch | Search DuckDuckGo |
| fetchUrl | Fetch web page content |
| generateImage | Generate images (placeholder) |

## Tool Definition Format

```json
{
  "type": "function",
  "function": {
    "name": "toolName",
    "description": "tool description",
    "parameters": {
      "type": "object",
      "properties": {
        "query": { "type": "string", "description": "Input" }
      }
    }
  }
}
```

## Dynamic Skills API

### POST /tools/skill

Load a skill dynamically:
```json
{
  "name": "calculator",
  "code": "async function(params) { return { result: params.a + params.b }; }"
}
```

### POST /tools/execute

Execute any registered tool:
```json
{
  "user_id": "user123",
  "tool_name": "webSearch",
  "params": { "query": "weather today" }
}
```

## Error Handling

| Error | Cause |
|-------|-------|
| Tool not found: {name} | Tool not registered |
| Failed to load tool {file} | Tool file error |

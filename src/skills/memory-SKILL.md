---
name: memory
description: Persistent memory service for Dora API. Stores user memories and conversation history in MongoDB.
homepage: https://github.com/leoxs/dora-api
metadata: {"nanobot":{"emoji":"🧠","requires":{"env":["MONGODB_URI"]}}}
---

# Memory Service

Persistent memory system using MongoDB for storing user memories and conversation history.

## Usage

```javascript
const memoryService = require('./services/memoryService');

// Save a memory
await memoryService.save(userId, key, value);

// Get memories
const memories = await memoryService.get(userId);

// Get recent memories
const recent = await memoryService.getRecent(userId, 5);

// Save conversation
await memoryService.saveConversation(userId, 'user', message);

// Get history
const history = await memoryService.getConversationHistory(userId, 20);

// Clear memory
await memoryService.clearMemory(userId);
```

## Methods

### save(userId, key, value)
Save a key-value memory for a user.

### get(userId, key)
Get all memories for user, optionally filtered by key.

### getRecent(userId, limit)
Get most recent memories (default limit: 10).

### getContext(userId, query)
Search memories by key or value using regex.

### saveConversation(userId, role, content)
Save a conversation message with role ('user' or 'assistant').

### getConversationHistory(userId, limit)
Get conversation messages (default limit: 20).

### clearMemory(userId, key)
Clear memories, optionally by key only.

## MongoDB Collections

| Collection | Schema | Description |
|------------|--------|-------------|
| memories | Memory | Key-value user memories |
| conversations | Conversation | Chat history |

## Memory Model

```javascript
{
  user_id: String,
  key: String,
  value: String,
  timestamp: Date
}
```

## Conversation Model

```javascript
{
  user_id: String,
  role: String,  // 'user' | 'assistant'
  content: String,
  timestamp: Date
}
```

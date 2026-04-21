---
name: Conversation-model
description: MongoDB Conversation model for Dora API. Stores user/assistant chat messages with timestamps.
homepage: https://github.com/leoxs/dora-api
metadata: {"nanobot":{"emoji":"💬","requires":{"env":["MONGODB_URI"]}}}
---

# Conversation Model

MongoDB schema for storing conversation history.

## Schema

```javascript
const conversationSchema = new mongoose.Schema({
  user_id: { type: String, required: true, index: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

conversationSchema.index({ user_id: 1, timestamp: -1 });
```

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user_id | String | Yes | User identifier |
| role | String | Yes | 'user' or 'assistant' |
| content | String | Yes | Message content |
| timestamp | Date | No | Auto-set creation time |

## Valid Roles

| Role | Description |
|------|-------------|
| user | User message |
| assistant | AI response |

## Indexes

| Index | Fields | Purpose |
|-------|--------|---------|
| Primary | user_id | User lookup |
| Compound | user_id + timestamp | Chronological history |

## Usage

```javascript
const Conversation = require('../models/Conversation');

// Create
const conv = new Conversation({ 
  user_id: 'user123', 
  role: 'user', 
  content: 'Hello!' 
});
await conv.save();

// Get history (newest first, then reverse)
const history = await Conversation.find({ user_id: 'user123' })
  .sort({ timestamp: -1 })
  .limit(20)
  .then(docs => docs.reverse());

// Delete all for user
await Conversation.deleteMany({ user_id: 'user123' });
```

## Context Window

Default history limit: 20 messages (configurable in memoryService).

## Relationship

Used by memoryService for conversation context and context injection into LLM prompts.

---
name: Memory-model
description: MongoDB Memory model for Dora API. Stores user key-value memories with timestamps.
homepage: https://github.com/leoxs/dora-api
metadata: {"nanobot":{"emoji":"💾","requires":{"env":["MONGODB_URI"]}}}
---

# Memory Model

MongoDB schema for storing user key-value memories.

## Schema

```javascript
const memorySchema = new mongoose.Schema({
  user_id: { type: String, required: true, index: true },
  key: { type: String, required: true },
  value: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

memorySchema.index({ user_id: 1, key: 1 });
```

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user_id | String | Yes | User identifier |
| key | String | Yes | Memory key name |
| value | String | Yes | Memory value |
| timestamp | Date | No | Auto-set creation time |

## Indexes

| Index | Fields | Purpose |
|-------|--------|---------|
| Primary | user_id | User lookup |
| Compound | user_id + key | Filtered user memory lookup |

## Usage

```javascript
const Memory = require('../models/Memory');

// Create
const memory = new Memory({ user_id: 'user123', key: 'name', value: 'John' });
await memory.save();

// Find
const memories = await Memory.find({ user_id: 'user123' });

// Find with key filter
const prefs = await Memory.find({ user_id: 'user123', key: 'preference' });

// Sort by newest first
const recent = await Memory.find({ user_id: 'user123' })
  .sort({ timestamp: -1 })
  .limit(10);

// Delete
await Memory.deleteMany({ user_id: 'user123', key: 'old_key' });
```

## Relationship

Used by memoryService for persistent user memories and preferences.

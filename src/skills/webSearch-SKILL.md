---
name: webSearch
description: Search the web using DuckDuckGo HTML (free, no API key required). Returns top 5 results with title, snippet, and link.
homepage: https://html.duckduckgo.com
metadata: {"nanobot":{"emoji":"🔍","requires":{"bins":["curl","axios","cheerio"]}}}
---

# Web Search

Search the web using DuckDuckGo HTML interface. Free, no API key required.

## Usage

```javascript
// Via toolRegistry in dora-api
const result = await toolRegistry.execute('webSearch', { query: 'weather today' });
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | Search query |

## Response Format

```json
{
  "success": true,
  "results": [
    {
      "title": "Result Title",
      "snippet": "Description snippet...",
      "link": "https://example.com"
    }
  ],
  "query": "search terms"
}
```

## Error Response

```json
{
  "success": false,
  "error": "Error message",
  "query": "search terms"
}
```

## Implementation

- Uses DuckDuckGo HTML endpoint
- Returns top 5 results
- Requires: axios, cheerio
- Timeout: 10 seconds

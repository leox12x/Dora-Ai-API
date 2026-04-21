---
name: fetchUrl
description: Fetch and parse web pages, extracting title and main content from any URL. Strips scripts, styles, and navigation elements.
homepage: https://example.com
metadata: {"nanobot":{"emoji":"🌐","requires":{"bins":["curl","axios","cheerio"]}}}
---

# Fetch URL

Fetch and parse web pages, extracting title and main content.

## Usage

```javascript
// Via toolRegistry in dora-api
const result = await toolRegistry.execute('fetchUrl', { url: 'https://example.com' });
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| url | string | Yes | Full URL to fetch |

## Response Format

```json
{
  "success": true,
  "title": "Page Title",
  "content": "Main content extracted from paragraphs and headings...",
  "url": "https://example.com"
}
```

## Error Response

```json
{
  "success": false,
  "error": "Error message",
  "url": "https://example.com"
}
```

## Implementation

- Fetches HTML with axios
- Parses with cheerio
- Removes: scripts, styles, nav, footer, header
- Extracts: title, paragraphs (p), headings (h1-h4), list items (li)
- Content truncated to 3000 characters
- Timeout: 15 seconds

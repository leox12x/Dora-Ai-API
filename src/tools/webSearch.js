const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../config');

function randomUA() {
  const uas = config.tools.webSearch.userAgents;
  return uas[Math.floor(Math.random() * uas.length)];
}

function cleanLink(href) {
  if (!href) return null;
  try {
    const url = new URL(href, 'https://html.duckduckgo.com');
    const uddg = url.searchParams.get('uddg');
    return uddg ? decodeURIComponent(uddg) : href;
  } catch {
    return href;
  }
}

async function fetchDDG(query, maxResults) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  const response = await axios.get(url, {
    headers: {
      'User-Agent': randomUA(),
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    timeout: config.tools.fetchUrl.timeout,
  });

  const $ = cheerio.load(response.data);
  const results = [];

  $('.result').each((i, el) => {
    if (results.length >= maxResults) return false;

    const title   = $(el).find('.result__title a').text().trim();
    const snippet = $(el).find('.result__snippet').text().trim();
    const rawHref = $(el).find('.result__title a').attr('href');
    const link    = cleanLink(rawHref);

    const isAd = $(el).hasClass('result--ad');
    if (!title || isAd) return;

    results.push({ title, snippet: snippet || null, link });
  });

  return results;
}

async function webSearch(query, { maxResults, retries = 2 } = {}) {
  maxResults = maxResults || config.tools.webSearch.maxResults;

  if (!query || typeof query !== 'string' || !query.trim()) {
    return { success: false, error: 'Query must be a non-empty string', query };
  }

  query = query.trim();
  maxResults = Math.min(Math.max(1, maxResults), 10);

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
        console.warn(`[webSearch] Retry ${attempt}/${retries} for: "${query}"`);
      }

      const results = await fetchDDG(query, maxResults);

      if (results.length === 0) {
        return { success: true, results: [], query, note: 'No results found' };
      }

      return { success: true, results, query };

    } catch (err) {
      lastError = err;
      if (err.response?.status >= 400 && err.response?.status < 500) break;
    }
  }

  console.error(`[webSearch] Failed after ${retries + 1} attempts:`, lastError.message);
  return {
    success: false,
    error: lastError.message,
    query,
  };
}

module.exports = webSearch;

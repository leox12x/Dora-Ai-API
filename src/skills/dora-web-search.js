/**
 * Skill: dora-web-search
 * Adopts ClawHub web-search principles for Dora API
 * Search -> Fetch -> Synthesize workflow
 */

const axios = require('axios');
const cheerio = require('cheerio');

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/123.0',
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function cleanLink(href) {
  if (!href) return null;
  try {
    const url = new URL(href, 'https://html.duckduckgo.com');
    const uddg = url.searchParams.get('uddg');
    return uddg ? decodeURIComponent(uddg) : href;
  } catch { return href; }
}

/**
 * Search DuckDuckGo HTML and fetch top results
 * @param {string} query - Search query
 * @param {number} maxResults - Max results (1-10)
 * @returns {Promise<{success, results, query, error}>}
 */
async function search(query, { maxResults = 5, retries = 2 } = {}) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return { success: false, error: 'Query must be a non-empty string', query: '' };
  }

  query = query.trim();
  maxResults = Math.min(Math.max(1, maxResults), 10);
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }

      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const response = await axios.get(url, {
        headers: { 'User-Agent': randomUA(), 'Accept': 'text/html' },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const results = [];

      $('.result').each((i, el) => {
        if (results.length >= maxResults) return false;
        const title   = $(el).find('.result__title a').text().trim();
        const snippet = $(el).find('.result__snippet').text().trim();
        const rawHref = $(el).find('.result__title a').attr('href');
        const link    = cleanLink(rawHref);
        const isAd    = $(el).hasClass('result--ad');
        if (!title || isAd) return;
        results.push({ title, snippet: snippet || null, link });
      });

      if (results.length === 0) {
        return { success: true, results: [], query, note: 'No results found' };
      }

      return { success: true, results, query };

    } catch (err) {
      lastError = err;
      if (err.response?.status >= 400 && err.response?.status < 500) break;
    }
  }

  return { success: false, error: lastError.message, query };
}

/**
 * Fetch readable content from a URL
 * @param {string} url - URL to fetch
 * @param {number} maxChars - Max characters (default 3000)
 * @returns {Promise<{success, title, content, url, error}>}
 */
async function fetch(url, { maxChars = 3000 } = {}) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    $('script, style, nav, footer, header, aside, form').remove();

    const title = $('title').text().trim();
    let content = '';
    $('p, h1, h2, h3, h4, li').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 20) {
        content += text + '\n';
      }
    });

    return {
      success: true,
      title,
      content: content.substring(0, maxChars),
      url
    };
  } catch (err) {
    return { success: false, error: err.message, url };
  }
}

/**
 * Full research workflow: search -> fetch top 3 -> synthesize
 * Returns structured results with fetched content
 */
async function research(query, { maxResults = 5, maxCharsPerPage = 2000 } = {}) {
  const searchResult = await search(query, { maxResults });
  if (!searchResult.success || searchResult.results.length === 0) {
    return searchResult;
  }

  const fetchedPages = [];
  const toFetch = searchResult.results.slice(0, 3);

  for (const page of toFetch) {
    const fetched = await fetch(page.link, { maxChars: maxCharsPerPage });
    fetchedPages.push({
      title: page.title,
      link: page.link,
      snippet: page.snippet,
      content: fetched.success ? fetched.content : null,
      fetchError: fetched.success ? null : fetched.error
    });
  }

  return {
    success: true,
    query,
    results: searchResult.results,
    pages: fetchedPages,
    note: 'Fetched top 3 pages. Use fetched content for synthesis.'
  };
}

module.exports = { search, fetch, research };
